# @repo/typescript-config — Shared TypeScript Configuration

Shared `tsconfig.json` presets for the Konoha Forms monorepo. Ensures consistent TypeScript settings across all apps and packages.

---

## Configurations

| File | Used By | Description |
|------|---------|-------------|
| `base.json` | All packages | Strict mode, ESNext target, common compiler options |
| `nextjs.json` | `apps/web` | Extends base with Next.js-specific settings (JSX, paths, plugins) |
| `node.json` | `apps/server`, packages | Extends base with Node.js-specific module resolution |

---

## Usage

### Next.js app:

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Node.js package:

```json
{
  "extends": "@repo/typescript-config/node.json"
}
```

### Library package:

```json
{
  "extends": "@repo/typescript-config/base.json"
}
```

---

## Key Settings

All configs share these base settings:

- **Strict mode** enabled (`strict: true`)
- **ES2022** target
- **ESNext** module system
- **Bundler** module resolution
- **Declaration files** generated
- **Skip lib check** for faster builds
- **Incremental** compilation enabled
