import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";
import { getJSON, setJSON, removeItem } from "../utils/storage.js";

const AuthContext = createContext(null);

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(atob(base64).split("").map((c) =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join("")));
  } catch { return null; }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => getJSON("user"));

  const isAuthenticated = !!token && !!user;

  const logout = () => {
    setToken("");
    setUser(null);
    removeItem("token");
    removeItem("user");
  };

  const authFetch = useCallback((url, options = {}) => {
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return fetch(url, { ...options, headers });
  }, [token]);

  // Auto-logout on token expiry at startup
  useEffect(() => {
    if (!token) return;
    const payload = parseJwt(token);
    if (payload?.exp && payload.exp * 1000 <= Date.now()) logout();
  }, []);   // intentionally run once on mount

  const login = async ({ identifier, password }) => {
    const { data } = await api.post("/auth/login", { identifier, password });
    const accessToken = data.accessToken || data.token;
    const u = data.user;
    if (!accessToken || !u) throw new Error("Login failed");
    setToken(accessToken);
    setUser(u);
    localStorage.setItem("token", accessToken);
    setJSON("user", u);
    return { token: accessToken, user: u };
  };

  const register = async ({ name, email, phone, password }) => {
    const { data } = await api.post("/auth/register", { name, email, phone, password });
    const accessToken = data.accessToken || data.token;
    const u = data.user;
    if (!accessToken || !u) throw new Error("Registration failed");
    setToken(accessToken);
    setUser(u);
    localStorage.setItem("token", accessToken);
    setJSON("user", u);
    return { token: accessToken, user: u };
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, register, logout, setUser, setToken, authFetch }),
    [token, user, isAuthenticated, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
