// prisma/seed.ts

import "dotenv/config";

import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Seeding database...");

  // =========================
  // Clinic
  // =========================

  const clinic = await prisma.clinic.upsert({
    where: {
      id: "main-clinic",
    },
    update: {},
    create: {
      id: "main-clinic",
      name: "My Dental Clinic",
      address: "Algeria",
      phone: "+213000000000",
    },
  });

  // =========================
  // Super Admin
  // =========================

  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD!, 10);

  const email = process.env.SEED_ADMIN_EMAIL!;

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      email,
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      role: UserRole.SUPER_ADMIN,
      clinicId: clinic.id,
    },
  });

  // =========================
  // Procedure Categories
  // =========================

  const preventive = await prisma.procedureCategory.create({
    data: {
      name: "Preventive",
      clinicId: clinic.id,
      sortOrder: 1,
    },
  });

  const restorative = await prisma.procedureCategory.create({
    data: {
      name: "Restorative",
      clinicId: clinic.id,
      sortOrder: 2,
    },
  });

  const surgery = await prisma.procedureCategory.create({
    data: {
      name: "Oral Surgery",
      clinicId: clinic.id,
      sortOrder: 3,
    },
  });

  // =========================
  // Procedures
  // =========================

  await prisma.procedure.createMany({
    data: [
      {
        name: "Dental Cleaning",
        price: 3000,
        durationMin: 30,
        categoryId: preventive.id,
        clinicId: clinic.id,
      },
      {
        name: "Tooth Filling",
        price: 5000,
        durationMin: 45,
        categoryId: restorative.id,
        clinicId: clinic.id,
      },
      {
        name: "Tooth Extraction",
        price: 7000,
        durationMin: 60,
        categoryId: surgery.id,
        clinicId: clinic.id,
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("--------------------------------");
  console.log("Clinic :", clinic.name);
  console.log("Admin Email:", admin.email);
  console.log("Password:", process.env.SEED_ADMIN_PASSWORD);
  console.log("--------------------------------");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
