# Logging (pino)

## Setup

```tsx
// src/lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: process.env.NODE_ENV === "development"
    ? { target: "pino-pretty" }
    : undefined,
});

export function getLogger(module: string) {
  return logger.child({ module });
}
```

## Usage

```tsx
import { getLogger } from "@/lib/logger";
const log = getLogger("products");

// Good — structured key-value pairs
log.info({ productId, categorySlug }, "product_fetched");

// Bad — string interpolation
log.info(`Fetched product ${productId}`);
```

## Levels

- `debug` — diagnostics, query details
- `info` — operations (fetched, created, updated)
- `warn` — recoverable issues (missing optional data, fallback used)
- `error` — failures (DB errors, external service failures)

## Rules

- Event names: descriptive `snake_case` — `product_fetched`, `category_not_found`
- Always include IDs and context: `{ productId, slug, durationMs }`
- NEVER log: passwords, `PAYLOAD_SECRET`, `DATABASE_URL`, API keys
- NEVER log inside loops — log batch summaries
