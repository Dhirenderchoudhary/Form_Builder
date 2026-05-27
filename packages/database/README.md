# @repo/database — Database Package

Drizzle ORM schema definitions, PostgreSQL migrations, and seed scripts for Konoha Forms.

---

## Tech Stack

- **Drizzle ORM** — Type-safe SQL query builder
- **PostgreSQL 15** — Primary database
- **drizzle-kit** — Migration tooling

---

## Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | User profiles synced from Clerk via webhooks |
| `forms` | Form definitions (title, slug, status, visibility, settings) |
| `form_fields` | Individual fields within a form (type, label, order, validations, options) |
| `responses` | Submitted form responses |
| `response_answers` | Individual answers within a response |
| `themes` | Visual themes with color palettes and font stacks |
| `analytics_events` | View/start/completion tracking events |

### Enums

| Enum | Values |
|------|--------|
| `form_status` | `draft`, `published`, `closed`, `archived` |
| `form_visibility` | `public`, `unlisted` |
| `field_type` | `short_text`, `long_text`, `email`, `number`, `phone`, `url`, `date`, `time`, `select`, `multi_select`, `checkbox`, `rating`, `scale`, `file_upload` |

---

## Directory Structure

```
packages/database/
├── models/
│   ├── user.ts          → Users table
│   ├── form.ts          → Forms + FormFields tables + enums
│   ├── response.ts      → Responses + ResponseAnswers tables
│   ├── theme.ts         → Themes table
│   └── analytics.ts     → Analytics events table
├── drizzle/             → Generated migrations
├── schema.ts            → Re-exports all models
├── index.ts             → Database client + connection
├── env.ts               → DATABASE_URL validation
├── seed.ts              → Seed script (themes, sample data)
├── drizzle.config.ts    → Drizzle Kit configuration
└── package.json
```

---

## Usage

### Push Schema (no migrations)

```bash
pnpm --filter @repo/database db:push
```

### Generate Migrations

```bash
pnpm --filter @repo/database db:generate
```

### Run Migrations

```bash
pnpm --filter @repo/database db:migrate
```

### Seed Data

```bash
pnpm --filter @repo/database db:seed
```

Seeds the database with built-in themes (Stark, Ember, Ocean, Forest, etc.).

### Drizzle Studio

```bash
pnpm --filter @repo/database db:studio
```

Opens the Drizzle Studio GUI for browsing and editing data.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/db`) |

---

## Importing in Other Packages

```typescript
import { db } from "@repo/database";
import { formsTable, formFieldsTable } from "@repo/database/schema";
```
