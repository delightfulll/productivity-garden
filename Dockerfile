# syntax=docker/dockerfile:1
# Static Vite app behind nginx (Cloud Run listens on $PORT; we use 8080).
FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html vite.config.js tailwind.config.js tsconfig.json eslint.config.js ./
COPY public ./public
COPY src ./src

ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx-frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
