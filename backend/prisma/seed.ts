import prisma from "../src/config/prisma";
import bcrypt from "bcrypt";

async function main() {
  const passwordHash = await bcrypt.hash("changeme123", 10);

  // ---------- SUPER_ADMIN (no clinic) ----------
  await prisma.user.upsert({
    where: { email: "superadmin@hslclinic.test" },
    update: {},
    create: {
      email: "superadmin@hslclinic.test",
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
      clinicId: null,
    },
  });

  // ---------- Clinic ----------
  const clinic = await prisma.clinic.upsert({
    where: { id: "seed-clinic" },
    update: {},
    create: {
      id: "seed-clinic",
      name: "HSL Demo Dental Clinic",
      address: "Annaba, Algeria",
      phone: "0555000000",
    },
  });

  // ---------- One user per clinic role ----------
  const clinicRoles = [
    "ADMIN",
    "DENTIST",
    "ASSISTANT",
    "RECEPTIONIST",
  ] as const;

  const seededUsers: Record<string, { id: string }> = {};

  for (const role of clinicRoles) {
    const user = await prisma.user.upsert({
      where: { email: `${role.toLowerCase()}@hslclinic.test` },
      update: {},
      create: {
        email: `${role.toLowerCase()}@hslclinic.test`,
        passwordHash,
        firstName: role,
        lastName: "Test",
        role,
        clinicId: clinic.id,
      },
    });
    seededUsers[role] = { id: user.id };
  }

  // ---------- Second clinic, for cross-tenant testing ----------
  const clinic2 = await prisma.clinic.upsert({
    where: { id: "seed-clinic-2" },
    update: {},
    create: {
      id: "seed-clinic-2",
      name: "HSL Second Demo Clinic",
      address: "Blida, Algeria",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin2@hslclinic.test" },
    update: {},
    create: {
      email: "admin2@hslclinic.test",
      passwordHash,
      firstName: "Admin",
      lastName: "Two",
      role: "ADMIN",
      clinicId: clinic2.id,
    },
  });

  // ---------- Procedure catalog ----------
  const category = await prisma.procedureCategory.upsert({
    where: { id: "seed-category-preventive" },
    update: {},
    create: {
      id: "seed-category-preventive",
      name: "Preventive",
      sortOrder: 1,
      clinicId: clinic.id,
    },
  });

  const procedure = await prisma.procedure.upsert({
    where: { id: "seed-procedure-cleaning" },
    update: {},
    create: {
      id: "seed-procedure-cleaning",
      name: "Dental Cleaning",
      description: "Routine scale and polish",
      price: 30,
      durationMin: 30,
      categoryId: category.id,
      clinicId: clinic.id,
    },
  });

  // ---------- Sample patient ----------
  const patient = await prisma.patient.upsert({
    where: { id: "seed-patient-1" },
    update: {},
    create: {
      id: "seed-patient-1",
      firstName: "Yasmine",
      lastName: "Cherif",
      phone: "0555000111",
      email: "yasmine.cherif@example.test",
      allergies: "None known",
      clinicId: clinic.id,
    },
  });

  const appointment = await prisma.appointment.upsert({
    where: { id: "seed-appointment-1" },
    update: {},
    create: {
      id: "seed-appointment-1",
      scheduledAt: new Date("2026-08-10T09:00:00Z"),
      reason: "Checkup",
      status: "SCHEDULED",
      patientId: patient.id,
      dentistId: seededUsers.DENTIST.id,
      clinicId: clinic.id,
    },
  });
  console.log("\nSeed complete.\n");
  console.log("Password for every seeded user: changeme123\n");
  console.log("Login accounts:");
  console.log("  superadmin@hslclinic.test   (SUPER_ADMIN, no clinic)");
  console.log("  admin@hslclinic.test        (ADMIN, seed-clinic)");
  console.log("  dentist@hslclinic.test      (DENTIST, seed-clinic)");
  console.log("  assistant@hslclinic.test    (ASSISTANT, seed-clinic)");
  console.log("  receptionist@hslclinic.test (RECEPTIONIST, seed-clinic)");
  console.log(
    "  admin2@hslclinic.test       (ADMIN, seed-clinic-2 — for cross-tenant tests)",
  );
  console.log("\nSample data:");
  console.log(`  Clinic 1 id:    ${clinic.id}`);
  console.log(`  Clinic 2 id:    ${clinic2.id}`);
  console.log(
    `  Patient id:     ${patient.id}  (${patient.firstName} ${patient.lastName})`,
  );
  console.log(`  Category id:    ${category.id}`);
  console.log(
    `  Procedure id:   ${procedure.id}  (${procedure.name}, $${procedure.price})`,
  );
  console.log(`  Dentist id:     ${seededUsers.DENTIST.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
