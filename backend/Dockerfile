FROM node:20-alpine AS builder

WORKDIR /build

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

# ---

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /build/package.json /build/package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma
COPY --from=builder /build/src/generated ./src/generated

EXPOSE 3000

CMD ["node", "dist/main.js"]
