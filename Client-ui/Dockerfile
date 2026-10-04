# syntax=docker/dockerfile:1.7
#
# Production image for the Environment Monitoring System frontend.
# Build context is Client-ui/ :  docker build -t ems/client-ui:latest .

# =============================================================================
# Stage 1 — build the Vite bundle
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Dependency layer: re-runs only when the lockfile changes.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund

COPY . .

# Vite inlines import.meta.env.VITE_* at build time. Direct API URL without nginx proxy.
ARG VITE_API_BASE_URL=http://localhost:8080/api
ARG VITE_APP_TITLE="Environment Monitoring System"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_TITLE=$VITE_APP_TITLE

RUN npm run build

# =============================================================================
# Stage 2 — serve the static bundle
# =============================================================================
FROM node:22-alpine AS runtime

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:8080 || exit 1

CMD ["serve", "-s", "dist", "-l", "8080"]
