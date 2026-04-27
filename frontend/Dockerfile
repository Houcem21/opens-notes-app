# 1) Build the Vite/React app
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2) Serve with nginx (unprivileged) on 8080
FROM nginxinc/nginx-unprivileged:stable-alpine

# Overwrite nginx html with the build output (no rm needed)
COPY --from=build --chown=101:101 /app/dist/ /usr/share/nginx/html/

EXPOSE 8080
