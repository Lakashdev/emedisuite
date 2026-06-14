import { prisma } from "../config/prisma.js";
import { sendOrderEmails } from "../utils/orderEmail.js";
import { getDeliveryQuote } from "../services/delivery.service.js";
import { getProductPricing } from "../utils/productPricing.js";

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${y}${m}${d}-${rand}`;
}

export const placeOrder = async (req, res) => {
  const userId = req.user.id;

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
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw httpError(400, "cart is empty");
      }

      // re-check stock and compute totals
      let subtotal = 0;
      let discountTotal = 0;
      const finalItems = [];

      for (const item of cart.items) {
        const qty = item.quantity;

        if (item.variantId) {
          const v = await tx.productVariant.findUnique({
            where: { id: item.variantId },
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

          if (!v) throw httpError(400, "variant not found");
          if (v.productId !== item.productId) throw httpError(400, "variant mismatch");
          if (v.stock < qty) throw httpError(400, "insufficient stock for variant");

          const pricing = getProductPricing(v.product, v.price);
          subtotal += pricing.originalUnitPrice * qty;
          discountTotal += pricing.discountPerUnit * qty;
          finalItems.push({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            variantName: v.name,
            unitPrice: pricing.unitPrice,
            quantity: qty,
          });
        } else {
          const p = await tx.product.findUnique({
            where: { id: item.productId },
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

          if (!p) throw httpError(400, "product not found");
          if (p.baseStock < qty) throw httpError(400, "insufficient stock for product");

          const pricing = getProductPricing(p, p.basePrice);
          subtotal += pricing.originalUnitPrice * qty;
          discountTotal += pricing.discountPerUnit * qty;
          finalItems.push({
            productId: item.productId,
            variantId: null,
            productName: p.name,
            variantName: null,
            unitPrice: pricing.unitPrice,
            quantity: qty,
          });
        }
      }

      const quote = await getDeliveryQuote(tx, deliveryZoneId, subtotal - discountTotal);
      const deliveryFee = quote.deliveryFee;

      const total = subtotal - discountTotal + deliveryFee;

      // Claim the cart rows before creating an order. A concurrent request that
      // loaded the same cart will delete zero rows and must abort.
      const claimedCart = await tx.cartItem.deleteMany({
        where: { id: { in: cart.items.map((item) => item.id) }, cartId: cart.id },
      });
      if (claimedCart.count !== cart.items.length) {
        throw httpError(409, "cart changed while placing the order; please try again");
      }

      const orderNumber = generateOrderNumber();

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

      // create order items and atomically decrement stock
      for (const item of finalItems) {
        const stockUpdate = item.variantId
          ? await tx.productVariant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            })
          : await tx.product.updateMany({
              where: { id: item.productId, baseStock: { gte: item.quantity } },
              data: { baseStock: { decrement: item.quantity } },
            });

        if (stockUpdate.count !== 1) {
          throw httpError(409, `insufficient stock for ${item.productName}`);
        }

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.unitPrice * item.quantity,
          },
        });
      }

      const fullOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      return { order: fullOrder };
    });

    try {
      const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      await sendOrderEmails(result.order, userRecord?.email ?? null);
    } catch (emailErr) {
      console.error("sendOrderEmails error:", emailErr);
    }

    return res.status(201).json({ order: result.order });
  } catch (error) {
    console.error("placeOrder error:", error);
    return res.status(error.status || 500).json({ message: error.status ? error.message : "internal server error" });
  }
};

export const listMyOrders = async (req, res) => {
  const userId = req.user.id;

  const items = await prisma.order.findMany({
    where: { userId },
    orderBy: { placedAt: "desc" }, // better than createdAt for orders
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      subtotal: true,
      discountTotal: true,
      deliveryFee: true,
      placedAt: true,
      deliveredAt: true,
      cancelledAt: true,
      items: { select: { id: true } }, // just count-able
    },
  });

  res.json({ items });
};


export const getOrderById = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return res.status(404).json({ message: "order not found" });

  // customer can only view their own; admin can view all
  if (role !== "admin" && order.userId !== userId) {
    return res.status(403).json({ message: "forbidden" });
  }

  res.json({ order });
};
