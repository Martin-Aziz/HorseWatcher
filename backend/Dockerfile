# syntax=docker/dockerfile:1
FROM golang:1.24-alpine AS base
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

# ── Development target (used with air for hot reload) ─────────────────────────
FROM base AS development
RUN go install github.com/air-verse/air@latest
COPY . .
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]

# ── Build stage ───────────────────────────────────────────────────────────────
FROM base AS builder
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /bin/api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /bin/simulator ./cmd/simulator

# ── Production target ─────────────────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12 AS production
COPY --from=builder /bin/api /app/api
COPY --from=builder /app/internal/db/migrations /app/internal/db/migrations
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/app/api"]

# ── Simulator target ──────────────────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12 AS simulator
COPY --from=builder /bin/simulator /app/simulator
USER nonroot:nonroot
ENTRYPOINT ["/app/simulator"]
