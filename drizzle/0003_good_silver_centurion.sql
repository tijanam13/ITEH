ALTER TABLE "korisnik" ADD COLUMN "datum_registracije" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "video_lekcija" ADD COLUMN "poredak" integer DEFAULT 0 NOT NULL;