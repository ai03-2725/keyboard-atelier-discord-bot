# Based on https://pnpm.io/docker and https://depot.dev/docs/container-builds/how-to-guides/optimal-dockerfiles/node-pnpm-dockerfile
FROM node:22-alpine AS base

FROM base AS builder-base
RUN corepack enable
WORKDIR /app
COPY . .

# Install packages via pnpm
FROM builder-base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build app
FROM builder-base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

# Combine and run
FROM base AS run
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/assets /app/assets
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]