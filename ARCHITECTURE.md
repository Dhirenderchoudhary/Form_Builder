# Architecture — Konoha Forms

This document describes the high-level architecture of the Konoha Forms form builder.

---

## System Overview

```mermaid
graph TB
    subgraph Client["Browser"]
        WEB["Next.js 16 App<br/>(React 19 + TailwindCSS)"]
    end

    subgraph Server["Backend"]
        API["Express 5 Server<br/>(tRPC + OpenAPI)"]
    end

    subgraph Auth["Authentication"]
        CLERK["Clerk<br/>(SSO, Webhooks)"]
    end

    subgraph Data["Data Layer"]
        DB["PostgreSQL 15<br/>(Drizzle ORM)"]
    end

    subgraph Email["Notifications"]
        RESEND["Resend<br/>(Transactional Email)"]
    end

    WEB -->|"tRPC over HTTP<br/>/api/backend"| API
    WEB -->|"Session Token"| CLERK
    API -->|"Verify Token"| CLERK
    API -->|"Drizzle Queries"| DB
    API -->|"Send Email"| RESEND
    CLERK -->|"Webhooks<br/>(user.created)"| API
```

---

## Monorepo Structure

```mermaid
graph LR
    subgraph Apps
        WEB["apps/web"]
        SRV["apps/server"]
    end

    subgraph Packages
        DB["packages/database"]
        SVC["packages/services"]
        TRPC["packages/trpc"]
        UI["packages/ui"]
        LOG["packages/logger"]
        ESL["packages/eslint-config"]
        TSC["packages/typescript-config"]
    end

    WEB --> TRPC
    WEB --> UI
    SRV --> TRPC
    SRV --> SVC
    SRV --> LOG
    TRPC --> SVC
    SVC --> DB
    SVC --> LOG
    WEB --> ESL
    WEB --> TSC
    SRV --> ESL
    SRV --> TSC
```

---

## Layer Responsibilities

### Apps

| App | Responsibility |
|-----|----------------|
| **web** | Next.js frontend — dashboard UI, form builder, public form renderer, API proxy route (`/api/backend`) |
| **server** | Express API — tRPC handler, Clerk webhook receiver, OpenAPI docs, rate limiting |

### Packages

| Package | Responsibility |
|---------|----------------|
| **database** | Drizzle ORM schema definitions, PostgreSQL migrations, seed scripts |
| **services** | Business logic layer — `FormService`, `ResponseService`, `AnalyticsService`, `ThemeService`, `UserService`, `EmailService` |
| **trpc** | tRPC router definitions (server) + React Query client (client). Shared type contract between apps |
| **ui** | Reusable React components — Button, Badge, etc. |
| **logger** | Structured logging utility with configurable levels |
| **eslint-config** | Shared ESLint rules for the monorepo |
| **typescript-config** | Shared `tsconfig.json` presets |

---

## Data Flow

### Form Creation

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant A as API Server
    participant D as Database

    U->>W: Click "Forge scroll"
    W->>W: Open CreateFormDialog
    U->>W: Enter title + description
    W->>A: trpc.forms.create.mutate()
    A->>A: Validate with Zod schema
    A->>A: Generate unique slug
    A->>D: INSERT INTO forms
    D-->>A: New form record
    A-->>W: { id, title, slug }
    W->>W: Invalidate forms.list cache
    W->>W: Navigate to /dashboard/forms/[id]
```

### Form Submission (Public)

```mermaid
sequenceDiagram
    participant R as Respondent
    participant W as Web App
    participant A as API Server
    participant D as Database
    participant E as Resend

    R->>W: Visit /f/[slug]
    W->>A: trpc.public.getFormBySlug()
    A->>D: SELECT form + fields
    D-->>A: Form with fields
    A-->>W: Form data + theme
    W->>W: Render themed form
    R->>W: Fill out and submit
    W->>A: trpc.public.submitResponse()
    A->>A: Validate answers
    A->>D: INSERT response + answers
    A-->>W: Success
    A->>E: Send notification email
    W->>W: Show success message
```

---

## Database Schema

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar clerk_id UK
        varchar email
        varchar full_name
        timestamp created_at
    }

    FORMS {
        uuid id PK
        uuid user_id FK
        varchar title
        text description
        varchar slug UK
        enum status
        enum visibility
        uuid theme_id FK
        jsonb settings
        timestamp published_at
        timestamp created_at
    }

    FORM_FIELDS {
        uuid id PK
        uuid form_id FK
        enum type
        varchar label
        integer order
        boolean required
        jsonb validations
        jsonb options
    }

    RESPONSES {
        uuid id PK
        uuid form_id FK
        varchar respondent_email
        timestamp submitted_at
    }

    ANSWERS {
        uuid id PK
        uuid response_id FK
        uuid field_id FK
        text value
    }

    THEMES {
        uuid id PK
        varchar name
        varchar slug UK
        jsonb colors
        jsonb fonts
        boolean is_default
    }

    ANALYTICS {
        uuid id PK
        uuid form_id FK
        integer total_views
        integer total_starts
        integer total_completions
    }

    USERS ||--o{ FORMS : creates
    FORMS ||--o{ FORM_FIELDS : contains
    FORMS ||--o{ RESPONSES : receives
    RESPONSES ||--o{ ANSWERS : includes
    THEMES ||--o{ FORMS : styles
    FORMS ||--o| ANALYTICS : tracks
```

---

## Authentication Flow

1. **Frontend** — Clerk's `<ClerkProvider>` wraps the app, providing session management
2. **API Proxy** — The web app proxies tRPC calls through `/api/backend/[...path]` to the Express server
3. **Token Forwarding** — The tRPC client attaches the Clerk session token via `Authorization: Bearer <token>` header
4. **Server Verification** — The Express server verifies the token with Clerk's SDK and extracts `userId`
5. **Protected Procedures** — tRPC `protectedProcedure` middleware ensures `ctx.auth.userId` exists

---

## Key Design Decisions

### Why tRPC?
End-to-end type safety between frontend and backend without code generation. The router definitions in `packages/trpc` are shared by both apps.

### Why Drizzle ORM?
Type-safe SQL queries with a thin abstraction layer. Schema-as-code enables easy migration management.

### Why Turborepo?
Efficient monorepo build orchestration with caching. Shared packages avoid code duplication while maintaining clear boundaries.

### Why Clerk?
Production-ready auth with SSO, MFA, webhooks, and a managed user profile UI — lets us focus on the form builder instead of auth infrastructure.

### Why a separate Express server?
Decouples the API from Next.js — enables independent scaling, OpenAPI documentation generation, and webhook handling without Next.js API route limitations.
