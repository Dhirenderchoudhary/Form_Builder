import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { themesTable } from "./theme";

export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted"]);

export const formStatusEnum = pgEnum("form_status", ["draft", "published", "closed", "archived"]);

export const fieldTypeEnum = pgEnum("field_type", [
  "short_text",     "short_text",
  "long_text",      "long_text",
  "email",          "email",
  "number",         "number",
  "phone",          "phone",
  "url",            "url",
  "date",           "date",
  "time",           "time",
  "select",         "select",
  "multi_select",   "multi_select",
  "checkbox",       "checkbox",
  "rating",         "rating",
  "scale",          "scale",
  "file_upload",    "file_upload",
]);

export const formsTable = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    slug: varchar("slug", { length: 255 }).notNull().unique(),

    status: formStatusEnum("status").notNull().default("draft"),
    visibility: formVisibilityEnum("visibility").notNull().default("unlisted"),

    themeId: uuid("theme_id").references(() => themesTable.id, { onDelete: "set null" }),

    settings: jsonb("settings").notNull().default({}).$type<FormSettings>(),

    maxResponses: integer("max_responses"),

    closesAt: timestamp("closes_at"),

    collectEmail: boolean("collect_email").notNull().default(false),

    successMessage: text("success_message").default("Thank you for your response!"),
    redirectUrl: text("redirect_url"),

    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    index("forms_user_id_idx").on(table.userId),
    index("forms_slug_idx").on(table.slug),
    index("forms_status_visibility_idx").on(table.status, table.visibility),
  ],
);

export interface FormSettings {

  showProgressBar?: boolean;

  shuffleFields?: boolean;

  oneResponsePerIp?: boolean;

  requireAuth?: boolean;

  /** SHA-256 hex digest of the access password. Empty/undefined = no password. */
  passwordHash?: string;
}

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id")
      .notNull()
      .references(() => formsTable.id, { onDelete: "cascade" }),

    type: fieldTypeEnum("type").notNull(),
    label: varchar("label", { length: 500 }).notNull(),
    placeholder: varchar("placeholder", { length: 500 }),
    helpText: text("help_text"),

    order: integer("order").notNull().default(0),

    required: boolean("required").notNull().default(false),

    validations: jsonb("validations").notNull().default({}).$type<FieldValidations>(),

    options: jsonb("options").$type<FieldOption[]>(),

    minValue: integer("min_value"),
    maxValue: integer("max_value"),
    minLabel: varchar("min_label", { length: 100 }),
    maxLabel: varchar("max_label", { length: 100 }),

    conditionalLogic: jsonb("conditional_logic").$type<ConditionalLogic>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [
    index("form_fields_form_id_idx").on(table.formId),
    index("form_fields_order_idx").on(table.formId, table.order),
  ],
);

export interface FieldValidations {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface FieldOption {
  value: string;
  label: string;

  imageUrl?: string;
}

export interface ConditionalLogic {
  action: "show" | "hide";
  conditions: Array<{
    fieldId: string;
    operator: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
    value?: string;
  }>;
  logicOperator: "and" | "or";
}

export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
