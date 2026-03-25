# AI Instructions

1. **Never add `any` types.** Use `unknown` + type narrowing or explicit interfaces.
2. **Never use `as` casts** without a `// SAFETY:` comment explaining why it's safe.
3. **Named exports for components and lib.** Default exports only where Next.js requires them (pages, layouts, route handlers, `payload.config.ts`).
4. **Use `@/` path alias** for all imports from `src/`. No cross-directory relative imports.
5. **Server components by default.** Only add `"use client"` when the component needs browser APIs, event handlers, or hooks.
6. **Fetch data with `payload.find()`** in server components. Never call the REST API from server-side code.
7. **Auto-generated types are read-only.** Never edit `payload-types.ts`. Run `npm run generate:types` after collection changes.
8. **Spanish for user-facing strings.** Code, comments, and variable names in English.
9. **Run validation before finishing:** `npm run lint && npx tsc --noEmit && npm run build`
10. **When creating new collections,** always register them in `src/payload.config.ts` and regenerate types.
11. **Use `/frontend-design` when building new pages or components** — it produces distinctive, production-grade UI that avoids generic AI aesthetics.
12. **Use Context7 MCP to look up library docs** before using unfamiliar APIs (Payload CMS, Next.js, TailwindCSS, etc.). Query current documentation instead of relying on training data.
