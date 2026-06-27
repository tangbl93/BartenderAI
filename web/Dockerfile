# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Copy manifests and install with legacy-peer-deps (React 19 peers)
COPY package*.json .npmrc ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime
# SPA fallback + /api proxy to backend
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
