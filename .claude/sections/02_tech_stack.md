# Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 22+, TypeScript 5.7+ (strict) |
| **Framework** | Next.js 16 (App Router, RSC) |
| **CMS** | Payload CMS (latest, headless) |
| **Database** | PostgreSQL 17 via `@payloadcms/db-postgres` |
| **Cache** | Valkey 9 (Redis-compatible, port 6379) |
| **UI** | TailwindCSS 4.0+, shadcn/ui (New York), Lucide React |
| **Package Manager** | npm |
| **Linter** | ESLint 9 + eslint-config-next |
| **Type Checker** | TypeScript strict mode |
| **Rich Text** | Lexical (`@payloadcms/richtext-lexical`) |
| **Image Processing** | sharp |
| **Testing** | Vitest + React Testing Library (recommended) |
| **Logging** | pino (recommended) |
| **Containers** | Docker Compose (PostgreSQL 17 + Valkey 9) |
