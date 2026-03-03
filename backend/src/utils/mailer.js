import nodemailer from "nodemailer";

function reqEnv(k) {
  const v = process.env[k];
  if (!v || String(v).trim() === "") throw new Error(`Missing env var: ${k}`);
  return String(v).trim();
}

export const transporter = nodemailer.createTransport({
  host: reqEnv("SMTP_HOST"),
  port: Number(reqEnv("SMTP_PORT")),
  secure: false,
  auth: { user: reqEnv("SMTP_USER"), pass: reqEnv("SMTP_PASS") },
});
