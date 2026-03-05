import { prisma } from "../config/prisma.js";

export const listBrands = async (req, res) => {
  const items = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json({ items });
};

export const getBrand = async (req, res) => {
  const { id } = req.params;

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) return res.status(404).json({ message: "brand not found" });

  res.json({ brand });
};

export const createBrand = async (req, res) => {
  const { name, slug, status } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: "name and slug are required" });
  }

  const logoUrl = req.file ? `/uploads/brands/${req.file.filename}` : null;

  const brand = await prisma.brand.create({
    data: {
      name: name.trim(),
      slug: slug.trim(),
      logoUrl,
      status: status || "active",
    },
  });

  res.status(201).json({ brand });
};

export const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { name, slug, status } = req.body;

  const exists = await prisma.brand.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: "brand not found" });

  // If a new file is uploaded, replace logoUrl. If not, keep existing.
  const nextLogoUrl = req.file ? `/uploads/brands/${req.file.filename}` : undefined;

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      name: name ?? undefined,
      slug: slug ?? undefined,
      status: status ?? undefined,
      logoUrl: nextLogoUrl, // undefined = don’t change, string = replace
    },
  });

  res.json({ brand });
};

export const deleteBrand = async (req, res) => {
  const { id } = req.params;

  const exists = await prisma.brand.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: "brand not found" });

  await prisma.brand.delete({ where: { id } });
  res.json({ ok: true });
};
