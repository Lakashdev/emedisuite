import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";

export async function resetPassword(req, res) {
  const resetToken = String(req.body.resetToken || "").trim();
  const newPassword = String(req.body.newPassword || "");

  if (!resetToken || !newPassword) return res.status(400).json({ message: "resetToken and newPassword are required" });
  if (newPassword.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired reset token" });
  }

  if (payload.type !== "password_reset") return res.status(401).json({ message: "Invalid reset token" });

  const userId = payload.sub;
  const prId = payload.pr;

  const record = await prisma.passwordReset.findUnique({ where: { id: prId } });
  if (!record || record.usedAt) return res.status(400).json({ message: "Reset request is no longer valid" });
  if (record.expiresAt < new Date()) return res.status(400).json({ message: "Reset code expired" });

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })
    prisma.passwordReset.update({
      where: { id: prId },
      data: { usedAt: new Date() },
    }),
  ]);

  return res.json({ message: "Password updated" });
}
