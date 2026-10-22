FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables needed at build time
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG JWT_SECRET
ARG JWT_REFRESH_SECRET

ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client and build
RUN pnpm run build

# Standalone Prisma CLI so the runner can apply migrations on startup
FROM deps AS migrator
WORKDIR /opt/migrate
RUN npm init -y > /dev/null \
    && npm install --omit=dev --no-audit --no-fund \
        prisma@$(node -p "require('/app/node_modules/prisma/package.json').version") \
        dotenv@$(node -p "require('/app/node_modules/dotenv/package.json').version")
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=migrator /opt/migrate /opt/migrate

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Apply pending database migrations, then start the app
CMD ["sh", "-c", "cd /opt/migrate && node_modules/.bin/prisma migrate deploy && cd /app && exec node server.js"]
