# @repo/trpc — tRPC Router & Client

Shared tRPC router definitions (server-side) and the React Query client (client-side). This package is the **type contract** between the frontend and backend.

---

## Structure

```
packages/trpc/
├── server/
│   ├── index.ts          → Root router composition + exports
│   ├── trpc.ts           → tRPC init, middleware, procedure helpers
│   ├── context.ts        → Request context (auth, db)
│   ├── schema.ts         → Shared schema utilities
│   ├── routes/
│   │   ├── auth/         → Auth router (getMe)
│   │   ├── forms/        → Forms router (CRUD, fields, responses, analytics)
│   │   ├── explore/      → Explore router (public forms, themes)
│   │   ├── public/       → Public router (form fill, submit, password verify)
│   │   └── health/       → Health check router
│   ├── schemas/
│   │   └── form.schemas.ts → Zod schemas for form inputs
│   ├── services/
│   │   └── index.ts      → Service instantiation
│   └── utils/
│       └── path-generator.ts → OpenAPI path helper
├── client/
│   └── index.ts          → Re-exports ServerRouter type for the frontend
├── package.json
└── tsconfig.json
```

---

## Routers

### `authRouter`
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `getMe` | Query | Protected | Get current user profile |

### `formsRouter`
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `list` | Query | Protected | List all forms for the user |
| `create` | Mutation | Protected | Create a new draft form |
| `get` | Query | Protected | Get form with all fields |
| `update` | Mutation | Protected | Update form details |
| `delete` | Mutation | Protected | Archive (soft-delete) a form |
| `publish` | Mutation | Protected | Publish a form |
| `unpublish` | Mutation | Protected | Unpublish (seal) a form |
| `setPassword` | Mutation | Protected | Set or clear form password |
| `addField` | Mutation | Protected | Add a field to a form |
| `updateField` | Mutation | Protected | Update field properties |
| `deleteField` | Mutation | Protected | Delete a field |
| `reorderField` | Mutation | Protected | Reorder a field |
| `listResponses` | Query | Protected | Paginated response list |
| `getResponse` | Query | Protected | Single response detail |
| `deleteResponse` | Mutation | Protected | Delete a response |
| `analytics` | Query | Protected | Form analytics summary |

### `exploreRouter`
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `listForms` | Query | Public | Browse public forms (paginated, searchable) |
| `listThemes` | Query | Public | List all themes |
| `getTheme` | Query | Public | Get theme by slug |

### `publicRouter`
| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `getFormBySlug` | Query | Public | Get published form for filling |
| `submitResponse` | Mutation | Public | Submit a form response |
| `verifyPassword` | Mutation | Public | Check form password |

---

## Usage

### Server (Express)

```typescript
import { serverRouter, createBaseContext } from "@repo/trpc/server";

// Mount in Express with trpc-to-openapi adapter
```

### Client (Next.js)

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { ServerRouter } from "@repo/trpc/client";

export const trpc = createTRPCReact<ServerRouter>();
```

---

## Dependencies

- `@repo/services` — Business logic layer
- `zod` — Input validation
- `@trpc/server` — tRPC core
