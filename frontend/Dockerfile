FROM node:20-alpine AS builder

WORKDIR /build

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY tailwind.config.ts* ./
COPY public ./public
COPY src ./src

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /build/.next ./.next
COPY --from=builder /build/public ./public
COPY --from=builder /build/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "run", "start"]
