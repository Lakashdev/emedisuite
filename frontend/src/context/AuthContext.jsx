import { createContext, useContext, useMemo, useState, useEffect } from "react";

const AuthContext = createContext(null);

// ✅ helper: decode JWT payload (to check expiry)
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = !!token && !!user;

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // ✅ 1) Auto logout on first load if token already expired
  useEffect(() => {
  if (!token) return;

  const payload = parseJwt(token);
  if (!payload?.exp) return;

  const expired = payload.exp * 1000 <= Date.now();
  if (expired) logout();
}, [token]);

  // ✅ 2) Wrapper fetch: if backend returns 401 -> logout immediately
  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, options);

    if (res.status === 401) {
      // session invalid/expired
      logout();
      throw new Error("Session expired. Please login again.");
    }

    return res;
  };

  const register = async ({ name, email, phone, password }) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    const accessToken = data.accessToken || data.token;
    const u = data.user;

    if (!accessToken || !u) throw new Error("Registration failed");

    setToken(accessToken);
    setUser(u);

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(u));

    return { token: accessToken, user: u };
  };

  const login = async ({ identifier, password }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    const accessToken = data.accessToken || data.token;
    const u = data.user;

    if (!accessToken || !u) throw new Error("Login failed");

    setToken(accessToken);
    setUser(u);

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(u));

    return { token: accessToken, user: u };
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      register,
      logout,

      // expose setters
      setUser,
      setToken,

      // ✅ expose authFetch so pages can use it
      authFetch,
    }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}