# Plan: Full-Stack Docker Compose

**Created:** 2026-03-25
**Status:** executed
**Confidence Score:** 9/10
**Estimated Tasks:** 4
**Estimated Files:** 4

## Summary

Add a multi-stage Dockerfile for the Next.js + Payload CMS app and update `docker-compose.yml` so that a single `docker compose up` starts the entire stack: PostgreSQL 17, Valkey 9, and the Node.js application server. Also create `.dockerignore` and update `.env.example` with Docker-aware defaults.

## Approach

Use the official Next.js multi-stage Dockerfile pattern (base → deps → build → runner) optimized for `output: 'standalone'`. The resulting image is ~150-200MB, runs as non-root user, and includes `sharp` for image processing. The app service in docker-compose depends on postgres and valkey healthchecks, ensuring the database is ready before the app starts.

## Tasks

### Task 1: Create .dockerignore
**Files:** `.dockerignore` (create)
**Description:**
Create a `.dockerignore` file at the project root to exclude unnecessary files from the Docker build context. This dramatically speeds up `docker build` and reduces image size.

```
node_modules
.next
.git
.gitignore
.env
.env*.local
media
.vscode
.idea
.claude
tests
*.md
docker-compose.yml
```

Key exclusions:
- `node_modules` — reinstalled inside Docker for correct platform binaries (especially `sharp`)
- `.next` — rebuilt inside Docker
- `media` — mounted as a volume, not baked into the image
- `.claude` / `tests` / `*.md` — development-only files

**Validation:**
- [ ] File exists at project root
- [ ] `node_modules` and `.next` are listed

---

### Task 2: Create multi-stage Dockerfile
**Files:** `Dockerfile` (create)
**Description:**
Create a multi-stage Dockerfile at the project root with 4 stages:

**Stage 1 — `base`:** Node.js 22 Alpine as the base image. Install `libc6-compat` (required by some native modules on Alpine).

**Stage 2 — `deps`:** Install npm dependencies. Copy `package.json` and `package-lock.json`, run `npm ci` for reproducible installs.

**Stage 3 — `builder`:** Copy source code and node_modules from deps stage. Run `npm run build` to produce the standalone output. The build needs `PAYLOAD_SECRET` and `DATABASE_URL` at build time — use build args with dummy values since Payload validates the config at build but doesn't actually connect during `next build` compilation (it only connects during static generation, which will fail gracefully).

**Stage 4 — `runner`:** Production image. Copy only the standalone output (`.next/standalone/`), static files (`.next/static/`), and `public/` directory. Set `NODE_ENV=production`, expose port 3000, run as non-root user `nextjs`.

Important details:
- Use `node:22-alpine` as base image
- The standalone server is at `.next/standalone/server.js`
- Payload CMS stores media in `./media/` — this will be volume-mounted, so create the directory in the runner stage
- Set `HOSTNAME=0.0.0.0` so the server listens on all interfaces inside the container
- Copy `sharp`'s standalone build from the builder — it's needed for image processing

The Dockerfile should look like:
```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Dummy values for build-time config validation
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ARG PAYLOAD_SECRET=build-time-secret-not-used-at-runtime
ENV DATABASE_URL=${DATABASE_URL}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# Copy public assets
COPY --from=builder /app/public ./public
# Copy standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Create media directory for uploads
RUN mkdir -p ./media && chown nextjs:nodejs ./media
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
```

**Validation:**
- [ ] `docker build -t vitrina .` completes successfully
- [ ] Image size is under 300MB (`docker images vitrina`)
- [ ] Runner stage runs as non-root user `nextjs`

---

### Task 3: Update docker-compose.yml
**Files:** `docker-compose.yml` (modify)
**Description:**
Add the `app` service to the existing docker-compose.yml. The app service:

1. **Builds from the Dockerfile** in the current directory
2. **Depends on** `postgres` and `valkey` with `condition: service_healthy` so it waits for them to be ready
3. **Maps port 3000:3000** for the web server
4. **Mounts `./media`** as a volume for persistent media uploads
5. **Sets environment variables** pointing to the internal Docker network hostnames (not `localhost`)
6. **Includes a healthcheck** that curls the Next.js health endpoint

