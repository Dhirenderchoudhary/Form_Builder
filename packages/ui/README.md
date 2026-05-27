# @repo/ui — Shared UI Components

A shared React component library used across the Konoha Forms monorepo.

---

## Components

| Component | File | Description |
|-----------|------|-------------|
| **Button** | `button.tsx` | Variant-based button using `class-variance-authority` |
| **Badge** | `badge.tsx` | Status/label badge with variant support |

---

## Usage

```tsx
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";

// Button variants: default, destructive, outline, secondary, ghost, link
<Button variant="default" size="sm">
  Click me
</Button>

// Badge variants
<Badge variant="secondary">Draft</Badge>
```

---

## Utilities

The package relies on shared utilities from the consuming app:

- `cn()` — Class name merger (`clsx` + `tailwind-merge`)
- `@radix-ui/react-slot` — Polymorphic component support via `asChild`

---

## Structure

```
packages/ui/
├── button.tsx     → Button component with CVA variants
├── badge.tsx      → Badge component with CVA variants
└── package.json
```

---

## Adding Components

1. Create a new `.tsx` file in the package root
2. Use `class-variance-authority` for variant patterns
3. Export the component and its types
4. Import in consuming apps: `import { MyComponent } from "@repo/ui/my-component"`
