# 🐳 Docker - Quick Start Guide

## Pour Développement Rapide

```bash
# 1. Copier l'env
cp .env.docker.example .env

# 2. Démarrer les services
docker-compose up -d

# 3. Attendre que la DB soit prête (~10 sec)

# 4. Migrer la base
docker-compose exec backend npx prisma migrate deploy

# 5. Ouvrir l'app
# Frontend: http://localhost:5175
# Backend: http://localhost:3005
# Prisma Studio: http://localhost:5555
```

## Pour Production (VPS Ionos)

```bash
# 1. SSH dans votre VPS
ssh user@your-vps-ip

# 2. Cloner le repo
git clone https://github.com/your-repo/a11y-formation.git
cd a11y-formation

# 3. Créer .env sécurisé
cp .env.production.example .env
nano .env  # Éditer avec vos secrets!

# 4. Lancer le déploiement
chmod +x deploy.sh
./deploy.sh

# OU en une ligne
docker-compose -f docker-compose.prod.yml up -d
```

## Commandes Essentielles

```bash
# Voir les logs
docker-compose logs -f backend

# Entrer dans un container
docker-compose exec backend sh

# Arrêter les services
docker-compose down

# Backup DB
docker-compose exec -T db mysqldump -uroot -p$DB_ROOT_PASSWORD $DB_NAME > backup.sql

# Voir les containers
docker ps
```

## Aide

Voir [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) pour la documentation complète.
