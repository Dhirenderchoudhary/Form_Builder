# Konoha Forms — Form Builder

> *"Those who break the rules are scum, but those who abandon their comrades are worse than scum."* — Kakashi Hatake

A full-stack, production-grade **form builder SaaS** built with a Naruto-themed UI. Create beautiful forms, collect responses, and analyse results — all from the Hokage's desk.

[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![tRPC](https://img.shields.io/badge/tRPC-11-blue?logo=trpc)](https://trpc.io)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team)
[![Clerk Auth](https://img.shields.io/badge/Clerk-Auth-purple)](https://clerk.com)

---

## 🌐 Live Links

- **Deployed App**: [https://konoha-forma.dhirenderchoudhary.com/](https://konoha-forma.dhirenderchoudhary.com/)
- **Frontend (Vercel)**: [https://form-builder-web-eight.vercel.app](https://form-builder-web-eight.vercel.app)
- **Backend (Render)**: [https://form-builder-ampl.onrender.com](https://form-builder-ampl.onrender.com)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Form Builder** | Drag-and-drop field editor with 14 field types (text, email, select, rating, scale, file upload, etc.) |
| **Live Preview** | Toggle between edit and preview modes in real-time |
| **Theme Gallery** | Apply curated visual themes to your forms — each theme is a complete sensory experience |
| **Public Explorer** | Browse and discover forms published by other users |
| **Analytics** | Track responses, completion rates, and field-level breakdowns |
| **Password Protection** | Lock forms behind an access password |
| **Autosave** | Field and form-level changes are saved automatically with debounce |
| **Clerk Auth** | Secure authentication with Clerk (SSO, MFA, etc.) |
| **Responsive** | Full mobile, tablet, and desktop support |

---

## 🏗️ Architecture

This is a **Turborepo monorepo** with two apps and seven shared packages:

```
form-builder/
├── apps/
│   ├── web/          → Next.js 16 frontend (dashboard, builder, public pages)
│   └── server/       → Express + tRPC API server
├── packages/
│   ├── database/     → Drizzle ORM schema, migrations, seeds
│   ├── services/     → Business logic layer (form, response, analytics, theme, email)
│   ├── trpc/         → tRPC router definitions + React client
│   ├── ui/           → Shared React component library
│   ├── logger/       → Structured logging utility
│   ├── eslint-config/→ Shared ESLint configuration
│   └── typescript-config/ → Shared TypeScript configurations
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed system diagram.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 10
- **PostgreSQL** 15+ (or Docker)

### 1. Clone & Install

```bash
git clone https://github.com/Dhirenderchoudhary/Form_Builder.git 
pnpm install
```

### 2. Environment Setup

```bash
# Copy the example env and fill in your keys
cp .env.example .env

# Symlink .env to all apps and packages
bash setup.sh
```

Required environment variables (see [.env.example](./.env.example)):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk backend key |
| `CLERK_WEBHOOK_SECRET` | Clerk webhook signing secret |
| `RESEND_API_KEY` | Resend email API key |
| `NEXT_PUBLIC_API_URL` | Backend URL (default: `http://localhost:8000`) |

### 3. Database

**Option A — Docker (recommended):**
```bash
docker compose up -d
```

**Option B — External Postgres:**
Set your `DATABASE_URL` in `.env`.

Then run migrations and seed data:
```bash
# Push schema to database
pnpm --filter @repo/database db:push

# Seed themes and sample data
pnpm --filter @repo/database db:seed
```

### 4. Run Development Servers

```bash
# Start both web (port 3000) and server (port 8000)
pnpm dev
```

Or individually:
```bash
pnpm --filter web dev        # Next.js on :3000
pnpm --filter @repo/server dev  # Express on :8000
```

---

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format all TypeScript and Markdown files with Prettier |
| `pnpm check-types` | Run TypeScript type checking across the monorepo |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 3, Lucide Icons |
| **Backend** | Express 5, tRPC 11, Zod validation |
| **Database** | PostgreSQL 15, Drizzle ORM |
| **Auth** | Clerk (SSO, webhooks, session tokens) |
| **Email** | Resend |
| **Monorepo** | Turborepo, pnpm workspaces |
| **Type Safety** | TypeScript 5.9, end-to-end tRPC types |

---

## 📁 Key Routes

### Dashboard (authenticated)
| Route | Purpose |
|-------|---------|
| `/dashboard` | Hokage's Desk — overview with stats, recent forms, explore suggestions |
| `/dashboard/forms` | Form archive — list, search, filter, create, delete |
| `/dashboard/forms/[formId]` | Form builder — drag-and-drop field editor |
| `/dashboard/explore` | Village Map — discover public forms |
| `/dashboard/themes` | Theme Gallery — browse and apply themes |
| `/dashboard/analytics` | Sharingan Analytics — response tracking |
| `/dashboard/analytics/[formId]` | Per-form analytics deep dive |
| `/dashboard/settings` | Account settings and notification preferences |

### Public
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/f/[slug]` | Public form fill page |
| `/explore` | Public form explorer |

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, branch conventions, and PR process.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
