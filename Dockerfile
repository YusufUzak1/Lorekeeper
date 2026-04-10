# ============================================================
# Lorekeeper — Multi-stage Docker Build
# Geliştirme ve production ortamları için
# ============================================================

# ── Stage 1: Base (Bağımlılıkları yükle) ──
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Development (Canlı geliştirme sunucusu) ──
FROM base AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Stage 3: Build (Production derleme) ──
FROM base AS build
COPY . .
RUN npm run build

# ── Stage 4: Production (Nginx ile statik dosya sunma) ──
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
