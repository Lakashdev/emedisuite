import jwt from "jsonwebtoken";

export function signAccessToken(payload) {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is missing in .env");
  }

  return jwt.sign(payload, secret, { expiresIn });
}
