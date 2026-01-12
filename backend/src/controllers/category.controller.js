import { prisma } from "../config/prisma.js";

export const listCategories = async (req, res) => {
  const items = await prisma.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      children: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ items });
};

export const getCategory = async (req, res) => {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { parent: true, children: true },
  });

  if (!category) return res.status(404).json({ message: "category not found" });

  res.json({ category });
};

export const createCategory = async (req, res) => {
  const { name, slug, parentId, status } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: "name and slug are required" });
  }

  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      return res.status(400).json({ message: "invalid parent category" });
    }
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      status: status || "active",
      parentId: parentId || null,
    },
  });

  res.status(201).json({ category });
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, parentId, status } = req.body;

  const exists = await prisma.category.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: "category not found" });

  if (parentId) {
    if (parentId === id) {
      return res.status(400).json({ message: "category cannot be its own parent" });
    }

    const parent = await prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) {
      return res.status(400).json({ message: "invalid parent category" });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: name ?? undefined,
      slug: slug ?? undefined,
      status: status ?? undefined,
      parentId: parentId === undefined ? undefined : (parentId || null),
    },
  });

  res.json({ category });
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const exists = await prisma.category.findUnique({
    where: { id },
    include: { children: true },
  });

  if (!exists) return res.status(404).json({ message: "category not found" });

  if (exists.children.length > 0) {
    return res.status(400).json({ message: "cannot delete category with child categories" });
  }

  await prisma.category.delete({ where: { id } });
  res.json({ ok: true });
};
