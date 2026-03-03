import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // ✅ important for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // ✅ App Password
    },
    tls: {
        rejectUnauthorized: false, // helps on some Windows setups
    },
});