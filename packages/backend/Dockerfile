# Backend Dockerfile - Next.js/Node.js
FROM node:20-alpine

# Installer OpenSSL et bash pour le script
RUN apk add --no-cache openssl bash

WORKDIR /app

# Copier le package.json et package-lock du backend
COPY packages/backend/package*.json ./

# Installer les dépendances
RUN npm install --legacy-peer-deps

# Copier le code source
COPY packages/backend .
COPY packages/database/prisma ./prisma

# Générer Prisma Client au build
RUN npx prisma generate --schema=./prisma/schema.prisma || true

# Configurer le port globalement
ENV PORT=3005

# Exposer le port 3005
EXPOSE 3005

# Commande de démarrage - assurer Prisma avec force
CMD sh -c "echo 'Starting Next.js...' && npm run dev"
