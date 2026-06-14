export function getProductPricing(product, originalUnitPrice, now = new Date()) {
  const originalPrice = Number(originalUnitPrice || 0);
  const discountValue = Number(product?.discountValue || 0);
  const startsAt = product?.discountStartAt ? new Date(product.discountStartAt) : null;
  const endsAt = product?.discountEndAt ? new Date(product.discountEndAt) : null;

  const isActive =
    originalPrice > 0 &&
    discountValue > 0 &&
    Boolean(product?.discountType) &&
    (!startsAt || startsAt <= now) &&
    (!endsAt || endsAt >= now);

  if (!isActive) {
    return {
      originalUnitPrice: originalPrice,
      unitPrice: originalPrice,
      discountPerUnit: 0,
    };
  }

  let unitPrice = originalPrice;
  if (product.discountType === "percent") {
    unitPrice = Math.round(originalPrice * (1 - discountValue / 100));
  } else if (product.discountType === "fixed" || product.discountType === "flat") {
    unitPrice = originalPrice - discountValue;
  }

  unitPrice = Math.max(0, unitPrice);

  return {
    originalUnitPrice: originalPrice,
    unitPrice,
    discountPerUnit: originalPrice - unitPrice,
  };
}
