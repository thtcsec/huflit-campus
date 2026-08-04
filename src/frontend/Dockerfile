# HUFLIT Campus frontend — Vite build + nginx
# Build from repo root:
#   docker build -f src/frontend/Dockerfile -t huflit-campus-frontend .

FROM node:22-alpine AS build
WORKDIR /app

COPY src/frontend/package.json src/frontend/package-lock.json ./
RUN npm ci

COPY src/frontend/ ./

# SPA calls relative /api and /hubs; nginx proxies to the api service in compose.
RUN npm run build

FROM nginx:1.27-alpine AS final
COPY src/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
