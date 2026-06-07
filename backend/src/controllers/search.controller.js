import { prisma } from "../config/prisma.js";
import { normalizeSearchText, productSearchScore, searchScore } from "../utils/catalogSearch.js";

const SYSTEM_DESTINATIONS = [
  {
    id: "shop",
    label: "Shop all products",
    meta: "Browse medicines, skincare and wellness products",
    href: "/products",
    keywords: "shop store catalog products medicines medicine skincare supplements wellness browse",
  },
  {
    id: "brands",
    label: "Browse brands",
    meta: "Explore all available brands",
    href: "/brands",
    keywords: "brands manufacturers companies browse brand",
  },
  {
    id: "about",
    label: "About Medisuite",
    meta: "Learn about our pharmacy and mission",
    href: "/about",
    keywords: "about medisuite company pharmacy mission vision genuine trusted who are you",
  },
  {
    id: "contact",
    label: "Contact us",
    meta: "Phone, email, address and opening hours",
    href: "/contact",
    keywords: "contact support help phone email address location opening hours customer service",
  },
  {
    id: "cart",
    label: "My cart",
    meta: "Review products added to your cart",
    href: "/cart",
    keywords: "cart basket bag selected products buy",
  },
  {
    id: "checkout",
    label: "Checkout",
    meta: "Complete your current purchase",
    href: "/checkout",
    keywords: "checkout payment delivery address place order buy",
  },
  {
    id: "orders",
    label: "My orders",
    meta: "Track and review your orders",
    href: "/orders",
    keywords: "orders purchases tracking delivery history status",
  },
  {
    id: "profile",
    label: "My profile",
    meta: "Manage your account information",
    href: "/profile",
    keywords: "profile account details personal information settings",
  },
  {
    id: "login",
    label: "Sign in",
    meta: "Access your Medisuite account",
    href: "/login",
    keywords: "login log in sign in account customer",
  },
  {
    id: "register",
    label: "Create an account",
    meta: "Register as a new customer",
    href: "/register",
    keywords: "register sign up create account new customer",
  },
];

export async function searchCatalog(req, res) {
  try {
    const query = normalizeSearchText(req.query.q);
    if (query.length < 2) return res.json({ items: [] });

    const [products, brands, categories] = await Promise.all([
      prisma.product.findMany({
        where: { status: "active" },
        select: {
          id: true, name: true, slug: true, description: true, basePrice: true,
          images: { select: { url: true }, orderBy: { position: "asc" }, take: 1 },
          brand: { select: { name: true } },
          category: { select: { name: true } },
          variants: { select: { name: true, sku: true } },
        },
        take: 250,
      }),
      prisma.brand.findMany({ where: { status: "active" }, select: { id: true, name: true, slug: true } }),
      prisma.category.findMany({ where: { status: "active" }, select: { id: true, name: true, slug: true } }),
    ]);

    const items = [
      ...products.map((item) => ({
        type: "product",
        id: item.id,
        label: item.name,
        meta: [item.brand?.name, item.category?.name].filter(Boolean).join(" · "),
        href: `/products?q=${encodeURIComponent(query)}`,
        image: item.images[0]?.url || null,
        price: item.basePrice,
        rank: productSearchScore(query, item),
      })),
      ...brands.map((item) => ({
        type: "brand", id: item.id, label: item.name, meta: "Brand",
        href: `/products?brand=${encodeURIComponent(item.slug)}`,
        rank: Math.max(searchScore(query, item.name), searchScore(query, item.slug)),
      })),
      ...categories.map((item) => ({
        type: "category", id: item.id, label: item.name, meta: "Category",
        href: `/products?category=${encodeURIComponent(item.slug)}`,
        rank: Math.max(searchScore(query, item.name), searchScore(query, item.slug)),
      })),
      ...SYSTEM_DESTINATIONS.map((item) => ({
        type: "page",
        id: item.id,
        label: item.label,
        meta: item.meta,
        href: item.href,
        rank: Math.max(searchScore(query, item.label), searchScore(query, item.meta), searchScore(query, item.keywords)),
      })),
    ]
      .filter((item) => item.rank > 0)
      .sort((a, b) => b.rank - a.rank || a.label.localeCompare(b.label))
      .slice(0, 12)
      .map(({ rank, ...item }) => item);

    res.json({ items, query });
  } catch (error) {
    console.error("SEARCH CATALOG ERROR:", error);
    res.status(500).json({ message: "Search failed." });
  }
}
