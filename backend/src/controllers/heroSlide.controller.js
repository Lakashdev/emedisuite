// controllers/heroSlide.controller.js
import { prisma } from "../config/prisma.js";

/* ─── PUBLIC ─── */

// GET /api/hero-slides  → returns active slides sorted by position
export async function listHeroSlides(req, res) {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { status: "active" },
      orderBy: { position: "asc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            discountType: true,
            discountValue: true,
            images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
          },
        },
      },
    });
    res.json({ items: slides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch hero slides" });
  }
}

/* ─── ADMIN ─── */

// GET /api/admin/hero-slides  → all slides (including drafts)
export async function adminListHeroSlides(req, res) {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { position: "asc" },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });
    res.json({ items: slides });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/admin/hero-slides
export async function createHeroSlide(req, res) {
  try {
    const {
      tag, headline, sub, pill,
      ctaLabel, ctaHref, ctaAltLabel, ctaAltHref,
      featName, featPrice, featOld, icon,
      stat1Val, stat1Label, stat2Val, stat2Label,
      micro1, micro2, micro3,
      accent, bg, productId, status, position,
    } = req.body;

    if (!tag || !headline || !sub || !ctaLabel || !ctaHref || !featName || !featPrice || !featOld) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const slide = await prisma.heroSlide.create({
      data: {
        tag, headline, sub, pill: pill || "",
        ctaLabel, ctaHref,
        ctaAltLabel: ctaAltLabel || "Explore all",
        ctaAltHref: ctaAltHref || "/products",
        featName,
        featPrice: parseInt(featPrice),
        featOld: parseInt(featOld),
        icon: icon || "bi-stars",
        stat1Val: stat1Val || "100%",
        stat1Label: stat1Label || "Genuine",
        stat2Val: stat2Val || "Same Day",
        stat2Label: stat2Label || "Delivery",
        micro1: micro1 || "Verified brands",
        micro2: micro2 || "Delivers in Kathmandu",
        micro3: micro3 || "Licensed pharmacy",
        accent: accent || "#6BBF4E",
        bg: bg || "linear-gradient(135deg, #E8F5E2 0%, #F4F8F0 55%, #EEF2F8 100%)",
        productId: productId || null,
        status: status || "active",
        position: position !== undefined ? parseInt(position) : 0,
      },
    });

    res.status(201).json(slide);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create slide" });
  }
}

// PUT /api/admin/hero-slides/:id
export async function updateHeroSlide(req, res) {
  try {
    const { id } = req.params;
    const {
      tag, headline, sub, pill,
      ctaLabel, ctaHref, ctaAltLabel, ctaAltHref,
      featName, featPrice, featOld, icon,
      stat1Val, stat1Label, stat2Val, stat2Label,
      micro1, micro2, micro3,
      accent, bg, productId, status, position,
    } = req.body;

    const data = {};
    if (tag !== undefined) data.tag = tag;
    if (headline !== undefined) data.headline = headline;
    if (sub !== undefined) data.sub = sub;
    if (pill !== undefined) data.pill = pill;
    if (ctaLabel !== undefined) data.ctaLabel = ctaLabel;
    if (ctaHref !== undefined) data.ctaHref = ctaHref;
    if (ctaAltLabel !== undefined) data.ctaAltLabel = ctaAltLabel;
    if (ctaAltHref !== undefined) data.ctaAltHref = ctaAltHref;
    if (featName !== undefined) data.featName = featName;
    if (featPrice !== undefined) data.featPrice = parseInt(featPrice);
    if (featOld !== undefined) data.featOld = parseInt(featOld);
    if (icon !== undefined) data.icon = icon;
    if (stat1Val !== undefined) data.stat1Val = stat1Val;
    if (stat1Label !== undefined) data.stat1Label = stat1Label;
    if (stat2Val !== undefined) data.stat2Val = stat2Val;
    if (stat2Label !== undefined) data.stat2Label = stat2Label;
    if (micro1 !== undefined) data.micro1 = micro1;
    if (micro2 !== undefined) data.micro2 = micro2;
    if (micro3 !== undefined) data.micro3 = micro3;
    if (accent !== undefined) data.accent = accent;
    if (bg !== undefined) data.bg = bg;
    if (productId !== undefined) data.productId = productId || null;
    if (status !== undefined) data.status = status;
    if (position !== undefined) data.position = parseInt(position);

    const slide = await prisma.heroSlide.update({ where: { id }, data });
    res.json(slide);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Slide not found" });
    console.error(err);
    res.status(500).json({ message: "Failed to update slide" });
  }
}

// DELETE /api/admin/hero-slides/:id
export async function deleteHeroSlide(req, res) {
  try {
    await prisma.heroSlide.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "Slide not found" });
    res.status(500).json({ message: "Server error" });
  }
}

// PATCH /api/admin/hero-slides/reorder  → body: { order: ["id1","id2","id3"] }
export async function reorderHeroSlides(req, res) {
  try {
    const { order } = req.body; // array of ids in desired position
    if (!Array.isArray(order)) return res.status(400).json({ message: "order must be an array" });

    await Promise.all(
      order.map((id, index) =>
        prisma.heroSlide.update({ where: { id }, data: { position: index } })
      )
    );

    res.json({ message: "Reordered" });
  } catch (err) {
    res.status(500).json({ message: "Failed to reorder" });
  }
}