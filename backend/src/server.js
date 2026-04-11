import "./env.js";
import express from "express";
import cors from "cors";
import path from "path";
/* import dotenv from "dotenv"; */
import { prisma } from "./config/prisma.js";
import { testRoutes } from "./routes/test.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { meRoutes } from "./routes/me.routes.js";
import { brandRoutes } from "./routes/brand.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { productRoutes } from "./routes/product.routes.js";
import { cartRoutes } from "./routes/cart.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { checkoutSessionRoutes } from "./routes/checkoutSession.routes.js";
import { orderActionsRoutes } from "./routes/orderActions.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { heroSlideRoutes } from "./routes/heroSlide.routes.js";
import { storeInfoRoutes } from "./routes/storeInfo.routes.js";



const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // ✅ set false unless you are using cookies
  })
);


app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

app.get("/health/db", async (req, res) => {
  const result = await prisma.$queryRaw`SELECT 1 as ok`;
  res.json({ ok: true, db: result });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // simple DB ping on startup
    await prisma.$queryRaw`SELECT 1`;
    console.log("PostgreSQL connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout-sessions", checkoutSessionRoutes);
app.use("/api", orderActionsRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hero-slides", heroSlideRoutes);
app.use("/api/store-info", storeInfoRoutes);



start();
