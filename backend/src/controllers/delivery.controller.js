import { prisma } from "../config/prisma.js";
import {
  getDeliveryQuote,
  getOrCreateDeliverySettings,
} from "../services/delivery.service.js";

const AREA_TYPES = ["inside_valley", "outside_valley"];
const TIERS = ["valley", "hub", "other_city"];

function toNonNegativeInt(value, field) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }
  return parsed;
}

function validateZoneInput(body) {
  const city = String(body.city || "").trim();
  const district = String(body.district || "").trim() || null;
  const areaType = String(body.areaType || "");
  const tier = String(body.tier || "");

  if (!city) throw new Error("City is required.");
  if (!AREA_TYPES.includes(areaType)) throw new Error("Invalid area type.");
  if (!TIERS.includes(tier)) throw new Error("Invalid pricing tier.");
  if (areaType === "inside_valley" && tier !== "valley") {
    throw new Error("Inside Valley locations must use the Valley tier.");
  }
  if (areaType === "outside_valley" && tier === "valley") {
    throw new Error("Outside Valley locations cannot use the Valley tier.");
  }

  return {
    city,
    district,
    areaType,
    tier,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    sortOrder: toNonNegativeInt(body.sortOrder ?? 0, "sortOrder"),
  };
}

export async function listDeliveryZones(_req, res) {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { isActive: true },
      orderBy: [{ areaType: "asc" }, { sortOrder: "asc" }, { city: "asc" }],
    });
    res.json({ items: zones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch delivery locations." });
  }
}

export async function getDeliverySettings(_req, res) {
  try {
    const settings = await getOrCreateDeliverySettings(prisma);
    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch delivery settings." });
  }
}

export async function quoteDelivery(req, res) {
  try {
    const subtotal = toNonNegativeInt(req.body.subtotal, "subtotal");
    const quote = await getDeliveryQuote(prisma, req.body.deliveryZoneId, subtotal);
    res.json({
      deliveryZoneId: quote.zone.id,
      city: quote.zone.city,
      district: quote.zone.district,
      tier: quote.zone.tier,
      deliveryFee: quote.deliveryFee,
      subtotal: quote.subtotal,
      total: quote.total,
      freeDeliveryApplied: quote.freeDeliveryApplied,
      amountUntilFreeDelivery: quote.amountUntilFreeDelivery,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function adminGetDeliveryConfig(_req, res) {
  try {
    const [settings, zones] = await Promise.all([
      getOrCreateDeliverySettings(prisma),
      prisma.deliveryZone.findMany({
        orderBy: [{ areaType: "asc" }, { sortOrder: "asc" }, { city: "asc" }],
      }),
    ]);
    res.json({ settings, zones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch delivery configuration." });
  }
}

export async function adminUpdateDeliverySettings(req, res) {
  try {
    const settings = await getOrCreateDeliverySettings(prisma);
    const data = {
      freeDeliveryThreshold: toNonNegativeInt(req.body.freeDeliveryThreshold, "freeDeliveryThreshold"),
      deliveryFeeInside: toNonNegativeInt(req.body.deliveryFeeInside, "deliveryFeeInside"),
      deliveryFeeHub: toNonNegativeInt(req.body.deliveryFeeHub, "deliveryFeeHub"),
      deliveryFeeOtherCity: toNonNegativeInt(req.body.deliveryFeeOtherCity, "deliveryFeeOtherCity"),
    };
    const updated = await prisma.storeSettings.update({ where: { id: settings.id }, data });
    res.json({ settings: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function adminCreateDeliveryZone(req, res) {
  try {
    const zone = await prisma.deliveryZone.create({ data: validateZoneInput(req.body) });
    res.status(201).json({ zone });
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ message: "This city already exists in that area type." });
    res.status(400).json({ message: err.message });
  }
}

export async function adminUpdateDeliveryZone(req, res) {
  try {
    const zone = await prisma.deliveryZone.update({
      where: { id: req.params.id },
      data: validateZoneInput(req.body),
    });
    res.json({ zone });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Delivery city not found." });
    if (err.code === "P2002") return res.status(409).json({ message: "This city already exists in that area type." });
    res.status(400).json({ message: err.message });
  }
}

export async function adminDeleteDeliveryZone(req, res) {
  try {
    const zone = await prisma.deliveryZone.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ zone });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Delivery city not found." });
    res.status(500).json({ message: "Failed to disable delivery city." });
  }
}
