import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await db.user.upsert({
    where: { email: "admin@perusahaan.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@perusahaan.com",
      password: hash,
      role: "ADMIN",
    },
  });
  console.log("Seed done. Login: admin@perusahaan.com / admin123");
}

main().catch(console.error).finally(() => db.$disconnect());
