#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx tsx prisma/seed.ts

echo "Starting backend..."
exec node dist/main.js
