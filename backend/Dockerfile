FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY api.ts ./
COPY db ./db
COPY routes ./routes
COPY middleware ./middleware

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/api.js"]
