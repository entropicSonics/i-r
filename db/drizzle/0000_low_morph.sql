CREATE SCHEMA "ir";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth.users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ir"."note_tag" (
	"note_id" uuid,
	"tag_id" uuid,
	CONSTRAINT "note_tag_note_id_tag_id_pk" PRIMARY KEY("note_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ir"."note" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"content_embedding" "vector",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ir"."profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ir"."tag" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid,
	"name" text NOT NULL,
	"hex_color" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_profile_id_index" ON "ir"."note" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_created_at_index" ON "ir"."note" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_updated_at_index" ON "ir"."note" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "note_deleted_at_index" ON "ir"."note" ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_profile_id_index" ON "ir"."tag" ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_created_at_index" ON "ir"."tag" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_updated_at_index" ON "ir"."tag" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_deleted_at_index" ON "ir"."tag" ("deleted_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ir"."note_tag" ADD CONSTRAINT "note_tag_note_id_note_id_fk" FOREIGN KEY ("note_id") REFERENCES "ir"."note"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ir"."note_tag" ADD CONSTRAINT "note_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "ir"."tag"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ir"."profile" ADD CONSTRAINT "profile_id_auth.users_id_fk" FOREIGN KEY ("id") REFERENCES "auth.users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
