# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (cached layer)
COPY package.json package-lock.json* ./
RUN npm install

# Build the app
COPY . .
# Real backend in container deployments (mock disabled). Override at build time:
#   docker build --build-arg VITE_API_BASE_URL=/api/v1 --build-arg VITE_USE_MOCK=false .
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_USE_MOCK=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_MOCK=$VITE_USE_MOCK
RUN npm run build

# ---- serve stage ----
FROM nginx:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
