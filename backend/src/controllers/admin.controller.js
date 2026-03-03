import { prisma } from "../config/prisma.js";

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
    const recentOrders = await prisma.order.findMany({
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
    });

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