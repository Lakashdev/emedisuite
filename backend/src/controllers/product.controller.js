import { prisma } from "../config/prisma.js";

export const listProducts = async (req, res) => {
  const { q, brandId, categoryId, status, page = "1", limit = "12" } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

  const where = {
    ...(status ? { status } : {}),
    ...(brandId ? { brandId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
        images: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    items,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  });

  if (!product) return res.status(404).json({ message: "product not found" });

  res.json({ product });
};

export const createProduct = async (req, res) => {
  const {
    name,
    slug,
    description,
    brandId,
    categoryId,
    basePrice,
    baseStock,
    discountType,
    discountValue,
    discountStartAt,
    discountEndAt,
    prescriptionRequired,
    status,
    featured,
    images,
    variants,
  } = req.body;

  if (!name || !slug || !brandId || !categoryId) {
    return res.status(400).json({ message: "name, slug, brandId, categoryId are required" });
  }
  if (basePrice === undefined || baseStock === undefined) {
    return res.status(400).json({ message: "basePrice and baseStock are required" });
  }

  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand) return res.status(400).json({ message: "invalid brandId" });

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return res.status(400).json({ message: "invalid categoryId" });

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description || null,
      brandId,
      categoryId,
      basePrice: Number(basePrice),
      baseStock: Number(baseStock),

      discountType: discountType || null,
      discountValue: discountValue === undefined ? null : Number(discountValue),
      discountStartAt: discountStartAt ? new Date(discountStartAt) : null,
      discountEndAt: discountEndAt ? new Date(discountEndAt) : null,

      prescriptionRequired: Boolean(prescriptionRequired || false),
      status: status || "active",
      featured: Boolean(featured || false),

      images: images?.length
        ? {
            create: images.map((url, idx) => ({
              url,
              position: idx,
            })),
          }
        : undefined,

      variants: variants?.length
        ? {
            create: variants.map((v) => ({
              name: v.name,
              sku: v.sku || null,
              price: Number(v.price),
              stock: Number(v.stock),
            })),
          }
        : undefined,
    },
    include: { images: true, variants: true },
  });

  res.status(201).json({ product });
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    slug,
    description,
    brandId,
    categoryId,
    basePrice,
    baseStock,
    discountType,
    discountValue,
    discountStartAt,
    discountEndAt,
    prescriptionRequired,
    status,
    featured,
    images,
    variants,
  } = req.body;

  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: "product not found" });

  // We will "replace" images and variants if provided (simple MVP behavior)
  const data = {
    name: name ?? undefined,
    slug: slug ?? undefined,
    description: description === undefined ? undefined : (description || null),

    brandId: brandId ?? undefined,
    categoryId: categoryId ?? undefined,

    basePrice: basePrice === undefined ? undefined : Number(basePrice),
    baseStock: baseStock === undefined ? undefined : Number(baseStock),

    discountType: discountType === undefined ? undefined : (discountType || null),
    discountValue: discountValue === undefined ? undefined : (discountValue === null ? null : Number(discountValue)),
    discountStartAt: discountStartAt === undefined ? undefined : (discountStartAt ? new Date(discountStartAt) : null),
    discountEndAt: discountEndAt === undefined ? undefined : (discountEndAt ? new Date(discountEndAt) : null),

    prescriptionRequired: prescriptionRequired === undefined ? undefined : Boolean(prescriptionRequired),
    status: status ?? undefined,
    featured: featured === undefined ? undefined : Boolean(featured),
  };

  const product = await prisma.$transaction(async (tx) => {
    if (Array.isArray(images)) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length) {
        await tx.productImage.createMany({
          data: images.map((url, idx) => ({ url, position: idx, productId: id })),
        });
      }
    }

    if (Array.isArray(variants)) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            name: v.name,
            sku: v.sku || null,
            price: Number(v.price),
            stock: Number(v.stock),
            productId: id,
          })),
        });
      }
    }

    return tx.product.update({
      where: { id },
      data,
      include: { images: true, variants: true, brand: true, category: true },
    });
  });

  res.json({ product });
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: "product not found" });

  await prisma.product.delete({ where: { id } });
  res.json({ ok: true });
};
