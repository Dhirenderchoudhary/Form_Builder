ALTER TABLE "form_fields" ADD COLUMN "page_break" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "page_title" varchar(255);--> statement-breakpoint
ALTER TABLE "form_fields" ADD COLUMN "page_description" text;