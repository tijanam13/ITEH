import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  console.log("❌ GREŠKA: DATABASE_URL nije pronađen u .env fajlu!");
} else {
  console.log("✅ DATABASE_URL je uspešno učitan.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "***REMOVED***ql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});