// controllers/storeInfo.controller.js
import { prisma } from "../config/prisma.js";

const SINGLETON_ID = "singleton";

// Ensure singleton row exists
async function getOrCreate() {
  let row = await prisma.storeInfo.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) {
    row = await prisma.storeInfo.create({ data: { id: SINGLETON_ID } });
  }
  return row;
}

// GET /api/store-info  — public
export async function getStoreInfo(req, res) {
  try {
    const info = await getOrCreate();
    res.json(info);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch store info" });
  }
}

// PUT /api/store-info/admin  — admin only, partial update
export async function updateStoreInfo(req, res) {
  try {
    const {
      storeName, tagline, description,
      phone, email, address,
      openingHours, openDays,
      instagramUrl, facebookUrl, twitterUrl, tiktokUrl,
      newsletterEnabled, newsletterText,
      termsUrl, privacyUrl, refundUrl,
      aboutHeadline, aboutSubheadline, aboutBody,
      aboutMission, aboutVision,
      stat1Val, stat1Label,
      stat2Val, stat2Label,
      stat3Val, stat3Label,
    } = req.body;

    const data = {};

    if (storeName !== undefined) data.storeName = storeName;
    if (tagline !== undefined) data.tagline = tagline;
    if (description !== undefined) data.description = description;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (address !== undefined) data.address = address;
    if (openingHours !== undefined) data.openingHours = openingHours;
    if (openDays !== undefined) data.openDays = openDays;
    if (instagramUrl !== undefined) data.instagramUrl = instagramUrl;
    if (facebookUrl !== undefined) data.facebookUrl = facebookUrl;
    if (twitterUrl !== undefined) data.twitterUrl = twitterUrl;
    if (tiktokUrl !== undefined) data.tiktokUrl = tiktokUrl;
    if (newsletterEnabled !== undefined) data.newsletterEnabled = Boolean(newsletterEnabled);
    if (newsletterText !== undefined) data.newsletterText = newsletterText;
    if (termsUrl !== undefined) data.termsUrl = termsUrl;
    if (privacyUrl !== undefined) data.privacyUrl = privacyUrl;
    if (refundUrl !== undefined) data.refundUrl = refundUrl;
    if (aboutHeadline !== undefined) data.aboutHeadline = aboutHeadline;
    if (aboutSubheadline !== undefined) data.aboutSubheadline = aboutSubheadline;
    if (aboutBody !== undefined) data.aboutBody = aboutBody;
    if (aboutMission !== undefined) data.aboutMission = aboutMission;
    if (aboutVision !== undefined) data.aboutVision = aboutVision;
    if (stat1Val !== undefined) data.stat1Val = stat1Val;
    if (stat1Label !== undefined) data.stat1Label = stat1Label;
    if (stat2Val !== undefined) data.stat2Val = stat2Val;
    if (stat2Label !== undefined) data.stat2Label = stat2Label;
    if (stat3Val !== undefined) data.stat3Val = stat3Val;
    if (stat3Label !== undefined) data.stat3Label = stat3Label;

    // Upsert — create if not exists, update if exists
    const info = await prisma.storeInfo.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });

    res.json(info);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update store info" });
  }
}