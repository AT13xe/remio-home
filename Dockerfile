FROM node:20-alpine AS base
ARG VERSION

RUN corepack enable

FROM base AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /remio-home

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .


FROM base AS builder

WORKDIR /remio-home

COPY --from=deps /remio-home .

RUN pnpm run build


FROM base AS runner

WORKDIR /remio-home

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV CONFIG_DIR=/remio-home/config \
    NODE_ENV=production \
    IS_DOCKER=1 \
    VERSION=${VERSION}

# standalone output
COPY --from=builder --chown=nextjs:nodejs /remio-home/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /remio-home/.next/static ./.next/static
COPY --from=builder /remio-home/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]