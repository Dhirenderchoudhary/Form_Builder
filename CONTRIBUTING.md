# Contributing to Konoha Forms

Thank you for your interest in contributing! This guide will help you get started.

---

## 📋 Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 10
- **PostgreSQL** 15+ (or Docker)
- **Git**

---

## 🏁 Getting Started

1. **Fork and clone** the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment:
   ```bash
   cp .env.example .env
   bash setup.sh
   ```
4. Start the database:
   ```bash
   docker compose up -d
   ```
5. Run migrations and seed:
   ```bash
   pnpm --filter @repo/database db:push
   pnpm --filter @repo/database db:seed
   ```
6. Start dev servers:
   ```bash
   pnpm dev
   ```

---

## 📂 Project Structure

```
form-builder/
├── apps/
│   ├── web/            → Next.js frontend
│   └── server/         → Express API server
├── packages/
│   ├── database/       → Drizzle schema & migrations
│   ├── services/       → Business logic
│   ├── trpc/           → tRPC routers & client
│   ├── ui/             → Shared UI components
│   ├── logger/         → Logging utility
│   ├── eslint-config/  → ESLint config
│   └── typescript-config/ → TS configs
```

---

## 🌿 Branch Conventions

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch for features |
| `feature/<name>` | New feature work |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation changes |
| `refactor/<name>` | Code refactoring |

---

## 💻 Development Workflow

### Making Changes

1. Create a feature branch from `develop`:
   ```bash
   git checkout -b feature/my-feature develop
   ```

2. Make your changes, following the code style guidelines below.

3. Verify your changes:
   ```bash
   # Type check
   pnpm check-types

   # Lint
   pnpm lint

   # Build
   pnpm build
   ```

4. Commit your changes (see commit conventions below).

5. Push and open a Pull Request against `develop`.

### Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Code style (formatting, no logic change)
- `refactor` — Code refactoring
- `perf` — Performance improvement
- `test` — Adding or updating tests
- `chore` — Build/tooling changes

**Scopes:** `web`, `server`, `database`, `services`, `trpc`, `ui`, `logger`, `config`

**Examples:**
```
feat(web): add password protection to form builder
fix(database): remove duplicate field type enum values
docs(root): add CONTRIBUTING.md
```

---

## 🎨 Code Style

### TypeScript
- Use strict mode (`"strict": true`)
- Prefer `interface` over `type` for object shapes
- Use explicit return types on exported functions
- Avoid `any` — use `unknown` with type guards when needed

### React / Next.js
- Use `"use client"` only when necessary (hooks, event handlers, browser APIs)
- Prefer server components by default
- Use the `@/` path alias for imports within the web app
- Colocate components with their routes using `_components` directories

### CSS / Tailwind
- Use the Konoha theme tokens (e.g., `konoha-orange`, `konoha-forest`, `konoha-ink`)
- Use the `.scroll-card`, `.btn-rasengan`, `.chakra-divider` utility classes
- Keep responsive styles mobile-first

### Naming
- Files: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Database tables: `snake_case`

---

## 🧪 Testing

> Testing infrastructure is being set up. When available:

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter web test
pnpm --filter @repo/server test
```

---

## 📝 Pull Request Process

1. **Fill out the PR template** completely
2. **Link related issues** using `Closes #123`
3. **Ensure CI passes** — type checks, lint, build
4. **Request review** from at least one maintainer
5. **Squash merge** into `develop`

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] No `console.log` left in production code
- [ ] Types are correct (no `any` without justification)
- [ ] Build passes (`pnpm build`)
- [ ] Documentation updated if needed

---

## 🐛 Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if UI-related)
- Environment details (OS, browser, Node version)

---

## 💡 Feature Requests

Open an issue with:
- Problem description
- Proposed solution
- Alternatives considered
- Additional context

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
