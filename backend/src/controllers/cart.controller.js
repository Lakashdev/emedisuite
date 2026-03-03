import { prisma } from "../config/prisma.js";

async function getOrCreateCart(userId) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  return cart;
}

async function getAvailableStock(productId, variantId) {
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stock: true, productId: true },
    });
    if (!variant) return { ok: false, message: "variant not found" };
    if (variant.productId !== productId) return { ok: false, message: "variant does not belong to product" };
    return { ok: true, stock: variant.stock };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { baseStock: true },
  });
  if (!product) return { ok: false, message: "product not found" };
  return { ok: true, stock: product.baseStock };
}

export const getMyCart = async (req, res) => {
  const userId = req.user.id;

  const cart = await getOrCreateCart(userId);

  const fullCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, basePrice: true, baseStock: true } },
          variant: { select: { id: true, name: true, price: true, stock: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  res.json({ cart: fullCart });
};

export const addCartItem = async (req, res) => {
  const userId = req.user.id;
  const { productId, variantId = null, quantity } = req.body;

  const qty = Number(quantity);
  if (!productId || !qty || qty < 1) {
    return res.status(400).json({ message: "productId and quantity>=1 are required" });
  }

  const cart = await getOrCreateCart(userId);

  const stockCheck = await getAvailableStock(productId, variantId);
  if (!stockCheck.ok) return res.status(400).json({ message: stockCheck.message });

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId_variantId: {
        cartId: cart.id,
        productId,
        variantId,
      },
    },
  });

  const desiredQty = (existing?.quantity || 0) + qty;
  const finalQty = Math.min(desiredQty, stockCheck.stock);

  const item = await prisma.cartItem.upsert({
    where: {
      cartId_productId_variantId: {
        cartId: cart.id,
        productId,
        variantId,
      },
    },
    update: { quantity: finalQty },
    create: { cartId: cart.id, productId, variantId, quantity: finalQty },
  });

  const capped = finalQty < desiredQty;

  res.status(201).json({
    item,
    warning: capped ? "quantity capped to available stock" : null,
  });
};

export const updateCartItemQty = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  const qty = Number(quantity);
  if (!qty || qty < 1) {
    return res.status(400).json({ message: "quantity must be >= 1" });
  }

  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findFirst({
    where: { id, cartId: cart.id },
  });
  if (!item) return res.status(404).json({ message: "cart item not found" });

  const stockCheck = await getAvailableStock(item.productId, item.variantId);
  if (!stockCheck.ok) return res.status(400).json({ message: stockCheck.message });

  const finalQty = Math.min(qty, stockCheck.stock);

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: finalQty },
  });

  const capped = finalQty < qty;

  res.json({
    item: updated,
    warning: capped ? "quantity capped to available stock" : null,
  });
};

export const removeCartItem = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const cart = await getOrCreateCart(userId);

  const item = await prisma.cartItem.findFirst({
    where: { id, cartId: cart.id },
  });
  if (!item) return res.status(404).json({ message: "cart item not found" });

  await prisma.cartItem.delete({ where: { id: item.id } });
  res.json({ ok: true });
};

export const mergeGuestCart = async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "items must be an array" });
  }

  const cart = await getOrCreateCart(userId);
  const warnings = [];

  await prisma.$transaction(async (tx) => {
    for (const row of items) {
      const productId = row.productId;
      const variantId = row.variantId ?? null;
      const qty = Number(row.quantity);

      if (!productId || !qty || qty < 1) continue;

      const stockCheck = await getAvailableStock(productId, variantId);
      if (!stockCheck.ok) {
        warnings.push({ productId, variantId, message: stockCheck.message });
        continue;
      }

      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_productId_variantId: {
            cartId: cart.id,
            productId,
            variantId,
          },
        },
      });

      const desiredQty = (existing?.quantity || 0) + qty;
      const finalQty = Math.min(desiredQty, stockCheck.stock);

      await tx.cartItem.upsert({
        where: {
          cartId_productId_variantId: {
            cartId: cart.id,
            productId,
            variantId,
          },
        },
        update: { quantity: finalQty },
        create: { cartId: cart.id, productId, variantId, quantity: finalQty },
      });

      if (finalQty < desiredQty) {
        warnings.push({
          productId,
          variantId,
          message: "quantity capped to available stock",
        });
      }
    }
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, basePrice: true } },
          variant: { select: { id: true, name: true, price: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  res.json({ cart: updatedCart, warnings });
};



export const reorderFromOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // order id

    const order = await prisma.order.findFirst({
      where: { id, userId },
      select: {
        id: true,
        items: { select: { productId: true, variantId: true, quantity: true } },
      },
    });

    if (!order) return res.status(404).json({ message: "order not found" });
    if (!order.items.length) return res.status(400).json({ message: "no items to reorder" });

    // ensure cart exists
    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { id: true },
    });

    // add items to cart (merge quantities)
    for (const it of order.items) {
      await prisma.cartItem.upsert({
        where: {
          cartId_productId_variantId: {
            cartId: cart.id,
            productId: it.productId,
            variantId: it.variantId ?? null,
          },
        },
        update: { quantity: { increment: it.quantity } },
        create: {
          cartId: cart.id,
          productId: it.productId,
          variantId: it.variantId ?? null,
          quantity: it.quantity,
        },
      });
    }

    return res.json({ message: "Items added to cart" });
  } catch (err) {
    console.error("reorderFromOrder error:", err);
    return res.status(500).json({ message: "internal server error" });
  }
};
