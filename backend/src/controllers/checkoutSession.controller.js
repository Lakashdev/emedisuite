import { prisma } from "../config/prisma.js";
import { sendOrderEmails } from "../utils/orderEmail.js";
import { getDeliveryQuote } from "../services/delivery.service.js";
import { getProductPricing } from "../utils/productPricing.js";

const SESSION_TTL_MINUTES = 30;

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isExpired(expiresAt) {
  return new Date(expiresAt).getTime() <= Date.now();
}

async function getAvailableStock(tx, productId, variantId) {
  if (variantId) {
    const v = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        stock: true,
        price: true,
        name: true,
        productId: true,
        product: {
          select: {
            discountType: true,
            discountValue: true,
            discountStartAt: true,
            discountEndAt: true,
          },
        },
      },
    });
    if (!v) return { ok: false, message: "variant not found" };
    if (v.productId !== productId) return { ok: false, message: "variant does not belong to product" };
    return {
      ok: true,
      stock: v.stock,
      ...getProductPricing(v.product, v.price),
      variantName: v.name,
    };
  }

  const p = await tx.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      baseStock: true,
      basePrice: true,
      name: true,
      discountType: true,
      discountValue: true,
      discountStartAt: true,
      discountEndAt: true,
    },
  });
  if (!p) return { ok: false, message: "product not found" };
  return {
    ok: true,
    stock: p.baseStock,
    ...getProductPricing(p, p.basePrice),
    variantName: null,
  };
}

export const createCheckoutSession = async (req, res) => {
  const userId = req.user.id;
  const { cartItemIds, deliveryZoneId } = req.body;

  if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
    return res.status(400).json({ message: "cartItemIds must be a non-empty array" });
  }
  try {
    const session = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart) return { error: { status: 400, message: "cart not found" } };

      const selected = cart.items.filter((it) => cartItemIds.includes(it.id));
      if (selected.length === 0) return { error: { status: 400, message: "no valid cart items selected" } };

      // Validate stock at session creation time (does NOT decrement stock)
      const warnings = [];
      for (const it of selected) {
        const stockCheck = await getAvailableStock(tx, it.productId, it.variantId);
        if (!stockCheck.ok) {
          return { error: { status: 400, message: stockCheck.message } };
        }
        if (stockCheck.stock <= 0) {
          return { error: { status: 400, message: "item out of stock" } };
        }
        if (it.quantity > stockCheck.stock) {
          warnings.push({
            cartItemId: it.id,
            message: "quantity exceeds current stock (will be capped at confirm)",
          });
        }
      }

      // One active session per user: cancel existing active sessions
      await tx.checkoutSession.updateMany({
        where: { userId, status: "active" },
        data: { status: "cancelled" },
      });

      const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

      const created = await tx.checkoutSession.create({
        data: {
          userId,
          status: "active",
          deliveryZoneId: deliveryZoneId || null,
          expiresAt,
          items: {
            create: selected.map((it) => ({
              cartItemId: it.id,
              productId: it.productId,
              variantId: it.variantId,
              quantity: it.quantity,
            })),
          },
        },
      });

      return { session: created, warnings };
    });

    if (session.error) return res.status(session.error.status).json({ message: session.error.message });

    return res.status(201).json({
      sessionId: session.session.id,
      expiresAt: session.session.expiresAt,
      warnings: session.warnings || [],
    });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const getCheckoutSession = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const session = await prisma.checkoutSession.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              basePrice: true,
              baseStock: true,
              discountType: true,
              discountValue: true,
              discountStartAt: true,
              discountEndAt: true,
            },
          },
          variant: { select: { id: true, name: true, price: true, stock: true } },
          cartItem: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) return res.status(404).json({ message: "checkout session not found" });
  if (session.userId !== userId) return res.status(403).json({ message: "forbidden" });

  // expire automatically if time passed
  if (session.status === "active" && isExpired(session.expiresAt)) {
    await prisma.checkoutSession.update({
      where: { id: session.id },
      data: { status: "expired" },
    });
    return res.status(400).json({ message: "checkout session expired" });
  }

  // compute totals preview
  let subtotal = 0;
  let discountTotal = 0;
  for (const it of session.items) {
    const originalUnitPrice = it.variantId ? (it.variant?.price ?? 0) : (it.product?.basePrice ?? 0);
    const pricing = getProductPricing(it.product, originalUnitPrice);
    subtotal += pricing.originalUnitPrice * it.quantity;
    discountTotal += pricing.discountPerUnit * it.quantity;
  }
  const discountedSubtotal = subtotal - discountTotal;
  const quote = session.deliveryZoneId
    ? await getDeliveryQuote(prisma, session.deliveryZoneId, discountedSubtotal)
    : null;
  const deliveryFee = quote?.deliveryFee ?? 0;
  const total = subtotal - discountTotal + deliveryFee;

  res.json({
    session,
    pricing: {
      subtotal,
      discountTotal,
      deliveryFee,
      total,
    },
  });
};

export const cancelCheckoutSession = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const session = await prisma.checkoutSession.findUnique({ where: { id } });
  if (!session) return res.status(404).json({ message: "checkout session not found" });
  if (session.userId !== userId) return res.status(403).json({ message: "forbidden" });

  if (session.status !== "active") {
    return res.status(400).json({ message: "session is not active" });
  }

  await prisma.checkoutSession.update({
    where: { id },
    data: { status: "cancelled" },
  });

  res.json({ ok: true });
};

