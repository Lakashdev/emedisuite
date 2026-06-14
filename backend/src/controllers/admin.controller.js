import { prisma } from "../config/prisma.js";
import { sendOrderStatusUpdateToCustomer } from "../utils/orderEmail.js";

const ORDER_STATUSES = ["Placed", "Confirmed", "Packed", "OutForDelivery", "Delivered", "Cancelled"];
const USER_ROLES = ["customer", "admin", "cms_admin"];

export const listAdminUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "").trim();

    const where = {
      ...(role && USER_ROLES.includes(role) ? { role } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const spending = users.length
      ? await prisma.order.groupBy({
          by: ["userId"],
          where: {
            userId: { in: users.map((user) => user.id) },
            status: { not: "Cancelled" },
          },
          _sum: { total: true },
        })
      : [];
    const spendingByUser = new Map(
      spending.map((row) => [row.userId, Number(row._sum.total || 0)]),
    );

    const items = users.map(({ _count, ...user }) => ({
      ...user,
      orderCount: _count.orders,
      totalSpent: spendingByUser.get(user.id) || 0,
    }));

    return res.json({
      users: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("LIST ADMIN USERS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch users." });
  }
};

export const getAdminUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          orderBy: { placedAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            subtotal: true,
            discountTotal: true,
            deliveryFee: true,
            total: true,
            paymentMethod: true,
            city: true,
            placedAt: true,
            items: { select: { id: true } },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    const completedOrders = user.orders.filter((order) => order.status !== "Cancelled");
    return res.json({
      user: {
        ...user,
        orderCount: user.orders.length,
        completedOrderCount: completedOrders.length,
        totalSpent: completedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
      },
    });
  } catch (error) {
    console.error("GET ADMIN USER ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch user." });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
      },
    });

    if (!existing) return res.status(404).json({ message: "User not found." });

    const name = String(req.body.name || "").trim();
    const email = req.body.email ? String(req.body.email).trim().toLowerCase() : null;
    const phone = req.body.phone ? String(req.body.phone).trim() : null;
    const role = String(req.body.role || "");

    if (!name) return res.status(400).json({ message: "Name is required." });
    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required." });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Email address is invalid." });
    }
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid user role." });
    }
    if (existing.id === req.user.id && role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own admin role." });
    }

    const emailChanged = existing.email !== email;
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        email,
        phone,
        role,
        ...(emailChanged
          ? {
              emailVerified: false,
              emailOtpHash: null,
              emailOtpExpiresAt: null,
              emailOtpAttempts: 0,
              emailOtpLastSentAt: null,
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      user,
      message: emailChanged
        ? "User updated. The new email must be verified."
        : "User updated successfully.",
    });
  } catch (error) {
    if (error?.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(", ")
        : "Email or phone";
      return res.status(409).json({ message: `${target} is already in use.` });
    }
    console.error("UPDATE ADMIN USER ERROR:", error);
    return res.status(500).json({ message: "Failed to update user." });
  }
};

export const verifyAdminUserEmail = async (req, res) => {
  try {
    const existing = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!existing) return res.status(404).json({ message: "User not found." });
    if (!existing.email) {
      return res.status(400).json({ message: "This user does not have an email address." });
    }
    if (existing.emailVerified) {
      return res.json({ user: existing, message: "Email is already verified." });
    }

    const user = await prisma.user.update({
      where: { id: existing.id },
      data: {
        emailVerified: true,
        emailOtpHash: null,
        emailOtpExpiresAt: null,
        emailOtpAttempts: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ user, message: "User email verified successfully." });
  } catch (error) {
    console.error("VERIFY ADMIN USER EMAIL ERROR:", error);
    return res.status(500).json({ message: "Failed to verify user email." });
  }
};

