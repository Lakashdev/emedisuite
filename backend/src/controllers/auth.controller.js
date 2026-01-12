import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { signAccessToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "name and password are required" });
    }
    if (!email && !phone) {
      return res.status(400).json({ message: "email or phone is required" });
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) return res.status(409).json({ message: "email already in use" });
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) return res.status(409).json({ message: "phone already in use" });
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

    const accessToken = signAccessToken({ sub: user.id, role: user.role });

    return res.status(201).json({
      user,
      accessToken,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "identifier and password are required" });
    }

    const isEmail = identifier.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: identifier }
        : { phone: identifier },
    });

    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "internal server error" });
  }
};
