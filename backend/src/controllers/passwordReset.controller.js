// backend/src/controllers/passwordReset.controller.js
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { transporter } from "../utils/mailer.js";
import { generate6DigitCode, hashCode } from "../utils/resetCode.js";

export async function forgotPassword(req, res) {
  try {
    const { emailOrPhone } = req.body;
    const input = String(emailOrPhone || "").trim().toLowerCase();

    if (!input) return res.status(400).json({ message: "Email or phone required" });

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: input }, { phone: input }] },
      select: { id: true, email: true, phone: true, name: true },
    });

    if (!user) return res.json({ message: "If the account exists, a reset code has been sent." });

    await prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const code = generate6DigitCode();
    const expiresMin = Number(process.env.RESET_CODE_EXPIRES_MIN || 15);

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        codeHash: hashCode(code),
        expiresAt: new Date(Date.now() + expiresMin * 60 * 1000),
      },
    });

    if (user.email) {
      await transporter.sendMail({
        from: `"Pharmacy App" <no-reply@pharmacy.local>`,
        to: user.email,
        subject: "Your password reset code",
        html: `
          <p>Hi ${user.name || "there"},</p>
          <p>Your password reset code is:</p>
          <h2 style="letter-spacing:2px">${code}</h2>
          <p>This code expires in ${expiresMin} minutes.</p>
        `,
      });
    }

    return res.json({ message: "If the account exists, a reset code has been sent." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { emailOrPhone, code, newPassword } = req.body;

    const input = String(emailOrPhone || "").trim().toLowerCase();
    const rawCode = String(code || "").trim();
    const pwd = String(newPassword || "");

    if (!input || !rawCode || !pwd) return res.status(400).json({ message: "Missing fields" });
    if (pwd.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: input }, { phone: input }] },
      select: { id: true },
    });
    if (!user) return res.status(400).json({ message: "Invalid code or expired" });

    const reset = await prisma.passwordReset.findFirst({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!reset) return res.status(400).json({ message: "Invalid code or expired" });

    const maxAttempts = Number(process.env.RESET_MAX_ATTEMPTS || 5);
    if (reset.attempts >= maxAttempts) {
      await prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } });
      return res.status(400).json({ message: "Too many attempts. Request a new code." });
    }

    const ok = hashCode(rawCode) === reset.codeHash;
    if (!ok) {
      await prisma.passwordReset.update({
        where: { id: reset.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ message: "Invalid code or expired" });
    }

    const passwordHash = await bcrypt.hash(pwd, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    ]);

    return res.json({ message: "Password reset successful. Please login." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
