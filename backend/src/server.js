import "./env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { rateLimit } from "express-rate-limit";
import { prisma } from "./config/prisma.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

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
import { trendingProductRoutes } from "./routes/trendingProduct.route.js";
import passwordResetRoutes from "./routes/passwordReset.routes.js";
import { deliveryRoutes } from "./routes/delivery.routes.js";
import { searchRoutes } from "./routes/search.routes.js";

const app = express();
const IS_PROD = process.env.NODE_ENV === "production";

/* ── Security ── */
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

/* ── CORS ── */
function normalizeOrigin(value) {
  return new URL(value.trim()).origin;
}

function isAllowedOrigin(origin) {
  try {
    return allowedOrigins.has(normalizeOrigin(origin));
  } catch {
    return false;
  }
}

const configuredOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.FRONTEND_URL ||
  (IS_PROD ? "" : "http://localhost:5173")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(IS_PROD ? [] : ["http://localhost:3000", "http://localhost:5173"]),
]);

if (IS_PROD && allowedOrigins.size === 0) {
  throw new Error("CORS_ORIGINS or FRONTEND_URL must be set in production");
}

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || isAllowedOrigin(origin)) {
      return cb(null, true);
    }

    const error = new Error(`Origin ${origin} is not allowed by CORS`);
    error.status = 403;
    cb(error);
  },
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));
app.options("/{*splat}", cors(corsOptions));

/* ── Compression & logging ── */
app.use(compression());
app.use(morgan(IS_PROD ? "combined" : "dev"));

/* ── Body parsing ── */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ── Static uploads ── */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ── Rate limiters ── */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

app.use("/api", globalLimiter);

/* ── Health checks ── */
app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Backend is running", env: process.env.NODE_ENV });
});
app.get("/health/db", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    res.json({ ok: true });
  } catch (err) { next(err); }
});

/* ── API Routes ── */
if (!IS_PROD) app.use("/api/test", testRoutes);
app.use("/api/auth", authLimiter, authRoutes);
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
app.use("/api/trending-products", trendingProductRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/password-reset", authLimiter, passwordResetRoutes);

/* ── Error handlers ── */
app.use(notFound);
app.use(errorHandler);

/* ── Start ── */
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ PostgreSQL connected");

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} received — shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log("🛑 Server closed.");
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("unhandledRejection", (r) => console.error("Unhandled Rejection:", r));
    process.on("uncaughtException", (e) => { console.error("Uncaught Exception:", e); process.exit(1); });
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
}

start();
