---
description: "Load project context: reads CLAUDE.md, key source files, and summarizes current project state. Run this at the start of every session."
---

# Prime — Context Loading

You are an expert TypeScript/Next.js/Payload CMS developer loading context for the **Vitrina** project (Spanish-language product showcase, WhatsApp-first, no cart).

## Step 1: Read Core Configuration

Read the following files in full. Do NOT skip or summarize during reading — you need the exact contents internalized.

1. **Project rules:** Read `CLAUDE.md` at the repository root.
2. **Sections:** Read every file in `.claude/sections/` — these contain domain-specific rules and conventions.
3. **Payload config:** Read `src/payload.config.ts` — this defines all collections, plugins, database adapter, and global settings.
4. **Types:** Read `src/payload-types.ts` — auto-generated types from Payload. Note the shape of each collection.
5. **Data helpers:** Read `src/lib/payload-helpers.ts` — shared data-fetching utilities.

## Step 2: Read Key Source Files

Read 2-3 representative files to understand current patterns:

1. Pick one collection from `src/collections/` (prefer `Products.ts` or the most complex one).
2. Pick one storefront page from `src/app/(storefront)/` (prefer a product-related page).
3. If a component directory exists at `src/components/`, read one component file.

## Step 3: Assess Project State

After reading, produce a concise **Project State Summary** covering:

### Architecture
- List all Payload collections and their key fields.
- List all storefront routes (pages under `src/app/(storefront)/`).
- List shared components if any exist.
- Note the database adapter (postgres) and cache layer (Valkey) configuration.

### Current Capabilities
- What features are implemented and working?
- What features are stubbed or incomplete?
- Are there any TODO/FIXME/HACK comments?

### Code Health
- Are types being generated and up to date?
- Any obvious patterns or anti-patterns?
- Is structured logging (pino) set up?
- Are tests present?

### Active Plans
- Check `.claude/plans/` for any existing plans. List them with status if present.
- Check `.claude/execution-reports/` for recent reports.

## Output Format

```
## Vitrina — Project State (primed)

**Collections:** [list]
**Routes:** [list]
**Components:** [list]
**Database:** PostgreSQL 17 via @payloadcms/db-postgres
**Cache:** Valkey 9

### Implemented
- [feature list]

### Incomplete / TODO
- [items found]

### Code Health
- Types: [up to date / stale]
- Tests: [present / missing]
- Logging: [configured / not configured]
- Lint issues: [count or clean]

### Active Plans
- [plan list or "none"]

**Token budget used:** ~[estimate]K tokens
**Ready for:** plan | execute | validate
```

Keep the summary between 5K and 20K tokens. If the project is small, stay near the lower end. If there are many collections and pages, expand accordingly.
