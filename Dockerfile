FROM node:22-alpine AS base

WORKDIR /app
RUN npm install -g corepack && corepack enable

# Development stage
FROM base AS dev
ENV NODE_ENV=development
# Copy package files
COPY package.json package-lock.json ./
# Install ALL dependencies (including devDependencies)
RUN npm install
# Copy rest of the app
COPY . .
# Expose Nuxt default port
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage for production
FROM dev AS build
RUN npm run build

# Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