export const listAdminOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const status = req.query.status;
    const search = String(req.query.search || "").trim();
    const where = {
      ...(status && ORDER_STATUSES.includes(status) ? { status } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" } },
              { fullName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
              { user: { is: { name: { contains: search, mode: "insensitive" } } } },
              { user: { is: { email: { contains: search, mode: "insensitive" } } } },
              { user: { is: { phone: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { placedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("LIST ADMIN ORDERS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch orders." });
  }
};

export const getAdminOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found." });
    return res.json({ order });
  } catch (error) {
    console.error("GET ADMIN ORDER ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch order." });
  }
};

export const updateAdminOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }

    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: "Order not found." });
    if (existing.status === status) {
      return res.json({ order: existing });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        deliveredAt: status === "Delivered"
          ? existing.deliveredAt || new Date()
          : existing.deliveredAt,
        cancelledAt: status === "Cancelled"
          ? existing.cancelledAt || new Date()
          : existing.cancelledAt,
      },
      include: { items: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { email: true },
    });

    try {
      await sendOrderStatusUpdateToCustomer(order, user?.email ?? null);
    } catch (emailError) {
      console.error("ORDER STATUS EMAIL ERROR:", emailError);
    }

    return res.json({ order });
  } catch (error) {
    console.error("UPDATE ADMIN ORDER STATUS ERROR:", error);
    return res.status(500).json({ message: "Failed to update order status." });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const days = Math.max(7, Math.min(365, parseInt(req.query.days || "30", 10)));

    const now = new Date();
    const from = new Date(now);
    from.setDate(from.getDate() - days);

    // KPI counts
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
    ]);

    // Orders in range (use Order.total, Order.status, Order.createdAt)
    const ordersInRange = await prisma.order.findMany({
      where: { createdAt: { gte: from, lte: now } },
      select: { createdAt: true, total: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    const dayKey = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
    const ordersByDay = new Map();
    const revenueByDay = new Map();

    let totalRevenue = 0;
    let deliveredRevenue = 0;
    let deliveredOrders = 0;

    for (const o of ordersInRange) {
      const k = dayKey(o.createdAt);

      ordersByDay.set(k, (ordersByDay.get(k) || 0) + 1);

      const amt = Number(o.total || 0);
      totalRevenue += amt;

      revenueByDay.set(k, (revenueByDay.get(k) || 0) + amt);

      // Your statuses: Placed, Confirmed, Packed, OutForDelivery, Delivered, Cancelled
      if (o.status === "Delivered") {
        deliveredRevenue += amt;
        deliveredOrders += 1;
      }
    }

    // Fill missing dates for nicer chart
    const labels = [];
    const ordersSeries = [];
    const revenueSeries = [];

    const cursor = new Date(from);
    while (cursor <= now) {
      const k = dayKey(cursor);
      labels.push(k);
      ordersSeries.push(ordersByDay.get(k) || 0);
      revenueSeries.push(revenueByDay.get(k) || 0);
      cursor.setDate(cursor.getDate() + 1);
    }

    // Recent orders (use total, not totalAmount)
    const [recentOrders, recentUsers] = await Promise.all([
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          status: true,
          total: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
    ]);

    // Top products by quantity sold (from OrderItem)
    const top = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const productIds = top.map((x) => x.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, slug: true, basePrice: true },
    });

    const map = new Map(products.map((p) => [p.id, p]));

    const topProducts = top.map((x) => ({
      productId: x.productId,
      name: map.get(x.productId)?.name || "Unknown",
      slug: map.get(x.productId)?.slug || "",
      basePrice: map.get(x.productId)?.basePrice ?? null,
      qtySold: x._sum.quantity || 0,
      revenue: x._sum.lineTotal || 0,
    }));

    return res.json({
      kpis: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
        deliveredRevenue,
        deliveredOrders,
        avgOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      },
      charts: { labels, ordersSeries, revenueSeries },
      recentOrders,
      recentUsers: recentUsers.map(({ _count, ...user }) => ({
        ...user,
        orderCount: _count.orders,
      })),
      topProducts,
      range: { days, from, to: now },
    });
  } catch (e) {
    console.error("ADMIN STATS ERROR:", e);
    return res.status(500).json({
      message: "Admin stats failed",
      error: e.message,
    });
  }
};
