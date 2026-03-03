import { prisma } from "../config/prisma.js";

// GET /api/profile/me
export async function getMe(req, res) {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true, // ✅ ADD THIS
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/profile/me
export async function updateMe(req, res) {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const cleanPhone = phone ? String(phone).trim() : null;

    if (!cleanName) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Optional: prevent empty string stored as email/phone
    // If you want to keep existing when user sends empty, do it on frontend.
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error("updateMe error:", err);

    // Prisma unique constraint violation (email/phone)
    if (err?.code === "P2002") {
      const target = err?.meta?.target?.join(", ") || "field";
      return res.status(400).json({ message: `${target} already in use` });
    }

    return res.status(500).json({ message: "Server error" });
  }
}

export async function getProfileSummary(req, res) {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      select: { id: true, total: true, status: true, placedAt: true, orderNumber: true },
      orderBy: { placedAt: "desc" },
    });

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
    const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;
    const totalSpent = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const lastOrder = orders[0] || null;

    return res.json({
      summary: {
        totalOrders,
        deliveredOrders,
        cancelledOrders,
        totalSpent,
        lastOrder,
      },
    });
  } catch (err) {
    console.error("getProfileSummary error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getRecentOrders(req, res) {
  try {
    const userId = req.user.id;
    const limit = Math.min(Number(req.query.limit || 5), 20);

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { placedAt: "desc" },
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        placedAt: true,
      },
    });

    return res.json({ orders });
  } catch (err) {
    console.error("getRecentOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getRecentProducts(req, res) {
  try {
    const userId = req.user.id;
    const limit = Math.min(Number(req.query.limit || 8), 24);

    // Take recent delivered/placed orders and fetch items
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { userId },
      },
      orderBy: { createdAt: "desc" },
      take: 200, // scan recent items
      select: {
        productId: true,
        productName: true,
        unitPrice: true,
        product: {
          select: {
            slug: true,
            images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
          },
        },
      },
    });

    // Deduplicate by productId keeping latest
    const map = new Map();
    for (const it of orderItems) {
      if (!map.has(it.productId)) {
        map.set(it.productId, {
          productId: it.productId,
          name: it.productName,
          slug: it.product?.slug,
          price: it.unitPrice,
          image: it.product?.images?.[0]?.url || null,
        });
      }
      if (map.size >= limit) break;
    }

    return res.json({ products: Array.from(map.values()) });
  } catch (err) {
    console.error("getRecentProducts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

