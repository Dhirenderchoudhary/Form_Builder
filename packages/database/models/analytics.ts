import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  integer,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const analyticsEventEnum = pgEnum("analytics_event", [
  "view",         "view",
  "start",        "start",
  "submit",       "submit",
  "abandon",      "abandon",
]);

export const formAnalyticsTable = pgTable(
  "form_analytics",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),

    event: analyticsEventEnum("event").notNull(),

    sessionHash: varchar("session_hash", { length: 64 }),

    ipAddress: varchar("ip_address", { length: 45 }),

    country: varchar("country", { length: 2 }),

    referrer: text("referrer"),

    userAgent: text("user_agent"),

    durationMs: integer("duration_ms"),

    properties: jsonb("properties").$type<Record<string, unknown>>(),

    occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  },
  (table) => [
    index("form_analytics_form_id_idx").on(table.formId),
    index("form_analytics_event_idx").on(table.event),
    index("form_analytics_occurred_at_idx").on(table.occurredAt),
    index("form_analytics_form_event_idx").on(table.formId, table.event),
  ],
);

export type SelectFormAnalytics = typeof formAnalyticsTable.$inferSelect;
export type InsertFormAnalytics = typeof formAnalyticsTable.$inferInsert;
