
FROM node:20-alpine AS base

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package manifests
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

# Install all workspace dependencies
RUN npm install

# Copy application source code
COPY apps/web ./apps/web
COPY packages/shared-types ./packages/shared-types

# Build the web application
RUN npm run build --workspace=apps/web

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/web"]