export const confirmCheckoutSession = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const {
    fullName,
    phone,
    addressLine,
    area,
    landmark,
    city,
    deliveryZoneId,
    notes,
  } = req.body;

  if (!fullName || !phone || !addressLine || !deliveryZoneId) {
    return res.status(400).json({ message: "fullName, phone, addressLine, deliveryZoneId are required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.checkoutSession.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              cartItem: true,
              product: true,
              variant: true,
            },
          },
        },
      });

      if (!session) return { error: { status: 404, message: "checkout session not found" } };
      if (session.userId !== userId) return { error: { status: 403, message: "forbidden" } };
      if (session.status !== "active") return { error: { status: 400, message: "session is not active" } };
      if (isExpired(session.expiresAt)) {
        await tx.checkoutSession.update({ where: { id: session.id }, data: { status: "expired" } });
        return { error: { status: 400, message: "checkout session expired" } };
      }

      if (!session.items.length) {
        return { error: { status: 400, message: "session has no items" } };
      }

      // Claim the session so two confirmations cannot create duplicate orders.
      const claimedSession = await tx.checkoutSession.updateMany({
        where: {
          id: session.id,
          userId,
          status: "active",
          expiresAt: { gt: new Date() },
        },
        data: { status: "processing" },
      });
      if (claimedSession.count !== 1) {
        throw httpError(409, "checkout session is already being processed");
      }

      // Re-check stock and compute subtotal (final gate)
      let subtotal = 0;
      let discountTotal = 0;
      const finalItems = [];

      for (const it of session.items) {
        const stockCheck = await getAvailableStock(tx, it.productId, it.variantId);
        if (!stockCheck.ok) return { error: { status: 400, message: stockCheck.message } };

        if (stockCheck.stock <= 0) {
          return { error: { status: 400, message: "item out of stock" } };
        }

        const qty = Math.min(it.quantity, stockCheck.stock);
        const unitPrice = stockCheck.unitPrice;
        subtotal += stockCheck.originalUnitPrice * qty;
        discountTotal += stockCheck.discountPerUnit * qty;

        finalItems.push({
          sessionItemId: it.id,
          cartItemId: it.cartItemId,
          productId: it.productId,
          variantId: it.variantId,
          productName: it.product?.name || "Unknown",
          variantName: stockCheck.variantName,
          unitPrice,
          quantity: qty,
          lineTotal: unitPrice * qty,
        });

        // If qty had to be capped, update the session item quantity
        if (qty !== it.quantity) {
          await tx.checkoutSessionItem.update({
            where: { id: it.id },
            data: { quantity: qty },
          });
        }
      }

      const discountedSubtotal = subtotal - discountTotal;
      const quote = await getDeliveryQuote(tx, deliveryZoneId, discountedSubtotal);
      const deliveryFee = quote.deliveryFee;
      const total = subtotal - discountTotal + deliveryFee;

      // Create order
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "Placed",
          subtotal,
          discountTotal,
          deliveryFee,
          total,
          paymentMethod: "COD",
          fullName,
          phone,
          addressLine,
          area: area || null,
          landmark: landmark || null,
          city: quote.zone.city,
          deliveryZone: quote.zone.areaType,
          deliveryZoneId: quote.zone.id,
          deliveryTierSnapshot: quote.zone.tier,
          deliveryCitySnapshot: quote.zone.city,
          notes: notes || null,
        },
      });

      // Create order items + decrement stock
      for (const fi of finalItems) {
        const stockUpdate = fi.variantId
          ? await tx.productVariant.updateMany({
              where: { id: fi.variantId, stock: { gte: fi.quantity } },
              data: { stock: { decrement: fi.quantity } },
            })
          : await tx.product.updateMany({
              where: { id: fi.productId, baseStock: { gte: fi.quantity } },
              data: { baseStock: { decrement: fi.quantity } },
            });

        if (stockUpdate.count !== 1) {
          throw httpError(409, `insufficient stock for ${fi.productName}`);
        }

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: fi.productId,
            variantId: fi.variantId,
            productName: fi.productName,
            variantName: fi.variantName,
            unitPrice: fi.unitPrice,
            quantity: fi.quantity,
            lineTotal: fi.lineTotal,
          },
        });
      }

      // Remove only ordered items from cart
      await tx.cartItem.deleteMany({
        where: { id: { in: finalItems.map((x) => x.cartItemId) } },
      });

      // Mark session completed and store delivery info in session
      await tx.checkoutSession.update({
        where: { id: session.id },
        data: {
          status: "completed",
          deliveryZone: quote.zone.areaType,
          deliveryZoneId: quote.zone.id,
          fullName,
          phone,
          addressLine,
          area: area || null,
          landmark: landmark || null,
          city: quote.zone.city,
          notes: notes || null,
        },
      });

      const fullOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      return { order: fullOrder };
    });

    if (result.error) return res.status(result.error.status).json({ message: result.error.message });

    // Send confirmation emails (non-blocking — never fail the response)
   try {
      const orderWithItems = result.order;
      const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      console.log("About to send order emails");
      console.log("Order ID:", orderWithItems?.id);
      console.log("Customer email from DB:", userRecord?.email || null);
      console.log("Admin email from env:", process.env.ADMIN_EMAIL || null);
      console.log("MAIL_FROM:", process.env.MAIL_FROM || null);

      await sendOrderEmails(orderWithItems, userRecord?.email ?? null);
    } catch (emailErr) {
      console.error("sendOrderEmails error:", emailErr);
    }

    return res.status(201).json({ order: result.order });
  } catch (err) {
    console.error("confirmCheckoutSession error:", err);
    return res.status(err.status || 500).json({ message: err.status ? err.message : "internal server error" });
  }
};
