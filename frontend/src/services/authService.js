import { api } from "../utils/api";
import { setTokens, setUser, getAccessToken } from "../utils/authStorage";

export async function register(payload) {
  const data = await api.post("/api/auth/register", payload);

  if (data.accessToken || data.refreshToken) {
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  }
  if (data.user) setUser(data.user);

  return data;
}

export async function login(payload) {
  // payload can be { email, password } OR { phone, password }
  const data = await api.post("/api/auth/login", payload);

  if (data.accessToken || data.refreshToken) {
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  }
  if (data.user) setUser(data.user);

  return data;
}

export async function me() {
  const token = getAccessToken();
  if (!token) throw new Error("No access token");
  return api.get("/api/me", token);
}
