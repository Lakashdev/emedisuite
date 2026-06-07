const DEFAULT_SETTINGS = {
  freeDeliveryThreshold: 2000,
  deliveryFeeInside: 100,
  deliveryFeeHub: 150,
  deliveryFeeOtherCity: 200,
  deliveryFeeOutside: 200,
};

export async function getOrCreateDeliverySettings(db) {
  const existing = await db.storeSettings.findFirst();
  if (existing) return existing;

  return db.storeSettings.create({
    data: DEFAULT_SETTINGS,
  });
}

export async function getActiveDeliveryZone(db, deliveryZoneId) {
  if (!deliveryZoneId) {
    const error = new Error("Please select a delivery city.");
    error.status = 400;
    throw error;
  }

  const zone = await db.deliveryZone.findFirst({
    where: {
      id: deliveryZoneId,
      isActive: true,
    },
  });

  if (!zone) {
    const error = new Error("Delivery is unavailable for the selected location.");
    error.status = 400;
    throw error;
  }

  return zone;
}

export function calculateDeliveryFee(settings, zone, subtotal) {
  if (zone.tier === "valley") {
    return subtotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.deliveryFeeInside;
  }

  if (zone.tier === "hub") {
    return settings.deliveryFeeHub;
  }

  if (zone.tier === "other_city") {
    return settings.deliveryFeeOtherCity;
  }

  const error = new Error("The selected delivery city has an invalid pricing tier.");
  error.status = 400;
  throw error;
}

export async function getDeliveryQuote(db, deliveryZoneId, subtotal) {
  const zone = await getActiveDeliveryZone(db, deliveryZoneId);
  const settings = await getOrCreateDeliverySettings(db);
  const deliveryFee = calculateDeliveryFee(settings, zone, subtotal);

  return {
    zone,
    settings,
    deliveryFee,
    subtotal,
    total: subtotal + deliveryFee,
    freeDeliveryApplied: zone.tier === "valley" && deliveryFee === 0,
    amountUntilFreeDelivery:
      zone.tier === "valley"
        ? Math.max(0, settings.freeDeliveryThreshold - subtotal)
        : null,
  };
}
