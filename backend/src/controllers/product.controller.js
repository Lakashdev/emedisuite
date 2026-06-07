import { prisma } from "../config/prisma.js";
import { productSearchScore } from "../utils/catalogSearch.js";

export const listProducts = async (req, res) => {
  const { q, brandId, categoryId, status, page = "1", limit = "12" } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

  const where = {
    ...(status ? { status } : {}),
    ...(brandId ? { brandId } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const include = {
    brand: { select: { id: true, name: true, slug: true } },
    category: { select: { id: true, name: true, slug: true } },
    images: true,
    variants: true,
  };

  if (q?.trim()) {
    const candidates = await prisma.product.findMany({ where, include });
    const ranked = candidates
      .map((product) => ({ product, rank: productSearchScore(q, product) }))
      .filter((item) => item.rank > 0)
      .sort((a, b) => b.rank - a.rank || b.product.createdAt - a.product.createdAt);

    const total = ranked.length;
    const start = (pageNum - 1) * limitNum;
    const items = ranked.slice(start, start + limitNum).map((item) => item.product);

    return res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include,
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

export const listBestSellers = async (req, res) => {
  const limitNum = Math.min(12, Math.max(1, parseInt(req.query.limit || "6", 10)));
  const topSales = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: {
        is: { status: { notIn: ["Cancelled"] } },
      },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limitNum,
  });

  const productIds = topSales.map((item) => item.productId);
  const include = {
    brand: { select: { id: true, name: true, slug: true } },
    category: { select: { id: true, name: true, slug: true } },
    images: { orderBy: { position: "asc" }, take: 1 },
    variants: true,
  };

  const soldProducts = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, status: "active" },
        include,
      })
    : [];
  const productsById = new Map(soldProducts.map((product) => [product.id, product]));
  const items = productIds.map((id) => productsById.get(id)).filter(Boolean);

  if (items.length < limitNum) {
    const fallback = await prisma.product.findMany({
      where: {
        status: "active",
        id: { notIn: items.map((item) => item.id) },
      },
      include,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: limitNum - items.length,
    });
    items.push(...fallback);
  }

  res.json({ items });
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
  // ✅ multipart/form-data: JSON comes in req.body.data
  const raw = req.body?.data;
  const body = raw ? JSON.parse(raw) : req.body;

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
    variants,
  } = body;

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

  // ✅ uploaded files -> stored urls
  const imageUrls = (req.files || []).map((f) => `/uploads/products/${f.filename}`);

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
      discountValue: discountValue === undefined || discountValue === null ? null : Number(discountValue),
      discountStartAt: discountStartAt ? new Date(discountStartAt) : null,
      discountEndAt: discountEndAt ? new Date(discountEndAt) : null,

      prescriptionRequired: Boolean(prescriptionRequired || false),
      status: status || "active",
      featured: Boolean(featured || false),

      images: imageUrls.length
        ? {
            create: imageUrls.map((url, idx) => ({
              url,
              position: idx,
            })),
          }
        : undefined,

      variants: Array.isArray(variants) && variants.length
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
    include: { images: true, variants: true, brand: true, category: true },
  });

  res.status(201).json({ product });
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;

  // ✅ multipart/form-data: JSON comes in req.body.data
  const raw = req.body?.data;
  const body = raw ? JSON.parse(raw) : req.body;

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
    variants,
  } = body;

  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: "product not found" });

  // ✅ new uploaded images (if any)
  const newImageUrls = (req.files || []).map((f) => `/uploads/products/${f.filename}`);

  const data = {
    name: name ?? undefined,
    slug: slug ?? undefined,
    description: description === undefined ? undefined : (description || null),

    brandId: brandId ?? undefined,
    categoryId: categoryId ?? undefined,

    basePrice: basePrice === undefined ? undefined : Number(basePrice),
    baseStock: baseStock === undefined ? undefined : Number(baseStock),

    discountType: discountType === undefined ? undefined : (discountType || null),
    discountValue:
      discountValue === undefined
        ? undefined
        : (discountValue === null ? null : Number(discountValue)),
    discountStartAt:
      discountStartAt === undefined
        ? undefined
        : (discountStartAt ? new Date(discountStartAt) : null),
    discountEndAt:
      discountEndAt === undefined
        ? undefined
        : (discountEndAt ? new Date(discountEndAt) : null),

    prescriptionRequired: prescriptionRequired === undefined ? undefined : Boolean(prescriptionRequired),
    status: status ?? undefined,
    featured: featured === undefined ? undefined : Boolean(featured),
  };

  const product = await prisma.$transaction(async (tx) => {
    // ✅ Replace images only if new files were uploaded
    if (newImageUrls.length) {
      await tx.productImage.deleteMany({ where: { productId: id } });

      await tx.productImage.createMany({
        data: newImageUrls.map((url, idx) => ({
          url,
          position: idx,
          productId: id,
        })),
      });
    }

    // ✅ Replace variants if provided
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
