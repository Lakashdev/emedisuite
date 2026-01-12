import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";

export const testRoutes = Router();

testRoutes.post("/create-user", async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: "name and password are required" });
  }
  if (!email && !phone) {
    return res.status(400).json({ message: "email or phone is required" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      passwordHash,
      role: "customer",
    },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  res.status(201).json(user);
});

testRoutes.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  res.json({ items: users });
});
