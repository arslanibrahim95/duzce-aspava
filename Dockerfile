# ---- Build the React frontend ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime: Node server + SQLite, serves API + built frontend ----
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
# build tools for better-sqlite3 native build (if no prebuild matches)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY server ./server
COPY public/images/menu ./public/images/menu
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/index.js"]
