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
  {
    name: "Stark",
    slug: "stark",
    description:
      "Ice-cold minimalism. Clean whites, steel greys, and frost-blue accents. For those who value clarity above all.",
    category: "modern",
    isActive: true,
    colors: {
      primary: "#3B82F6",
      background: "#09090B",
      surface: "#18181B",
      text: "#FAFAFA",
      textMuted: "#A1A1AA",
      accent: "#06B6D4",
      border: "#27272A",
      error: "#EF4444",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      mono: "JetBrains Mono",
    },
  },
  {
    name: "Ember",
    slug: "ember",
    description:
      "Volcanic warmth. Molten oranges, deep crimsons, and ash-grey undertones. Forms that burn with intensity.",
    category: "warm",
    isActive: true,
    colors: {
      primary: "#F97316",
      background: "#0C0A09",
      surface: "#1C1917",
      text: "#FAFAF9",
      textMuted: "#A8A29E",
      accent: "#EF4444",
      border: "#292524",
      error: "#DC2626",
    },
    fonts: {
      heading: "Outfit",
      body: "DM Sans",
      mono: "Fira Code",
    },
  },
  {
    name: "Ocean Depths",
    slug: "ocean",
    description:
      "Deep-sea tranquility. Navy blues, teal accents, and bioluminescent highlights. Calm, collected, professional.",
    category: "cool",
    isActive: true,
    colors: {
      primary: "#0EA5E9",
      background: "#020617",
      surface: "#0F172A",
      text: "#F8FAFC",
      textMuted: "#94A3B8",
      accent: "#2DD4BF",
      border: "#1E293B",
      error: "#F43F5E",
    },
    fonts: {
      heading: "Plus Jakarta Sans",
      body: "Plus Jakarta Sans",
      mono: "IBM Plex Mono",
    },
  },
  {
    name: "Midnight Blossom",
    slug: "blossom",
    description:
      "Elegant and refined. Deep purples, soft pinks, and gold leaf accents. Cherry blossoms under a moonlit sky.",
    category: "elegant",
    isActive: true,
    colors: {
      primary: "#A855F7",
      background: "#0A0118",
      surface: "#140B24",
      text: "#FAF5FF",
      textMuted: "#C084FC",
      accent: "#EC4899",
      border: "#2E1065",
      error: "#F43F5E",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Lora",
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
