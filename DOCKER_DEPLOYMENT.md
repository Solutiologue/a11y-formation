# DOCKER DEPLOYMENT GUIDE

## 🐳 Docker Setup Guide

### Prérequis
- Docker >= 20.10
- Docker Compose >= 2.0
- Git

---

## 🚀 Déploiement sur VPS Ionos

### 1️⃣ Cloner le projet sur la VPS

```bash
cd /home/your-user
git clone https://github.com/your-repo/a11y-formation.git
cd a11y-formation
```

### 2️⃣ Installer Docker et Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (optional)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

### 3️⃣ Préparer les variables d'environnement

#### Pour le développement:
```bash
cp .env.docker.example .env
# Éditer .env avec vos valeurs
nano .env
```

#### Pour la production:
```bash
cp .env.production.example .env
# Éditer .env avec vos valeurs sécurisées
nano .env

# Générer NEXTAUTH_SECRET
openssl rand -base64 32
```

### 4️⃣ Lancer l'application

#### Mode Développement:
```bash
docker-compose up -d
```

#### Mode Production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 5️⃣ Vérifier l'état

```bash
# Voir tous les containers
docker ps

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### 6️⃣ Migrer la base de données

```bash
# Attendre que db soit prête (5-10 secondes)
docker-compose exec backend npx prisma migrate deploy

# Seed la base (optionnel)
docker-compose exec backend npx prisma db seed
```

---

## 📊 Architecture Docker

```
┌─────────────────────────────────┐
│   Nginx (Frontend + Reverse)    │
│        Port 80/443              │
└──────────────┬──────────────────┘
               │
       ┌───────┴────────┐
       ↓                ↓
┌─────────────┐  ┌──────────────┐
│  Frontend   │  │   Backend    │
│ (Vue.js)    │  │  (Next.js)   │
│ Port 5173   │  │  Port 3000   │
└─────────────┘  └──────┬───────┘
                        │
                        ↓
                ┌──────────────┐
                │    MySQL     │
                │ Port 3306    │
                └──────────────┘
```

---

## 🛠️ Commandes Utiles

### Arrêter les services
```bash
docker-compose down
```

### Arrêter et supprimer les volumes (attention: perte de données!)
```bash
docker-compose down -v
```

### Redémarrer un service
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

### Entrer dans un container
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec db mysql -p$DB_PASSWORD
```

### Voir les logs en temps réel
```bash
docker-compose logs -f --tail=100
```

### Exécuter des commandes dans un container
```bash
# Migrations Prisma
docker-compose exec backend npx prisma migrate deploy

# Prisma Studio
docker-compose exec backend npx prisma studio

# Installation de packages
docker-compose exec backend npm install axios
```

---

## 🔒 Sécurité - Production

### 1. Fichier Secrets
```bash
# Créer un fichier .env sécurisé
nano .env

# ⚠️ NE PAS commiter le fichier .env
# Il est déjà dans .gitignore
```

### 2. Port Database - Local only
```yaml
# Dans docker-compose.prod.yml
ports:
  - "127.0.0.1:3306:3306"  # Accessible uniquement en local
```

### 3. Certificats SSL
```bash
# Générer certificats Let's Encrypt (exemple avec Certbot)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# Placer les certificats
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/
```

### 4. Nginx SSL Configuration
Mettre à jour `packages/frontend/nginx.conf`:
```nginx
listen 443 ssl http2;
ssl_certificate /etc/nginx/certs/fullchain.pem;
ssl_certificate_key /etc/nginx/certs/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

### 5. Redirect HTTP to HTTPS
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📈 Monitoring

### Vérifier l'utilisation des ressources
```bash
# CPU, mémoire, I/O
docker stats

# Détails des volumes
docker volume inspect a11y-formation_mysql_data
```

### Backup base de données
```bash
# Backup
docker-compose exec db mysqldump -uroot -p$DB_ROOT_PASSWORD $DB_NAME > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T db mysql -uroot -p$DB_ROOT_PASSWORD $DB_NAME < backup_20260228.sql
```

---

## 🐛 Troubleshooting

### La base de données ne démarre pas
```bash
# Vérifier les logs
docker-compose logs db

# Supprimer le volume et relancer
docker-compose down -v
docker-compose up -d
```

### Le backend ne peut pas se connecter à la BD
```bash
# Attendre que DB soit prête
docker-compose logs db | grep "ready for connections"

# Vérifier la connection
docker-compose exec backend npx prisma db push
```

### Ports déjà utilisés
```bash
# Changer les ports dans .env
BACKEND_PORT=3001
FRONTEND_PORT=5174
DB_PORT=3307

# Ou libérer les ports existants
sudo lsof -i :3000  # Voir qui utilise le port
sudo kill -9 <PID>
```

### Manque d'espace disque
```bash
# Nettoyer Docker
docker system prune -a --volumes

# Vérifier l'espace disque
df -h
```

---

## 📚 Documentation Complémentaire

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment/docker)
- [Nginx Docker Guide](https://hub.docker.com/_/nginx)
- [MySQL Docker Guide](https://hub.docker.com/_/mysql)

---

## 🎯 Pipeline CI/CD (optionnel)

### Avec GitHub Actions
Créer `.github/workflows/deploy.yml`:
```yaml
name: Deploy to VPS

on:
  push:
    branches: [main, production]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /home/app/a11y-formation
            git pull origin main
            docker-compose -f docker-compose.prod.yml up -d
```

---

**Ready to deploy! 🚀**
