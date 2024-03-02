ARG NODE_VERSION=21.6.2

# Dependencies step
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm clean-install

# Build step
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ARG GRAPHQL_API_URL
RUN env GRAPHQL_API_URL=$GRAPHQL_API_URL npm run build

# Application runner
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs

ENV PORT=4500
EXPOSE $PORT

CMD ["npm", "run", "start"]

LABEL maintainer="Minty Fresh"
