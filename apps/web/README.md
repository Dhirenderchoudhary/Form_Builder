# apps/web — Konoha Forms Frontend

The Next.js 16 frontend for Konoha Forms. Provides the dashboard, form builder, public form renderer, and explore pages.

---

## Tech Stack

- **Next.js 16** with App Router and Turbopack
- **React 19** with Server Components
- **TailwindCSS 3** with custom Konoha theme tokens
- **tRPC React Query** for type-safe API calls
- **Clerk** for authentication UI
- **Lucide React** for icons

---

## Directory Structure

```
apps/web/
├── app/
│   ├── (dashboard)/           → Protected dashboard routes
│   │   ├── _components/       → Shared dashboard components
│   │   │   ├── shell.tsx      → Dashboard layout (sidebar + topbar)
│   │   │   ├── sidebar.tsx    → Navigation sidebar
│   │   │   ├── forms-list.tsx → Forms list with tabs, search, theme-apply
│   │   │   ├── create-form-dialog.tsx
│   │   │   ├── delete-form-dialog.tsx
│   │   │   ├── form-row-menu.tsx
│   │   │   ├── stat-card.tsx
│   │   │   └── coming-soon.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx       → Hokage's Desk (home)
│   │   │   ├── forms/         → Form archive & builder
│   │   │   ├── explore/       → Village Map (public forms)
│   │   │   ├── themes/        → Theme Gallery
│   │   │   ├── analytics/     → Sharingan Analytics
│   │   │   └── settings/      → Account settings
│   │   └── layout.tsx         → Auth guard + DashboardShell
│   ├── f/[slug]/              → Public form fill page
│   ├── explore/               → Public explore page
│   ├── api/backend/           → tRPC proxy to Express server
│   ├── globals.css            → Konoha theme + utility classes
│   ├── layout.tsx             → Root layout with ClerkProvider
│   └── page.tsx               → Landing page
├── components/
│   ├── konoha/                → Theme-specific components
│   │   ├── atmosphere.tsx     → Background effects (vignette, rain, watermark)
│   │   ├── characters.tsx     → Itachi, Kakashi, Naruto silhouettes
│   │   ├── dialog.tsx         → Konoha-styled dialog + inputs
│   │   ├── leaf.tsx           → Konoha leaf SVG
│   │   ├── toast.tsx          → Toast notification system
│   │   └── network-status.tsx → Offline indicator
│   └── ui/                    → Generic UI components (Button, Badge)
├── lib/
│   ├── trpc.ts                → tRPC React client instance
│   └── utils.ts               → Utility functions (cn)
├── providers/
│   └── index.tsx              → tRPC + QueryClient + Toast providers
└── middleware.ts              → Clerk auth middleware
```

---

## Theme System

The UI uses a custom **Konoha/Naruto-themed** design system:

| Token | Color | Usage |
|-------|-------|-------|
| `konoha-orange` | `#FF6B00` | Primary / accent |
| `konoha-gold` | `#FFD700` | Highlights / badges |
| `konoha-forest` | `#2A4A2A` | Borders / secondary surfaces |
| `konoha-ink` | `#0F1A10` | Card backgrounds |
| `konoha-akatsuki` | `#8B0000` | Destructive / error |
| `konoha-chakra` | `#00D4FF` | Accent blue |

Custom CSS classes: `.scroll-card`, `.btn-rasengan`, `.chakra-divider`, `.text-glow-orange`

---

## Form Builder

The form builder (`/dashboard/forms/[formId]`) is the core feature:

- **Canvas** — Renders field cards in order with drag-and-drop reordering
- **Inspector** — Right panel for editing field properties or form settings
- **Preview mode** — Toggle to see the form as respondents will
- **Autosave** — Field changes save immediately; form settings debounce at 600ms

Supports 14 field types: Short Text, Long Text, Email, Number, Phone, URL, Date, Time, Single Select, Multi Select, Checkbox, Rating, Scale, File Upload.

---

## Running

```bash
# Development (from monorepo root)
pnpm --filter web dev

# Build
pnpm --filter web build

# Start production
pnpm --filter web start
```

The app runs on **port 3000** by default and proxies tRPC requests to the backend at `NEXT_PUBLIC_API_URL`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (e.g., `http://localhost:8000`) |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk server-side secret key |
