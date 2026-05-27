# @repo/services — Business Logic Layer

The service layer for Konoha Forms. Contains all business logic, data access patterns, and domain operations used by the tRPC routers.

---

## Services

| Service | Responsibility |
|---------|----------------|
| **FormService** | CRUD for forms and fields, slug generation, publish/unpublish, password management, public form queries |
| **ResponseService** | Submit responses, validate answers, paginated listing, deletion |
| **AnalyticsService** | Track views/starts/completions, generate analytics summaries per form |
| **ThemeService** | List themes, get by slug, manage theme assignments |
| **UserService** | Upsert users from Clerk webhooks, profile lookup |
| **EmailService** | Send transactional emails via Resend (response notifications, etc.) |

---

## Directory Structure

```
packages/services/
├── form/
│   └── index.ts         → FormService class
├── response/
│   └── index.ts         → ResponseService class
├── analytics/
│   └── index.ts         → AnalyticsService class
├── theme/
│   └── index.ts         → ThemeService class
├── user/
│   └── index.ts         → UserService class
├── email/
│   └── index.ts         → EmailService class
├── utils/
│   └── slug.ts          → Slug generation utility
├── base.ts              → BaseService abstract class (shared DB access)
├── index.ts             → Re-exports all services and types
├── package.json
└── tsconfig.json
```

---

## Usage

```typescript
import { FormService, ResponseService, ThemeService } from "@repo/services";

const formService = new FormService();
const responseService = new ResponseService();
const themeService = new ThemeService();

// Create a form
const form = await formService.createForm(userId, {
  title: "Chunin Exam Registration",
  description: "Register for the upcoming exam",
  visibility: "public",
  collectEmail: true,
  settings: {},
});

// List public forms
const publicForms = await formService.listPublicForms({
  limit: 12,
  offset: 0,
  search: "exam",
});

// Submit a response
const response = await responseService.submitResponse(formId, {
  respondentEmail: "naruto@konoha.jp",
  answers: [
    { fieldId: "...", value: "Uzumaki Naruto" },
  ],
});
```

---

## Exported Types

```typescript
export type { FormWithFields, FormWithStats } from "./form";
export type { SubmitFormInput, PaginatedResponses, ResponseWithAnswers } from "./response";
export type { FormAnalyticsSummary } from "./analytics";
```

---

## Dependencies

- `@repo/database` — Drizzle ORM client and schema
- `@repo/logger` — Structured logging
