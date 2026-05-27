CREATE TYPE "public"."field_type" AS ENUM('short_text', 'long_text', 'email', 'number', 'phone', 'url', 'date', 'time', 'select', 'multi_select', 'checkbox', 'rating', 'scale', 'file_upload');--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('draft', 'published', 'closed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."form_visibility" AS ENUM('public', 'unlisted');--> statement-breakpoint
CREATE TYPE "public"."analytics_event" AS ENUM('view', 'start', 'submit', 'abandon');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"full_name" varchar(80),
	"email" varchar(255) NOT NULL,
	"profile_image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(50),
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"colors" jsonb NOT NULL,
	"fonts" jsonb NOT NULL,
	"preview_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "themes_name_unique" UNIQUE("name"),
	CONSTRAINT "themes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"type" "field_type" NOT NULL,
	"label" varchar(500) NOT NULL,
	"placeholder" varchar(500),
	"help_text" text,
	"order" integer DEFAULT 0 NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"validations" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"options" jsonb,
	"min_value" integer,
	"max_value" integer,
	"min_label" varchar(100),
	"max_label" varchar(100),
	"conditional_logic" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL,
	"status" "form_status" DEFAULT 'draft' NOT NULL,
	"visibility" "form_visibility" DEFAULT 'unlisted' NOT NULL,
	"theme_id" uuid,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"max_responses" integer,
	"closes_at" timestamp,
	"collect_email" boolean DEFAULT false NOT NULL,
	"success_message" text DEFAULT 'Thank you for your response!',
	"redirect_url" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "form_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"respondent_email" varchar(255),
	"ip_address" varchar(45),
	"user_agent" text,
	"metadata" jsonb,
	"completion_time_ms" integer,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "response_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"event" "analytics_event" NOT NULL,
	"session_hash" varchar(64),
	"ip_address" varchar(45),
	"country" varchar(2),
	"referrer" text,
	"user_agent" text,
	"duration_ms" integer,
	"properties" jsonb,
	"occurred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_answers" ADD CONSTRAINT "response_answers_response_id_form_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."form_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "response_answers" ADD CONSTRAINT "response_answers_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_analytics" ADD CONSTRAINT "form_analytics_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "form_fields_form_id_idx" ON "form_fields" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "form_fields_order_idx" ON "form_fields" USING btree ("form_id","order");--> statement-breakpoint
CREATE INDEX "forms_user_id_idx" ON "forms" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "forms_slug_idx" ON "forms" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "forms_status_visibility_idx" ON "forms" USING btree ("status","visibility");--> statement-breakpoint
CREATE INDEX "form_responses_form_id_idx" ON "form_responses" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "form_responses_submitted_at_idx" ON "form_responses" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "form_responses_ip_form_idx" ON "form_responses" USING btree ("ip_address","form_id");--> statement-breakpoint
CREATE INDEX "response_answers_response_id_idx" ON "response_answers" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "response_answers_field_id_idx" ON "response_answers" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "form_analytics_form_id_idx" ON "form_analytics" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "form_analytics_event_idx" ON "form_analytics" USING btree ("event");--> statement-breakpoint
CREATE INDEX "form_analytics_occurred_at_idx" ON "form_analytics" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "form_analytics_form_event_idx" ON "form_analytics" USING btree ("form_id","event");