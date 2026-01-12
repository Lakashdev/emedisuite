import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./authStorage";

const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // If access token expired, try refresh once
  if (auth && res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders = { "Content-Type": "application/json" };
      const token2 = getAccessToken();
      if (token2) retryHeaders.Authorization = `Bearer ${token2}`;

      const retryRes = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: retryHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      return handleResponse(retryRes);
    }

    clearTokens();
    throw new Error("Unauthorized");
  }

  return handleResponse(res);
}

async function handleResponse(res) {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) return false;

    // expected response: { accessToken, refreshToken? }
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
