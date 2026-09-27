# Base Node.js image with pnpm
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate
WORKDIR /app

# Dependencies installation stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/dealer/package.json ./apps/dealer/
COPY apps/portal/package.json ./apps/portal/
COPY packages/api/package.json ./packages/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/design-tokens/package.json ./packages/design-tokens/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY packages/validation/package.json ./packages/validation/

RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .

ENV NODE_ENV=production
RUN pnpm build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pm2
RUN corepack enable && corepack prepare pnpm@11.10.0 --activate

ENV NODE_ENV=production

COPY --from=builder /app ./

# Expose ports: 3000 (web), 3001 (dealer), 3002 (portal)
EXPOSE 3000 3001 3002

CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
