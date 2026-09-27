
FROM node:20-alpine

WORKDIR /app

# Copy root workspace configuration
COPY package.json package-lock.json ./

# Copy workspace package manifests
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json

# Copy Prisma schema
COPY prisma ./prisma

# Install dependencies for the monorepo
RUN npm ci

# Copy application source code
COPY apps/api ./apps/api

# Copy shared types source
COPY packages/shared-types ./packages/shared-types

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build the API
RUN npm run build --workspace=apps/api

EXPOSE 4000

CMD ["node", "apps/api/dist/main"]