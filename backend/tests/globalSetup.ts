import { execSync } from "child_process";
import dotenv from "dotenv";

export default async function globalSetup() {
  dotenv.config({ path: ".env.test" });
  process.env.DATABASE_URL = process.env.DATABASE_URL; // loaded from .env.test above

  execSync("npx prisma migrate deploy", {
    env: { ...process.env },
    stdio: "inherit",
  });
}
