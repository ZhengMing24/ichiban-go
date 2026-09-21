# ---- Stage 1: build the React frontend ----
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig*.json ./
COPY public ./public
COPY src ./src
RUN npm run build

# ---- Stage 2: build the Go backend ----
FROM golang:1.27-alpine AS backend-build
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server .

# ---- Stage 3: minimal runtime image ----
FROM alpine:3.20
WORKDIR /app
RUN adduser -D -H appuser
COPY --from=backend-build /app/server ./server
COPY --from=frontend-build /app/dist ./web

ENV PORT=8080 \
    WEB_DIR=/app/web

USER appuser

EXPOSE 8080
CMD ["./server"]
