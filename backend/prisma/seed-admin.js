import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "admin",
    },
  });

  console.log("Admin user created:");
  console.log({
    email: admin.email,
    role: admin.role,
  });

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Admin seed failed:", err);
  process.exit(1);
});
