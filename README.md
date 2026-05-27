# 🦊 Konoha Form Scrolls

![Konoha Form Scrolls Banner](https://images.unsplash.com/photo-1542435503-956c26b96560?auto=format&fit=crop&q=80&w=2000&h=600)

> A production-grade, dynamic form builder SaaS built with the T3 Stack (Turborepo, Next.js, tRPC, Drizzle) and styled with modern web aesthetics inspired by the Hidden Leaf Village.

## 🚀 Live Demo & Credentials

**Live URL:** [https://konoha-forma.dhirenderchoudhary.com/](https://konoha-forma.dhirenderchoudhary.com/)

**Demo Credentials (for Judges):**
- **Email:** `demo@konoha.com`
- **Password:** `Naruto@123`

*(You can also sign up for a new account using the Clerk authentication flow).*

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Hackathon Requirements Checklist](#-hackathon-requirements-checklist)
- [Local Setup](#-local-setup)
- [API Documentation](#-api-documentation)

---

## ✨ Features

- **Dynamic Form Builder:** Create and customize forms with various field types (Text, Email, Rating, Select, Date, Checkbox, etc.).
- **Conditional Logic:** Show or hide fields based on answers from previous fields to create personalized pathways.
- **Form Passwords & Expiry:** Add password protection to your forms or set a hard deadline (`closesAt`) and response limits.
- **Custom Themes:** Apply custom aesthetics, colors, and branding using the Built-in Theme Picker.
- **Analytics & Dashboards:** Visualize response data with rich charts, CSV exports, and detailed analytics grids.
- **Public vs. Unlisted Visibility:** Publish forms to the Public Explore Grid (Village Map) or keep them unlisted for private sharing.
- **Spam Protection:** In-memory rate limiting and response validation via Zod schemas.
- **Email Notifications:** Automated email delivery using Resend whenever a scroll is submitted.

---

## 🛠 Tech Stack

- **Monorepo:** Turborepo
- **Framework:** Next.js 15 (App Router)
- **API:** tRPC (Type-safe RPC) + OpenAPI via `trpc-to-openapi`
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Drizzle ORM
- **Authentication:** Clerk
- **Emails:** Resend
- **Validation:** Zod
- **Styling:** Tailwind CSS (via Tailwind v4) + Framer Motion
- **API Docs:** Scalar (`@scalar/nextjs-api-reference`)

---

## 🏗 Architecture

The repository is structured as a Turborepo monorepo with separated boundaries:

```text
├── apps/
│   ├── web/             # Next.js 15 Frontend + API Routes
│   └── server/          # Express backend (Optional/Alternative)
├── packages/
│   ├── database/        # Drizzle ORM models, schemas, and migrations
│   ├── trpc/            # tRPC routers, server definitions, and procedures
│   ├── services/        # Core business logic (forms, analytics, users, emails)
│   ├── logger/          # Shared logging utility
│   ├── eslint-config/   # Shared ESLint configuration
│   └── typescript-config/ # Shared tsconfig
```

---

## 🎯 Hackathon Requirements Checklist

✅ **Core:** User auth, Form Builder, Dynamic Fields, Public/Unlisted modes.
✅ **Public Viewing:** Public forms are displayed in the Explore grid without requiring login to answer.
✅ **Analytics:** Response dashboards, KPIs, and tabular views.
✅ **Emails:** Creator notification and Respondent confirmation flows via Resend.
✅ **SaaS Shell:** Landing page, Pricing Page, custom branding.
✅ **Monorepo:** Built on the required Turborepo starter structure.
✅ **API Docs:** Swagger/OpenAPI spec rendered beautifully using Scalar (`/api/docs`).
✅ **Validation & Safety:** Rate limiting on submissions, Zod input validation, type-safe boundaries.
✅ **Bonus:** Conditional logic, form expiry, CSV export, custom themes, password protection.

---

## 💻 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Dhirenderchoudhary/Form_Builder.git
   cd Form_Builder
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables:**
   Copy the example environment file and fill in your keys:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```
   *Required keys:* Clerk (Auth), Neon (Postgres Database), Resend (Emails).

4. **Run Database Migrations:**
   ```bash
   pnpm --filter @repo/database db:push
   ```

5. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   The web application will run at `http://localhost:3000`.

---

## 📚 API Documentation

We generate an OpenAPI 3.0 specification directly from our tRPC routers using `trpc-to-openapi`.
You can view the interactive API documentation rendered by **Scalar** by visiting:

[https://konoha-forma.dhirenderchoudhary.com/api/docs](https://konoha-forma.dhirenderchoudhary.com/api/docs)
