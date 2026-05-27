import "dotenv/config";
import { db } from "./index";
import { themesTable } from "./models/theme";
import { eq } from "drizzle-orm";

/**
 * Idempotent theme seeder.
 * Run with: pnpm --filter @repo/database db:seed
 *
 * Adds the built-in themes if they don't already exist.
 * Safe to re-run — checks slug uniqueness before inserting.
 */

const themes = [
  {
    name: "Hidden Leaf",
    slug: "konoha",
    description:
      "Forged with the Will of Fire. Naruto orange, chakra blue, and Akatsuki crimson.",
    category: "anime",
    isDefault: true,
    isActive: true,
    colors: {
      primary: "#FF6B00",
      background: "#0A0A0F",
      surface: "#0F1A10",
      text: "#F0E6C8",
      textMuted: "#8A9A7A",
      accent: "#00D4FF",
      border: "#2A4A2A",
      error: "#8B0000",
    },
    fonts: {
      heading: "Cinzel",
      body: "Noto Sans JP",
      mono: "ui-monospace",
    },
  },
  {
    name: "Akatsuki",
    slug: "akatsuki",
    description:
      "Crimson clouds and ink-black sleeves. The dawn rises in the shadows.",
    category: "anime",
    isActive: true,
    colors: {
      primary: "#CC0000",
      background: "#0A0606",
      surface: "#170A0A",
      text: "#F0E6C8",
      textMuted: "#8A6060",
      accent: "#FFFFFF",
      border: "#3A1A1A",
      error: "#FFD700",
    },
    fonts: {
      heading: "Cinzel",
      body: "Noto Sans JP",
      mono: "ui-monospace",
    },
  },
  {
    name: "Sage Mode",
    slug: "sage-mode",
    description:
      "Toad sage enlightenment. Earth tones, golden chakra, and Mount Myōboku calm.",
    category: "anime",
    isActive: true,
    colors: {
      primary: "#FFD700",
      background: "#0A0E08",
      surface: "#10180D",
      text: "#F0E6C8",
      textMuted: "#9A9A6A",
      accent: "#FF6B00",
      border: "#3A4A2A",
      error: "#CC4400",
    },
    fonts: {
      heading: "Cinzel",
      body: "Noto Sans JP",
      mono: "ui-monospace",
    },
  },
];

async function main() {
  console.log("🌿  Seeding themes…\n");

  let inserted = 0;
  let skipped = 0;

  for (const theme of themes) {
    const [existing] = await db
      .select({ id: themesTable.id })
      .from(themesTable)
      .where(eq(themesTable.slug, theme.slug));

    if (existing) {
      console.log(`   • ${theme.name.padEnd(16)} — already exists, skipped`);
      skipped++;
      continue;
    }

    await db.insert(themesTable).values(theme);
    console.log(`   ✓ ${theme.name.padEnd(16)} — inserted`);
    inserted++;
  }

  console.log(`\n   Inserted: ${inserted}   Skipped: ${skipped}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
