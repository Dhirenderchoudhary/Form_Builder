# @repo/logger — Logging Utility

A structured logging utility for the Konoha Forms monorepo. Provides consistent, level-based logging across all packages and apps.

---

## Usage

```typescript
import { logger } from "@repo/logger";

logger.debug("Processing form submission", { formId: "abc-123" });
logger.info("Form published successfully", { formId: "abc-123", slug: "chunin-exam" });
logger.warn("Rate limit approaching", { ip: "192.168.1.1", count: 95 });
logger.error("Failed to send email", { error: err.message, to: "ninja@konoha.jp" });
```

---

## Log Levels

| Level | When to Use |
|-------|-------------|
| `debug` | Detailed diagnostic info (disabled in production) |
| `info` | General operational events |
| `warn` | Unexpected but recoverable situations |
| `error` | Failures that need attention |

---

## Configuration

Set the log level via the `LOGGER_LEVEL` environment variable:

```bash
LOGGER_LEVEL=debug   # Show all logs
LOGGER_LEVEL=info    # Show info, warn, error
LOGGER_LEVEL=warn    # Show warn, error only
LOGGER_LEVEL=error   # Show errors only
```

---

## Structure

```
packages/logger/
├── src/
│   └── index.ts     → Logger implementation
├── package.json
└── tsconfig.json
```