The updated compose file should have:
- `app` service with `build: .`, `ports: ['3000:3000']`
- Environment: `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/vitrina`, `VALKEY_URL=redis://valkey:6379`, `PAYLOAD_SECRET=${PAYLOAD_SECRET}`, `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`
- Volume: `./media:/app/media` for uploaded images
- `depends_on` with healthcheck conditions for both postgres and valkey
- Keep existing postgres and valkey services unchanged (but fix postgres port mapping from `5433:5432` to `5432:5432` inside docker-compose since the app will use internal networking — OR keep `5433:5432` for host access and let the app use `postgres:5432` internally)

Important: Keep the host port mapping for postgres at `5433:5432` so local dev tools can still connect. The app container uses `postgres:5432` via Docker internal DNS.

Also add a `media` volume entry or use a bind mount (`./media:/app/media`) — bind mount is simpler and allows the user to see uploaded files directly on the host.

The final docker-compose.yml should also add environment variable `PAYLOAD_SECRET` using variable substitution `${PAYLOAD_SECRET:-dev-secret-change-in-production}` with a default for development.

**Validation:**
- [ ] `docker compose config` validates without errors
- [ ] `docker compose up --build` starts all 3 services
- [ ] App is accessible at `http://localhost:3000`
- [ ] Postgres is accessible at `localhost:5433` from host
- [ ] Valkey is accessible at `localhost:6379` from host

---

### Task 4: Update .env.example and next.config.ts
**Files:** `.env.example` (modify), `next.config.ts` (modify)
**Description:**

**`.env.example`** — Add comments explaining Docker vs local values, and add `PAYLOAD_SECRET` with a clear placeholder:

```
# Database — use 'postgres' hostname when running in Docker, 'localhost:5433' for local dev
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/vitrina

# Payload CMS secret — CHANGE THIS in production
PAYLOAD_SECRET=your-secure-secret-here

# Public URL — change to your domain in production
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Cache — use 'valkey' hostname when running in Docker, 'localhost' for local dev
VALKEY_URL=redis://localhost:6379
```

**`next.config.ts`** — Update `images.remotePatterns` to also allow the Docker service hostname. When running in Docker, `next/image` needs to accept images from the app's own hostname:

Add a pattern for the `NEXT_PUBLIC_SERVER_URL` hostname, or more practically, allow any hostname since Payload serves media from the same server. The simplest safe approach is to keep `localhost` and add a wildcard comment explaining production configuration.

Actually, since media is served from the same Next.js server, `next/image` can use relative URLs and `localhost` is sufficient for Docker. No change needed to `next.config.ts` unless we want to support external image hosts.

Remove the `next.config.ts` modification from this task — it's not needed.

**Validation:**
- [ ] `.env.example` has clear Docker vs local instructions
- [ ] `docker compose up --build` works with the default env values in docker-compose.yml

## Dependencies

None — no new npm packages required.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `npm run build` fails inside Docker without DB | Build stage uses dummy `DATABASE_URL`; Payload compiles but can't generate static pages. Next.js handles this gracefully with `output: 'standalone'` — pages are generated at runtime on first request instead |
| `sharp` binary platform mismatch | Building inside the same Alpine image ensures correct binaries. The multi-stage approach installs `sharp` for `linux/musl` automatically |
| Media uploads lost on container rebuild | Bind mount `./media:/app/media` persists on host filesystem |
| Large Docker build context | `.dockerignore` excludes `node_modules`, `.next`, `.git` — keeps context under 1MB |

## Out of Scope

- Production deployment (Kubernetes, fly.io, Railway, etc.)
- HTTPS / reverse proxy (nginx, Caddy)
- CI/CD pipeline for building and pushing images
- Docker image registry (pushing to Docker Hub, GHCR, etc.)
- Multi-architecture builds (arm64/amd64)
