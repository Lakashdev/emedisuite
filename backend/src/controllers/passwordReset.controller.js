import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { sendResetCodeEmail } from "../services/email.service.js";

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function makeCode() {
  // 6 digits
  return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

export async function forgotPassword(req, res) {
  const email = normalizeEmail(req.body.email);
  if (!email) return res.status(400).json({ message: "email is required" });

  const user = await prisma.user.findFirst({ where: { email } });

  // Always respond success (avoid user enumeration)
  const okResponse = { message: "If the account exists, a verification code has been sent." };

  if (!user) return res.json(okResponse);

  // optional: delete old unused codes
  await prisma.passwordReset.deleteMany({
    where: { userId: user.id, usedAt: null },
  });

  const ttlMin = Number(process.env.RESET_CODE_TTL_MINUTES || 10);
  const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

  const code = makeCode();
  const pepper = process.env.RESET_CODE_PEPPER || "";
  const codeHash = sha256(`${code}:${pepper}`);

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt,
    },
  });

  await sendResetCodeEmail({ to: email, code });

  return res.json(okResponse);
}

export async function verifyResetCode(req, res) {
  const email = normalizeEmail(req.body.email);
  const code = String(req.body.code || "").trim();

  if (!email || !code) return res.status(400).json({ message: "email and code are required" });

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return res.status(400).json({ message: "Invalid code" });

  const latest = await prisma.passwordReset.findFirst({
    where: { userId: user.id, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) return res.status(400).json({ message: "Invalid code" });
  if (latest.expiresAt < new Date()) return res.status(400).json({ message: "Code expired" });

  // basic attempt limiting
  if (latest.attempts >= 5) return res.status(429).json({ message: "Too many attempts. Request a new code." });

  const pepper = process.env.RESET_CODE_PEPPER || "";
  const inputHash = sha256(`${code}:${pepper}`);

  if (inputHash !== latest.codeHash) {
    await prisma.passwordReset.update({
      where: { id: latest.id },
      data: { attempts: { increment: 1 } },
    });
    return res.status(400).json({ message: "Invalid code" });
  }

  // create short-lived reset token
  const resetToken = jwt.sign(
    { sub: user.id, pr: latest.id, type: "password_reset" },
    process.env.RESET_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  return res.json({ resetToken });
}
