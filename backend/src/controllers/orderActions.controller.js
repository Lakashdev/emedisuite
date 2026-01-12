import { prisma } from "../config/prisma.js";

function msHours(h) {
  return h * 60 * 60 * 1000;
}

async function getSettings(tx) {
  const s = await tx.storeSettings.findFirst();
  if (s) return s;
  return tx.storeSettings.create({
    data: { deliveryFeeInside: 0, deliveryFeeOutside: 0, cancelWindowHours: 24, defaultReturnWindowDays: 3 },
  });
}

export const cancelMyOrder = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { reason } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    const settings = await getSettings(tx);

    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return { error: { status: 404, message: "order not found" } };
    if (order.userId !== userId) return { error: { status: 403, message: "forbidden" } };

    if (order.status === "Cancelled") {
      return { error: { status: 400, message: "order already cancelled" } };
    }

    // Cancellation allowed only in early stages
    const cancellableStatuses = new Set(["Placed", "Confirmed"]);
    if (!cancellableStatuses.has(order.status)) {
      return { error: { status: 400, message: "order cannot be cancelled at this stage" } };
    }

    // 24-hour (configurable) window from placedAt
    const deadline = new Date(order.placedAt).getTime() + msHours(settings.cancelWindowHours);
    if (Date.now() > deadline) {
      return { error: { status: 400, message: "cancellation window expired" } };
    }

    // restore stock
    for (const item of order.items) {
      if (item.variantId) {
        const v = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { id: true, stock: true },
        });
        if (v) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { stock: v.stock + item.quantity },
          });
        }
      } else {
        const p = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, baseStock: true },
        });
        if (p) {
          await tx.product.update({
            where: { id: p.id },
            data: { baseStock: p.baseStock + item.quantity },
          });
        }
      }
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "Cancelled",
        cancelledAt: new Date(),
        cancelReason: reason || null,
      },
      include: { items: true },
    });

    return { order: updated };
  });

  if (result.error) return res.status(result.error.status).json({ message: result.error.message });
  return res.json({ order: result.order });
};


function msDays(d) {
  return d * 24 * 60 * 60 * 1000;
}

export const createReturnRequest = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // items: [{ orderItemId, quantity }]
  const { reason, note, items } = req.body;

  if (!reason || typeof reason !== "string") {
    return res.status(400).json({ message: "reason is required" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items must be a non-empty array" });
  }

  const result = await prisma.$transaction(async (tx) => {
    const settings = await getSettings(tx);

    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return { error: { status: 404, message: "order not found" } };
    if (order.userId !== userId) return { error: { status: 403, message: "forbidden" } };

    // Return only after delivery
    if (order.status !== "Delivered") {
      return { error: { status: 400, message: "returns allowed only after delivery" } };
    }
    if (!order.deliveredAt) {
      return { error: { status: 400, message: "deliveredAt missing; admin must mark delivered" } };
    }

    // Validate return window (defaultReturnWindowDays or product-specific override later)
    const baseDeadline = new Date(order.deliveredAt).getTime() + msDays(settings.defaultReturnWindowDays);
    if (Date.now() > baseDeadline) {
      return { error: { status: 400, message: "return window expired" } };
    }

    // Map order items for lookup
    const orderItemById = new Map(order.items.map((oi) => [oi.id, oi]));

    // Ensure requested items exist and are returnable
    const requestLines = [];
    for (const row of items) {
      const orderItemId = row.orderItemId;
      const qty = Number(row.quantity);

      if (!orderItemId || !qty || qty < 1) {
        return { error: { status: 400, message: "each item needs orderItemId and quantity>=1" } };
      }

      const oi = orderItemById.get(orderItemId);
      if (!oi) return { error: { status: 400, message: "invalid orderItemId" } };
      if (qty > oi.quantity) return { error: { status: 400, message: "return quantity exceeds purchased quantity" } };

      const product = await tx.product.findUnique({
        where: { id: oi.productId },
        select: { id: true, name: true, isReturnable: true, returnWindowDays: true },
      });
      if (!product) return { error: { status: 400, message: "product not found" } };

      if (!product.isReturnable) {
        return { error: { status: 400, message: `product not returnable: ${product.name}` } };
      }

      // If product has its own window, enforce stricter rule
      const windowDays = product.returnWindowDays ?? settings.defaultReturnWindowDays;
      const deadline = new Date(order.deliveredAt).getTime() + msDays(windowDays);
      if (Date.now() > deadline) {
        return { error: { status: 400, message: `return window expired for: ${product.name}` } };
      }

      requestLines.push({ oi, qty });
    }

    // Create return request
    const rr = await tx.returnRequest.create({
      data: {
        orderId: order.id,
        userId,
        status: "Requested",
        reason,
        note: note || null,
      },
    });

    for (const line of requestLines) {
      const oi = line.oi;

      await tx.returnRequestItem.create({
        data: {
          returnRequestId: rr.id,
          orderItemId: oi.id,
          productId: oi.productId,
          variantId: oi.variantId,
          quantity: line.qty,
          productName: oi.productName,
          variantName: oi.variantName,
          unitPrice: oi.unitPrice,
        },
      });
    }

    const full = await tx.returnRequest.findUnique({
      where: { id: rr.id },
      include: { items: true },
    });

    return { returnRequest: full };
  });

  if (result.error) return res.status(result.error.status).json({ message: result.error.message });
  return res.status(201).json({ returnRequest: result.returnRequest });
};

