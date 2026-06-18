FROM node:20-alpine

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install all dependencies including dev (needed for build)
RUN npm ci

# Copy all source files
COPY . .

# Build frontend with vite AND compile server with esbuild
RUN npm run build

EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "dist/server.cjs"]
