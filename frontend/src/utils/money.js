/**
 * Format a number as Nepali Rupees.
 * e.g.  formatNPR(1299)  →  "NPR 1,299"
 */
export function formatNPR(amount) {
  if (amount == null || isNaN(amount)) return "—";
  return `NPR ${Number(amount).toLocaleString("en-NP")}`;
}

/**
 * Calculate the effective (discounted) price of a product.
 * Returns { price, originalPrice, discountPct } — all as numbers.
 */
export function getEffectivePrice(product) {
  const base = product.basePrice;
  const now = new Date();
  const inWindow =
    product.discountType &&
    product.discountValue > 0 &&
    (!product.discountStartAt || new Date(product.discountStartAt) <= now) &&
    (!product.discountEndAt || new Date(product.discountEndAt) >= now);

  if (!inWindow) {
    return { price: base, originalPrice: null, discountPct: 0 };
  }

  let discounted;
  if (product.discountType === "percent") {
    discounted = Math.round(base * (1 - product.discountValue / 100));
  } else {
    discounted = Math.max(0, base - product.discountValue);
  }

  const discountPct = Math.round(((base - discounted) / base) * 100);
  return { price: discounted, originalPrice: base, discountPct };
}
