# Frontend Dockerfile - Development
FROM node:18-alpine

WORKDIR /app

# Copier le root package.json
COPY package.json ./

# Copier les fichiers package du frontend
COPY packages/frontend/package.json ./packages/frontend/

# Installer les dépendances
WORKDIR /app/packages/frontend
RUN npm install --legacy-peer-deps

# Copier le code source
COPY packages/frontend ./

# Exposer le port
EXPOSE 5175

# Dev server
CMD ["npm", "run", "dev"]
