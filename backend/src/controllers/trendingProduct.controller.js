import { prisma } from "../config/prisma.js";

// GET /admin/trending-products
export const getTrendingProducts = async (req, res) => {
  const items = await prisma.trendingProduct.findMany({
    orderBy: { position: "asc" },
    include: {
      product: {
        include: {
          brand: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
          variants: true,
        },
      },
    },
  });

  res.json({ items });
};

// PUT /admin/trending-products  (replace entire list)
// body: { productIds: ["id1", "id2", ...] }  — ordered array, max 6
export const saveTrendingProducts = async (req, res) => {
  const { productIds } = req.body;

  if (!Array.isArray(productIds)) {
    return res.status(400).json({ message: "productIds must be an array" });
  }
  if (productIds.length > 6) {
    return res.status(400).json({ message: "Maximum 6 trending products allowed" });
  }

  // Validate all product IDs exist
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });

  if (products.length !== productIds.length) {
    return res.status(400).json({ message: "One or more product IDs are invalid" });
  }

  // Replace entire trending list in a transaction
  const items = await prisma.$transaction(async (tx) => {
    await tx.trendingProduct.deleteMany();

    if (productIds.length === 0) return [];

    await tx.trendingProduct.createMany({
      data: productIds.map((productId, idx) => ({
        productId,
        position: idx + 1,
      })),
    });

    return tx.trendingProduct.findMany({
      orderBy: { position: "asc" },
      include: {
        product: {
          include: {
            brand: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            images: { orderBy: { position: "asc" }, take: 1 },
            variants: true,
          },
        },
      },
    });
  });

  res.json({ items });
};

// GET /api/trending-products  (public — homepage)
export const getPublicTrendingProducts = async (req, res) => {
  const items = await prisma.trendingProduct.findMany({
    orderBy: { position: "asc" },
    include: {
      product: {
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { position: "asc" } },
          variants: true,
        },
      },
    },
  });

  // Shape the response to match your existing homepage data structure
  const products = items.map((item) => ({
    ...item.product,
    trendingPosition: item.position,
  }));

  res.json({ products });
};