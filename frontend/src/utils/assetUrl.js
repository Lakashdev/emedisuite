const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function getApiOrigin() {
  try {
    return new URL(API_BASE, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

export function resolveAssetUrl(path) {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiOrigin()}${normalizedPath}`;
}
