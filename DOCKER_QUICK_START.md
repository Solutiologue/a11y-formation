# 🐳 DOCKER SETUP COMPLET - A11y Formation sur Ionos VPS

## ✅ Ce qui a été créé

### 6 Fichiers Docker
```
✅ docker-compose.yml          # Développement (hot reload)
✅ docker-compose.prod.yml     # Production (optimisé)
✅ packages/backend/Dockerfile
✅ packages/backend/Dockerfile.prod
✅ packages/frontend/Dockerfile
✅ packages/frontend/Dockerfile.prod
```

### 4 Scripts de Gestion
```
✅ deploy.sh                   # Déploiement automatique
✅ deploy-prod.sh              # Production avec backup
✅ docker-manage.sh            # Utilitaires de gestion
✅ setup.sh                    # Setup initial
```

### 3 Documentations
```
✅ DOCKER.md                   # Quick start (3 minutes)
✅ DOCKER_DEPLOYMENT.md        # Guide complet (détaillé)
✅ DOCKER_SUMMARY.md           # Aperçu technique
```

### Configuration
```
✅ packages/frontend/nginx.conf
✅ .env.docker.example
✅ .env.production.example
✅ .dockerignore (frontend & backend)
```

---

## 🎯 DÉMARRAGE - 3 OPTIONS

### OPTION 1️⃣ - Développement Local (Rapide)

**⏱️ 5 minutes**

```bash
# 1. Copier l'env
cp .env.docker.example .env

# 2. Démarrer
docker-compose up -d

# ⏳ Attendre 10 secondes

# 3. Migrer la base
docker-compose exec backend npx prisma migrate deploy

# ✅ Fait!
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### OPTION 2️⃣ - Production sur VPS (Automatique)

**⏱️ 15 minutes**

```bash
# 1. SSH dans la VPS
ssh user@your-vps-ip

# 2. Cloner le projet
git clone https://votre-repo.git
cd a11y-formation

# 3. Lancer le script
./deploy.sh

# ✅ Le script fait tout!
# - Vérifie Docker
# - Crée .env sécurisé
# - Démarre les containers
# - Migre la base
```

### OPTION 3️⃣ - Production VPS (Manuel)

**⏱️ 20 minutes** (+ contrôle)

```bash
# 1. SSH et cloner
ssh user@your-vps-ip
git clone https://votre-repo.git
cd a11y-formation

# 2. Créer .env
cp .env.production.example .env

# 3. Éditer les secrets
nano .env
# ⚠️ Changer TOUS les passwords!

# 4. Démarrer production
docker-compose -f docker-compose.prod.yml up -d

# 5. Vérifier la DB
docker-compose -f docker-compose.prod.yml logs db

# 6. Migrer
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# ✅ Prêt!
```

---

## 🔐 SÉCURITÉ - avant production!

### Générer les secrets
```bash
# Générer NEXTAUTH_SECRET
openssl rand -base64 32
# Résultat: Copier dans .env

# Générer passwords
openssl rand -base64 16
# Répéter pour chaque password
```

### Éditer .env.production
```bash
nano .env

# Voir les valeurs à changer:
DB_ROOT_PASSWORD=change-me-strong-password
DB_PASSWORD=change-me-strong-password
NEXTAUTH_SECRET=change-me-strong-secret
```

### SSL/HTTPS (optionnel mais recommandé)
```bash
# Installer Certbot
sudo apt install certbot

# Générer certificats
sudo certbot certonly --standalone -d your-domain.com

# Placer dans le projet
mkdir -p certs
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem certs/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem certs/
```

---

## 📊 Architecture Docker

```
DÉVELOPPEMENT (docker-compose.yml):
┌─────────────────────────────────┐
│  Frontend (Vite)                │
│  Port 5173 - Hot reload ✓       │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  Backend (Next.js)              │
│  Port 3000 - Hot reload ✓       │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  MySQL + Prisma Studio          │
│  Port 3306 (DB)                 │
│  Port 5555 (Studio)             │
└─────────────────────────────────┘


PRODUCTION (docker-compose.prod.yml):
┌─────────────────────────────────┐
│  Nginx (Reverse Proxy)          │
│  Port 80/443 - SSL Ready ✓      │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  Backend (Next.js) - Build prod │
│  Port 3000 (internal)           │
│  Multi-stage build ✓            │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│  MySQL (Port 127.0.0.1 only)    │
│  Données: Docker volume         │
│  Sécurisé ✓                     │
└─────────────────────────────────┘
```

---

## 💻 Commandes Essentielles

### Voir l'état
```bash
docker-compose ps
docker-compose logs -f
```

### Accéder aux containers
```bash
# Shell backend
docker-compose exec backend sh

# MySQL CLI
docker-compose exec db mysql -u app_user -p a11y_formation

# Prisma Studio
docker-compose exec backend npx prisma studio
```

### Gérer les services
```bash
# Arrêter
docker-compose stop

