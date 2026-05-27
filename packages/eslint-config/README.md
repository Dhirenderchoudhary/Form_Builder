# @repo/eslint-config — Shared ESLint Configuration

Shared ESLint rules for the Konoha Forms monorepo. Provides consistent linting across all apps and packages.

---

## Configurations

This package provides ESLint configurations tailored for different parts of the monorepo:

| Config | Usage |
|--------|-------|
| **Base** | Core rules shared by all packages |
| **Next.js** | Extended rules for the Next.js web app (`eslint-config-next`) |
| **Library** | Rules optimized for shared packages |

---

## Usage

### In an app (`apps/web`):

```js
// eslint.config.js
import config from "@repo/eslint-config";
export default config;
```

### In a package (`packages/*`):

```js
// .eslintrc.cjs
module.exports = {
  extends: ["@repo/eslint-config"],
};
```

---

## Running

```bash
# Lint all packages
pnpm lint

# Lint a specific package
pnpm --filter web lint
pnpm --filter @repo/server lint
```
