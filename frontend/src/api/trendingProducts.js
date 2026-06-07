const API_BASE = "/api";

export async function getPublicTrendingProducts() {
  const res = await fetch(`${API_BASE}/trending-products`);
  if (!res.ok) throw new Error("Failed to fetch trending products");
  return res.json();
}

export async function adminGetTrendingProducts(token) {
  const res = await fetch(`${API_BASE}/trending-products/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch trending products");
  return res.json();
}

export async function adminSaveTrendingProducts(token, productIds) {
  const res = await fetch(`${API_BASE}/trending-products/admin`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productIds }),
  });
  if (!res.ok) throw new Error("Failed to save trending products");
  return res.json();
}

export async function adminSearchProducts(token, q = "") {
  const res = await fetch(
    `${API_BASE}/products?q=${encodeURIComponent(q)}&limit=12&status=active`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}