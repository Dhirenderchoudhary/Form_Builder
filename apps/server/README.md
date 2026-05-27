# apps/server — Konoha Forms API Server

The Express 5 backend for Konoha Forms. Handles tRPC procedures, Clerk webhooks, OpenAPI documentation, and email notifications.

---

## Tech Stack

- **Express 5** with TypeScript
- **tRPC 11** with OpenAPI bridge (`trpc-to-openapi`)
- **Clerk Express SDK** for authentication
- **Zod** for input validation
- **Resend** for transactional emails
- **Svix** for webhook verification
- **Helmet + CORS + Rate Limiting** for security

---

## Directory Structure

```
apps/server/
├── src/
│   ├── index.ts           → Entry point (Express app setup)
│   ├── server.ts          → Server configuration, routes, middleware
│   ├── env.ts             → Environment variable validation
│   ├── lib/               → Utility modules
│   ├── middleware/         → Express middleware (auth, error handling)
│   ├── types/             → TypeScript type definitions
│   └── webhooks/          → Clerk webhook handler
├── dist/                  → Compiled output (tsup)
├── package.json
├── tsconfig.json
└── tsup.config.ts         → Build configuration
```

---

## API Routes

The server exposes both tRPC and REST endpoints:

### tRPC Procedures (via `@repo/trpc`)

| Router | Procedures | Auth |
|--------|-----------|------|
| `auth` | `getMe` | Protected |
| `forms` | `list`, `create`, `get`, `update`, `delete`, `publish`, `unpublish`, `setPassword` | Protected |
| `forms` | `addField`, `updateField`, `deleteField`, `reorderField` | Protected |
| `forms` | `listResponses`, `getResponse`, `deleteResponse` | Protected |
| `forms` | `analytics` | Protected |
| `explore` | `listForms`, `listThemes`, `getTheme` | Public |
| `public` | `getFormBySlug`, `submitResponse`, `verifyPassword` | Public |
| `health` | `check` | Public |

### REST / Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trpc/*` | ALL | tRPC HTTP handler |
| `/api/*` | ALL | OpenAPI-compatible REST endpoints |
| `/webhooks/clerk` | POST | Clerk webhook receiver (user.created, etc.) |
| `/docs` | GET | Scalar API documentation UI |

---

## Running

```bash
# Development (from monorepo root)
pnpm --filter @repo/server dev

# Build
pnpm --filter @repo/server build

# Start production
pnpm --filter @repo/server start
```

The server runs on **port 8000** by default (configurable via `PORT` env var).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Yes | Clerk server secret key |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_WEBHOOK_SECRET` | Yes | Clerk webhook signing secret |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `EMAIL_FROM` | Yes | Sender email address |
| `PORT` | No | Server port (default: `8000`) |
| `NODE_ENV` | No | `development` or `production` |
| `BASE_URL` | No | Public URL of the server |
| `WEB_URL` | No | Public URL of the web app |

---

## Security

- **Helmet** — Security headers
- **CORS** — Configured for the web app origin
- **Rate Limiting** — Per-IP request throttling
- **Clerk Auth** — JWT verification on protected procedures
- **Webhook Verification** — Svix signature validation for Clerk webhooks
- **Input Validation** — Zod schemas on every tRPC procedure
