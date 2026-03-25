# Dev Commands

## Application

```bash
npm run dev                          # Next.js dev server (port 3000)
npm run build                        # Production build
npm run start                        # Start production server
npm run lint                         # ESLint check
npx tsc --noEmit                     # Type check (no output)
npm run generate:types               # Regenerate payload-types.ts
```

## Docker

```bash
docker compose up -d                 # Start PostgreSQL + Valkey
docker compose down                  # Stop services
docker compose down -v               # Stop + remove volumes
```

## Validation (run before commit)

```bash
npm run lint && npx tsc --noEmit && npm run build
```

## Database

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d vitrina

# Payload handles migrations automatically on startup
# To reset: drop the database and restart
```

## Testing (after Vitest is set up)

```bash
npx vitest                           # Watch mode
npx vitest run                       # Single run
npx vitest run --coverage            # With coverage
```
