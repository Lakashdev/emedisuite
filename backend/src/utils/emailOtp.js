import crypto from "crypto";
import { mailer } from "../config/mailer.js";

export const genOtp6 = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

export const hashOtp = (otp) =>
    crypto.createHash("sha256").update(otp).digest("hex");

export const sendEmailOtp = async (toEmail, otp) => {
    await mailer.sendMail({
        from: process.env.MAIL_FROM,
        to: toEmail,
        subject: "Your MediSuite verification code",
        text: `Your verification code is ${otp}. It expires in ${process.env.EMAIL_OTP_EXP_MIN || 10} minutes.`,
        html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>MediSuite email verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</div>
        <p>This code expires in <b>${process.env.EMAIL_OTP_EXP_MIN || 10} minutes</b>.</p>
        <p>If you didn’t request this, you can ignore this email.</p>
      </div>
    `,
    });
};