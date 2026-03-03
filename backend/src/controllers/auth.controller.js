import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { signAccessToken } from "../utils/jwt.js";
import { genOtp6, hashOtp, sendEmailOtp } from "../utils/emailOtp.js";

export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "name and password are required" });
    }
    if (!email && !phone) {
      return res.status(400).json({ message: "email or phone is required" });
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) return res.status(409).json({ message: "email already in use" });
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) return res.status(409).json({ message: "phone already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        passwordHash,
        role: "customer",
        emailVerified: false, // ✅ requires prisma field
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        emailVerified: true, // ✅ send to frontend
      },
    });

    // ✅ send OTP only if email exists
    if (user.email) {
      const otp = genOtp6();
      const expMin = Number(process.env.EMAIL_OTP_EXP_MIN || 10);
      const expiresAt = new Date(Date.now() + expMin * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtpHash: hashOtp(otp),
          emailOtpExpiresAt: expiresAt,
          emailOtpAttempts: 0,
          emailOtpLastSentAt: new Date(),
        },
      });

      // ✅ don't block registration if email fails
      sendEmailOtp(user.email, otp).catch((e) =>
        console.error("sendEmailOtp failed:", e)
      );
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });

    return res.status(201).json({
      user,
      accessToken,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      return res.status(400).json({ message: "Email not found" });
    }

    if (user.emailVerified) {
      return res.json({ message: "Email already verified" });
    }

    if (!user.emailOtpHash || !user.emailOtpExpiresAt) {
      return res.status(400).json({ message: "No verification code found" });
    }

    if (new Date() > user.emailOtpExpiresAt) {
      return res.status(400).json({ message: "Code expired. Please resend." });
    }

    const valid = hashOtp(code) === user.emailOtpHash;

    if (!valid) {
      await prisma.user.update({
        where: { id: userId },
        data: { emailOtpAttempts: { increment: 1 } },
      });
      return res.status(400).json({ message: "Incorrect code" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailOtpHash: null,
        emailOtpExpiresAt: null,
        emailOtpAttempts: 0,
      },
    });

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("verifyEmail error:", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const resendEmailCode = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      return res.status(400).json({ message: "Email not found" });
    }

    if (user.emailVerified) {
      return res.json({ message: "Already verified" });
    }

    const otp = genOtp6();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailOtpHash: hashOtp(otp),
        emailOtpExpiresAt: expiresAt,
        emailOtpAttempts: 0,
        emailOtpLastSentAt: new Date(),
      },
    });

    await sendEmailOtp(user.email, otp);

    return res.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("resendEmailCode error:", error);
    return res.status(500).json({ message: "internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "identifier and password are required" });
    }

    const isEmail = identifier.includes("@");

    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: identifier }
        : { phone: identifier },
    });

    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const accessToken = signAccessToken({
      sub: user.id,
      role: user.role,
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "internal server error" });
  }
};
