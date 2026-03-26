# Stage 1 — Base image
FROM node:24-alpine AS base

# Stage 2 — Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 3 — Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Compile-only mode: builds the app WITHOUT static page generation,
# so no database connection is needed during the Docker build.
# Pages are rendered dynamically at runtime instead.
# See: https://payloadcms.com/docs/production/building-without-a-db-connection
RUN npx next build --experimental-build-mode compile

# Inline NEXT_PUBLIC_* env vars without requiring a DB connection.
RUN npx next build --experimental-build-mode generate-env

# Stage 4 — Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets (may be empty)
COPY --from=builder /app/public ./public

# Set up prerender cache directory with correct permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone server and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create media directory for Payload uploads (bind-mounted at runtime)
RUN mkdir -p ./media && chown nextjs:nodejs ./media

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