# Redémarrer
docker-compose restart backend

# Arrêter et supprimer
docker-compose down

# Voir les logs d'un service
docker-compose logs -f frontend
```

### Base de données
```bash
# Backup
docker-compose exec -T db mysqldump -uroot -p$DB_ROOT_PASSWORD $DB_NAME > backup.sql

# Restore
docker-compose exec -T db mysql -uroot -p$DB_ROOT_PASSWORD $DB_NAME < backup.sql

# Migrations
docker-compose exec backend npx prisma migrate deploy
```

### Script Helper
```bash
chmod +x docker-manage.sh

./docker-manage.sh logs          # Voir les logs
./docker-manage.sh shell backend # Entrer dans backend
./docker-manage.sh backup        # Backup DB
./docker-manage.sh restart       # Redémarrer
./docker-manage.sh status        # Voir les services
```

---

## 🐛 Troubleshooting

### "Port xxx is already in use"
```bash
# Solution 1: Changer le port dans .env
BACKEND_PORT=3001
FRONTEND_PORT=5174

# Solution 2: Libérer le port
sudo lsof -i :3000
sudo kill -9 <PID>
```

### "Can't connect to MySQL"
```bash
# Vérifier les logs
docker-compose logs db

# Attendre la startup
docker-compose logs db | grep "ready for connections"

# Reset la base
docker-compose down -v
docker-compose up -d
```

### "Database migration failed"
```bash
# Vérifier les logs complets
docker-compose logs backend

# Vérifier CONNECTION
docker-compose exec -T backend npx prisma db push

# Ou reset
docker-compose exec backend npx prisma migrate reset
```

### "Out of memory/disk"
```bash
# Nettoyer Docker
docker system prune -a --volumes

# Vérifier l'espace
df -h

# Vérifier les volumes
docker volume ls
```

---

## ✨ What's Included

### Development Features
- ✅ Hot reload frontend (Vite)
- ✅ Hot reload backend (Next.js)
- ✅ Live database editing (Prisma Studio)
- ✅ Easy shell access
- ✅ Full debugging capabilities

### Production Features
- ✅ Multi-stage Docker builds (small images)
- ✅ Nginx reverse proxy + SPA routing
- ✅ SSL/TLS ready
- ✅ Health checks on all services
- ✅ Automatic restarts
- ✅ Database backup tools
- ✅ Security headers

### Management Tools
- ✅ Interactive deploy script
- ✅ Automatic database backups
- ✅ Easy migration commands
- ✅ Resource monitoring
- ✅ Log aggregation

---

## 📈 Performance Considerations

### Frontend Optimization
- Nginx gzip compression enabled
- Static assets cached (1 year)
- SPA routing configured
- Vue.js build optimized

### Backend Optimization
- Production build (Next.js)
- Multi-stage Docker build
- Database connection pooling (Prisma)
- API response caching ready

### Database Optimization
- InnoDB engine
- UTF-8 character set
- Query logging available
- Backup automation ready

---

## 🔄 Continuous Deployment (Bonus)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_KEY }}
          script: |
            cd a11y-formation
            git pull
            ./deploy-prod.sh
```

---

## 📚 Resources

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Next.js Docker](https://nextjs.org/docs/deployment/docker)
- [Nginx Config](https://nginx.org/en/docs/)
- [Ionos VPS](https://www.ionos.com/cloud/vps)

---

## 🚀 NEXT STEPS

### Immédiatement
1. Tester localement: `docker-compose up -d`
2. Vérifier les endpoints: `curl http://localhost:3000/api/users`
3. Voir l'UI: http://localhost:5173

### Pour Production
1. Cloner sur VPS
2. Éditer `.env.production.example`
3. Lancer: `./deploy.sh`
4. Configurer domaine/DNS
5. Setup SSL (Let's Encrypt)

### Maintenance
1. Backups: `./docker-manage.sh backup`
2. Logs: `docker-compose logs -f`
3. Updates: `git pull && ./deploy-prod.sh`

---

## ✅ Checklist Déploiement

- [ ] Docker installé sur VPS
- [ ] Projet cloné sur VPS
- [ ] .env créé et configuré
- [ ] Secrets sécurisés changés
- [ ] `./deploy.sh` lancé avec succès
- [ ] Frontend accessible
- [ ] Backend répond sur /api/users
- [ ] Database connectée
- [ ] Backup configuré
- [ ] SSL/TLS activé (si domaine)

---

## 💬 Support

Pour plus d'aide:
1. Vérifier [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
2. Voir les logs: `docker-compose logs -f`
3. Entrer dans container: `docker-compose exec backend sh`

---

**Vous êtes maintenant prêt pour la production! 🚀**

Pour démarrer:
```bash
docker-compose up -d
```

Ou en production:
```bash
./deploy.sh
```

**Bon déploiement! 🎉**
