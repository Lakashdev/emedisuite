import nodemailer from "nodemailer";

export function createMailer() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendResetCodeEmail({ to, code }) {
  const transporter = createMailer();

  const from = process.env.SMTP_FROM;
  const subject = "Your MediSuite password reset code";
  const text = `Your password reset code is: ${code}\nThis code expires soon. If you did not request it, ignore this email.`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2 style="margin:0 0 12px">Password reset</h2>
      <p>Use this code to reset your MediSuite password:</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</div>
      <p style="color:#555">This code expires soon. If you did not request it, ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({ from, to, subject, text, html });
}
