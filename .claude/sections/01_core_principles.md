# Core Principles

1. **Type safety is non-negotiable** — `strict: true` in tsconfig. No `any`. No `as` without a `// SAFETY:` comment justifying it.
2. **KISS** — Simple, readable code over clever abstractions.
3. **YAGNI** — Don't build it until it's needed.
4. **Three-Feature Rule** — Abstract only after three concrete instances of duplication.
5. **Verbose naming** — `productCategorySlug` over `slug`, `isWhatsAppEnabled` over `flag`.
6. **JSDoc on public functions** — Every exported function gets a JSDoc block.
7. **Structured logging** — Use pino with key-value pairs, never string interpolation.
8. **Security baseline** — Never log secrets. Validate all user input. Sanitize query params.
9. **Files under 300 lines** — Split when exceeded.
