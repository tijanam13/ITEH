import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const ulogaEnum = pgEnum("uloga", [
  "ADMIN",
  "KLIJENT",
  "EDUKATOR",
]);

export const korisnik = pgTable("korisnik", {
  id: uuid("id").primaryKey().defaultRandom(),
  ime: varchar("ime", { length: 100 }).notNull(),
  prezime: varchar("prezime", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  lozinka: varchar("lozinka", { length: 255 }).notNull(),
  uloga: ulogaEnum("uloga").notNull(),
});

