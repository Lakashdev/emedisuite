import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./config/prisma.js";
import { testRoutes } from "./routes/test.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { meRoutes } from "./routes/me.routes.js";
import { brandRoutes } from "./routes/brand.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { productRoutes } from "./routes/product.routes.js";
import { cartRoutes } from "./routes/cart.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { checkoutSessionRoutes } from "./routes/checkoutSession.routes.js";
import { orderActionsRoutes } from "./routes/orderActions.routes.js";
import passwordResetRoutes from "./routes/passwordReset.routes.js";






dotenv.config({ path: ".env" });

const app = express();

app.use(cors());
app.use(express.json());

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
app.use("/api", passwordResetRoutes);


start();
