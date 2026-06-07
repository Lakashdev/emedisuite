export const CART_UPDATED_EVENT = "cart-updated";

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getGuestCartCount() {
  try {
    const items = JSON.parse(localStorage.getItem("guest_cart") || "[]");
    if (!Array.isArray(items)) return 0;

    return items.reduce((total, item) => total + Number(item.qty || item.quantity || 0), 0);
  } catch {
    return 0;
  }
}
