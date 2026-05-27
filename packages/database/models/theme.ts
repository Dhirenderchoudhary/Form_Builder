import { pgTable, uuid, varchar, text, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

export const themesTable = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),

  colors: jsonb("colors").notNull().$type<ThemeColors>(),

  fonts: jsonb("fonts").notNull().$type<ThemeFonts>(),

  previewImageUrl: text("preview_image_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  error: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
}

export type SelectTheme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;
