# 1) Build the Vite/React app
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2) Serve it with nginx (unprivileged) on 8080
FROM nginxinc/nginx-unprivileged:stable-alpine

# Clean default nginx html
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
