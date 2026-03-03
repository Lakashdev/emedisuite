import crypto from "crypto";

export function generate6DigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}
