import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { formFieldsTable } from "./form";

export const formResponsesTable = pgTable(
  "form_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),

    respondentEmail: varchar("respondent_email", { length: 255 }),

    ipAddress: varchar("ip_address", { length: 45 }),

    userAgent: text("user_agent"),

    metadata: jsonb("metadata").$type<ResponseMetadata>(),

    completionTimeMs: integer("completion_time_ms"),

    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  },
  (table) => [
    index("form_responses_form_id_idx").on(table.formId),
    index("form_responses_submitted_at_idx").on(table.submittedAt),
    index("form_responses_ip_form_idx").on(table.ipAddress, table.formId),
  ],
);

export interface ResponseMetadata {

  referer?: string;

  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  country?: string;
}

export type SelectFormResponse = typeof formResponsesTable.$inferSelect;
export type InsertFormResponse = typeof formResponsesTable.$inferInsert;

export const responseAnswersTable = pgTable(
  "response_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    responseId: uuid("response_id")
      .notNull()
      .references(() => formResponsesTable.id, { onDelete: "cascade" }),

    fieldId: uuid("field_id")
      .notNull()
      .references(() => formFieldsTable.id, { onDelete: "cascade" }),

    value: jsonb("value").notNull().$type<AnswerValue>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("response_answers_response_id_idx").on(table.responseId),
    index("response_answers_field_id_idx").on(table.fieldId),
  ],
);

export type AnswerValue = string | number | boolean | string[] | null;

export type SelectResponseAnswer = typeof responseAnswersTable.$inferSelect;
export type InsertResponseAnswer = typeof responseAnswersTable.$inferInsert;
