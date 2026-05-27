import "dotenv/config";
import { db } from "./index";
import { themesTable } from "./models/theme";
import { usersTable } from "./models/user";
import { formsTable, formFieldsTable } from "./models/form";
import { formResponsesTable, responseAnswersTable } from "./models/response";
import { eq } from "drizzle-orm";

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

  console.log(`\n   Themes Seeded: ${inserted}   Skipped: ${skipped}\n`);

  console.log("👤  Seeding system owner…\n");
  const [systemUser] = await db
    .insert(usersTable)
    .values({
      clerkId: "clerk_system_shinobi",
      fullName: "Hokage's Office",
      email: "hokage@konoha.gov",
      profileImageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150",
    })
    .onConflictDoUpdate({
      target: usersTable.clerkId,
      set: {
        fullName: "Hokage's Office",
        email: "hokage@konoha.gov",
      },
    })
    .returning();

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, "clerk_system_shinobi"));

  const systemUserRecord = existingUser || systemUser;
  if (!systemUserRecord) {
    throw new Error("Could not seed or retrieve Hokage system user.");
  }
  console.log("   ✓ Hokage system owner ready.\n");

  console.log("📜  Seeding public shinobi form templates…\n");

  // Retrieve seeded themes to reference their dynamic UUIDs
  const allThemes = await db.select().from(themesTable);
  const findTheme = (slug: string) => allThemes.find((t) => t.slug === slug)?.id;

  const templates = [
    {
      title: "Genin Academy Registration",
      description: "Official enrollment scroll for aspiring shinobi entering the Hidden Leaf Academy.",
      slug: "genin-academy",
      themeId: findTheme("konoha"),
      status: "published" as const,
      visibility: "public" as const,
      publishedAt: new Date(),
      fields: [
        { type: "short_text" as const, label: "Full Name", placeholder: "e.g. Naruto Uzumaki", required: true },
        {
          type: "select" as const,
          label: "Clan Affiliation",
          required: true,
          options: [
            { value: "uzumaki", label: "Uzumaki Clan" },
            { value: "uchiha", label: "Uchiha Clan" },
            { value: "hyuga", label: "Hyūga Clan" },
            { value: "nara", label: "Nara Clan" },
            { value: "senju", label: "Senju Clan" },
            { value: "civilian", label: "Civilian / None" },
          ],
        },
        { type: "short_text" as const, label: "Signature Jutsu", placeholder: "e.g. Shadow Clone Technique" },
        { type: "long_text" as const, label: "Motivation to become a Shinobi", placeholder: "Why do you want to protect the village?", required: true },
      ],
    },
    {
      title: "S-Rank Bounty Request",
      description: "Submit high-priority bounty requests to the Akatsuki network. High risk, absolute execution.",
      slug: "s-rank-bounty",
      themeId: findTheme("akatsuki"),
      status: "published" as const,
      visibility: "public" as const,
      publishedAt: new Date(),
      fields: [
        { type: "short_text" as const, label: "Client Code / Pseudonym", placeholder: "e.g. Taka", required: true },
        { type: "long_text" as const, label: "Target Description", placeholder: "Name, last seen location, and unique combat abilities...", required: true },
        { type: "number" as const, label: "Reward Bounty (in Ryo)", placeholder: "e.g. 5000000", required: true },
        { type: "date" as const, label: "Elimination Deadline", required: true },
      ],
    },
    {
      title: "Toad Sage Summoning Pact",
      description: "Sign your name in blood to form a contract with the Great Toad Sages of Mount Myōboku.",
      slug: "toad-summoning",
      themeId: findTheme("sage-mode"),
      status: "published" as const,
      visibility: "public" as const,
      publishedAt: new Date(),
      fields: [
        { type: "short_text" as const, label: "Summoner's Name", placeholder: "Write your name in chakra", required: true },
        {
          type: "scale" as const,
          label: "Current Chakra Reserve Level",
          required: true,
          minValue: 1,
          maxValue: 10,
          minLabel: "Academy Student",
          maxLabel: "Hokage Level",
        },
        {
          type: "select" as const,
          label: "Preferred Summon Specialization",
          required: true,
          options: [
            { value: "combat", label: "Combat & Frontline defense (e.g. Gamabunta)" },
            { value: "scout", label: "Intelligence & Scout (e.g. Gamakichi)" },
            { value: "healing", label: "Healing & Barrier Ninjutsu" },
          ],
        },
        { type: "checkbox" as const, label: "I pledge to defend Mount Myōboku coordinates with my life", required: true },
      ],
    },
    {
      title: "Shinobi World War Intel Report",
      description: "Encrypted intelligence scroll to report enemy troop movements and battlefield anomalies.",
      slug: "battlefield-intel",
      themeId: findTheme("blossom"),
      status: "published" as const,
      visibility: "public" as const,
      publishedAt: new Date(),
      fields: [
        { type: "short_text" as const, label: "Reporting Unit / Division", placeholder: "e.g. Intel Division, Unit 3", required: true },
        {
          type: "select" as const,
          label: "Enemy Territory / Origin",
          required: true,
          options: [
            { value: "lightning", label: "Land of Lightning (Cloud Village)" },
            { value: "earth", label: "Land of Earth (Stone Village)" },
            { value: "water", label: "Land of Water (Mist Village)" },
            { value: "wind", label: "Land of Wind (Sand Village)" },
            { value: "rogue", label: "Rogue Shinobi / Unknown" },
          ],
        },
        { type: "number" as const, label: "Estimated Enemy Forces Count", placeholder: "e.g. 250", required: true },
        { type: "long_text" as const, label: "Observed Troop Movement & Threat Level Description", required: true },
      ],
    },
  ];

  for (const t of templates) {
    const [existingForm] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(eq(formsTable.slug, t.slug));

    if (existingForm) {
      console.log(`   • ${t.title.padEnd(32)} — already exists, skipped`);
      continue;
    }

    const { fields, ...formData } = t;
    const [form] = await db
      .insert(formsTable)
      .values({
        ...formData,
        userId: systemUserRecord.id,
      })
      .returning();

    if (form) {
      console.log(`   ✓ ${t.title.padEnd(32)} — created`);
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        await db.insert(formFieldsTable).values({
          formId: form.id,
          type: f.type,
          label: f.label,
          placeholder: (f as any).placeholder || null,
          required: f.required || false,
          order: i,
          options: (f as any).options || null,
          minValue: (f as any).minValue || null,
          maxValue: (f as any).maxValue || null,
          minLabel: (f as any).minLabel || null,
          maxLabel: (f as any).maxLabel || null,
        });
      }
    }
  }

  console.log("👤  Seeding demo user…\n");
  const [demoUser] = await db
    .insert(usersTable)
    .values({
      clerkId: "clerk_demo_shinobi",
      fullName: "Naruto Uzumaki (Demo)",
      email: "naruto.demo@konoha.gov",
      profileImageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150",
    })
    .onConflictDoUpdate({
      target: usersTable.clerkId,
      set: {
        fullName: "Naruto Uzumaki (Demo)",
        email: "naruto.demo@konoha.gov",
      },
    })
    .returning();

  const [existingDemoUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, "clerk_demo_shinobi"));

  const demoUserRecord = existingDemoUser || demoUser;
  if (!demoUserRecord) {
    throw new Error("Could not seed or retrieve demo user.");
  }
  console.log("   ✓ Demo user profile ready.\n");

  console.log("📜  Seeding demo user forms & mock responses…\n");

  const demoForms = [
    {
      title: "Ninja Weapon Inventory Survey",
      description: "Quarterly inspection of tools, kunai, and shuriken currently in possession.",
      slug: "ninja-weapons-survey",
      themeId: findTheme("stark"),
      status: "draft" as const,
      visibility: "unlisted" as const,
      fields: [
        { type: "short_text" as const, label: "Shinobi Name", placeholder: "Your name", required: true },
        { type: "number" as const, label: "Current Kunai Count", placeholder: "e.g. 15", required: true },
        { type: "number" as const, label: "Current Shuriken Count", placeholder: "e.g. 20", required: true },
        { type: "checkbox" as const, label: "Do you require weapon replacements?", required: false },
      ]
    },
    {
      title: "Rasengan Masterclass Signup",
      description: "Register for the elite training session under the Seventh Hokage. Limited seats!",
      slug: "rasengan-enrollment",
      themeId: findTheme("konoha"),
      status: "published" as const,
      visibility: "public" as const,
      publishedAt: new Date(),
      fields: [
        { type: "short_text" as const, label: "Shinobi Name", placeholder: "Write your name in full", required: true },
        {
          type: "select" as const,
          label: "Chakra Nature Type",
          required: true,
          options: [
            { value: "wind", label: "Wind Release (Fūton)" },
            { value: "lightning", label: "Lightning Release (Raiton)" },
            { value: "fire", label: "Fire Release (Katon)" },
            { value: "water", label: "Water Release (Suiton)" },
            { value: "earth", label: "Earth Release (Doton)" },
          ],
        },
        {
          type: "scale" as const,
          label: "Chakra Control Rating",
          required: true,
          minValue: 1,
          maxValue: 5,
          minLabel: "Poor",
          maxLabel: "Masterful",
        },
      ]
    }
  ];

  for (const t of demoForms) {
    const [existingForm] = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(eq(formsTable.slug, t.slug));

    if (existingForm) {
      console.log(`   • ${t.title.padEnd(32)} — already exists, skipped`);
      continue;
    }

    const { fields, ...formData } = t;
    const [form] = await db
      .insert(formsTable)
      .values({
        ...formData,
        userId: demoUserRecord.id,
      })
      .returning();

    if (form) {
      console.log(`   ✓ ${t.title.padEnd(32)} — created`);
      const createdFields = [];
      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        const [field] = await db.insert(formFieldsTable).values({
          formId: form.id,
          type: f.type,
          label: f.label,
          placeholder: (f as any).placeholder || null,
          required: f.required || false,
          order: i,
          options: (f as any).options || null,
          minValue: (f as any).minValue || null,
          maxValue: (f as any).maxValue || null,
          minLabel: (f as any).minLabel || null,
          maxLabel: (f as any).maxLabel || null,
        }).returning();
        createdFields.push(field);
      }

      // Seed mock responses for the published form
      if (t.status === "published" && createdFields.length > 0) {
        console.log(`     ⚡ Seeding mock responses for "${t.title}"…`);
        const mockResponses = [
          { email: "sakura.h@konoha.gov", answers: ["Sakura Haruno", "water", 5] },
          { email: "sasuke.u@konoha.gov", answers: ["Sasuke Uchiha", "lightning", 5] },
          { email: "konohamaru.s@konoha.gov", answers: ["Konohamaru Sarutobi", "wind", 4] },
        ];

        for (const resp of mockResponses) {
          const [response] = await db.insert(formResponsesTable).values({
            formId: form.id,
            respondentEmail: resp.email,
            ipAddress: "127.0.0.1",
            userAgent: "Shinobi Browser v1.0",
            completionTimeMs: Math.floor(15000 + Math.random() * 20000),
          }).returning();

          if (response) {
            for (let i = 0; i < createdFields.length; i++) {
              const field = createdFields[i];
              const ansVal = resp.answers[i];
              if (field && ansVal !== undefined) {
                await db.insert(responseAnswersTable).values({
                  responseId: response.id,
                  fieldId: field.id,
                  value: ansVal,
                });
              }
            }
          }
        }
      }
    }
  }

  console.log("\n🌿  Database seeding completed successfully.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
