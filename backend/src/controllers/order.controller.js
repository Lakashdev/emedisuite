import { prisma } from "../config/prisma.js";

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${y}${m}${d}-${rand}`;
}

async function getSettings(tx) {
  const existing = await tx.storeSettings.findFirst();
  if (existing) return existing;

  return tx.storeSettings.create({
    data: { deliveryFeeInside: 0, deliveryFeeOutside: 0 },
  });
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
    deliveryZone, // "inside" | "outside"
    notes,
  } = req.body;

  if (!fullName || !phone || !addressLine || !deliveryZone) {
    return res.status(400).json({ message: "fullName, phone, addressLine, deliveryZone are required" });
  }
  if (!["inside", "outside"].includes(deliveryZone)) {
    return res.status(400).json({ message: "deliveryZone must be inside or outside" });
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
        return { error: { status: 400, message: "cart is empty" } };
      }

      // re-check stock and compute totals
      let subtotal = 0;

      for (const item of cart.items) {
        const qty = item.quantity;

        if (item.variantId) {
          const v = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true, stock: true, price: true, name: true, productId: true },
          });

          if (!v) return { error: { status: 400, message: "variant not found" } };
          if (v.productId !== item.productId) return { error: { status: 400, message: "variant mismatch" } };
          if (v.stock < qty) return { error: { status: 400, message: "insufficient stock for variant" } };

          subtotal += v.price * qty;
        } else {
          const p = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, baseStock: true, basePrice: true, name: true },
          });

          if (!p) return { error: { status: 400, message: "product not found" } };
          if (p.baseStock < qty) return { error: { status: 400, message: "insufficient stock for product" } };

          subtotal += p.basePrice * qty;
        }
      }

      // MVP: discountTotal = 0 (we will add discount logic later)
      const discountTotal = 0;

      const settings = await getSettings(tx);
      const deliveryFee =
        deliveryZone === "inside" ? settings.deliveryFeeInside : settings.deliveryFeeOutside;

      const total = subtotal - discountTotal + deliveryFee;

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
          city: city || "Kathmandu",
          deliveryZone,
          notes: notes || null,
        },
      });

      // create order items and decrement stock
      for (const item of cart.items) {
        const qty = item.quantity;

        if (item.variantId) {
          const v = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true, stock: true, price: true, name: true, productId: true },
          });

          if (!v || v.stock < qty) return { error: { status: 400, message: "insufficient stock" } };

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              variantId: item.variantId,
              productName: item.product.name,
              variantName: v.name,
              unitPrice: v.price,
              quantity: qty,
              lineTotal: v.price * qty,
            },
          });

          await tx.productVariant.update({
            where: { id: v.id },
            data: { stock: v.stock - qty },
          });
        } else {
          const p = await tx.product.findUnique({
            where: { id: item.productId },
            select: { id: true, baseStock: true, basePrice: true, name: true },
          });

          if (!p || p.baseStock < qty) return { error: { status: 400, message: "insufficient stock" } };

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              variantId: null,
              productName: p.name,
              variantName: null,
              unitPrice: p.basePrice,
              quantity: qty,
              lineTotal: p.basePrice * qty,
            },
          });

          await tx.product.update({
            where: { id: p.id },
            data: { baseStock: p.baseStock - qty },
          });
        }
      }

      // clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      const fullOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      return { order: fullOrder };
    });

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    return res.status(201).json({ order: result.order });
  } catch (error) {
    console.error("placeOrder error:", error);
    return res.status(500).json({ message: "internal server error" });
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
