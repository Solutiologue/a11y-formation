#!/bin/sh
set -e
cd /app
echo "Generating Prisma Client..."
npx prisma generate --schema=../prisma/schema.prisma || true
echo "Prisma Client generated. Starting Next.js..."
npm run dev
