# GETTING_STARTED.md

# 🚀 Guide de Démarrage Rapide

## Prérequis

- Node.js >= 18
- npm >= 9
- MySQL >= 8.0

## Installation Rapide (5 minutes)

### 1️⃣ Installez les dépendances

```bash
npm install
```

### 2️⃣ Configurez la base de données

#### Créez la base MySQL
```bash
mysql -u root -p
```

Dans le shell MySQL:
```sql
CREATE DATABASE a11y_formation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Mettez à jour les variables d'environnement

```bash
# packages/database/.env.local
DATABASE_URL="mysql://root:password@localhost:3306/a11y_formation"
```

```bash
# packages/backend/.env.local
DATABASE_URL="mysql://root:password@localhost:3306/a11y_formation"
```

### 3️⃣ Créez les migrations

```bash
npm run db:migrate --workspace=packages/database
```

### 4️⃣ Seedez la base (optionnel)

```bash
npm run db:seed --workspace=packages/database
```

### 5️⃣ Lancez le développement

```bash
npm run dev
```

## 🎉 C'est tout!

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555

## Structure Standard

```
packages/
├── frontend/           # Vue.js 3 + Vite (Atomic Design)
├── backend/            # Next.js API (Modulaire)
└── database/           # Schema Prisma + Migrations
```

## Scripts Principaux

```bash
# Développement
npm run dev                                  # Front + Back

# Frontend
npm run dev --workspace=packages/frontend    # Frontend seul
npm run build --workspace=packages/frontend  # Build frontend

# Backend
npm run dev --workspace=packages/backend     # Backend seul
npm run build --workspace=packages/backend   # Build backend

# Database
npm run db:migrate --workspace=packages/database
npm run db:studio --workspace=packages/database
npm run db:seed --workspace=packages/database
```

## 📁 Architecture Frontend (Atomic Design)

```
src/
├── components/
│   ├── atoms/          # 🧬 Basiques (Button, Input)
│   ├── molecules/      # 🔗 Composés (InputGroup, Card)
│   └── organisms/      # 🦠 Complexes (Forms, Lists)
├── pages/              # 📄 Pages/Views
├── stores/             # 🏪 Pinia (State)
├── utils/              # 🛠️ Utilitaires
└── types/              # 📘 TypeScript
```

## 🏗️ Architecture Backend (Modulaire)

```
src/
├── modules/
│   └── users/         # Exemple de module
│       ├── types.ts
│       ├── service.ts
│       ├── controller.ts
│       └── index.ts
├── config/            # Config (DB, etc)
├── middleware/        # Middlewares
├── utils/             # Utilitaires
└── types/             # Types globaux
```

## Ajouter un Nouveau Module Backend

```typescript
// src/modules/posts/
├── types.ts           // DTOs
├── service.ts         // Logique métier
├── controller.ts      // Handlers
└── index.ts           // Exports
```

## Ajouter un Nouveau Composant Frontend

```vue
<!-- Atom -->
src/components/atoms/MyAtom.vue

<!-- Molecule -->
src/components/molecules/MyMolecule.vue
  ├── Atom 1
  └── Atom 2

<!-- Organism -->
src/components/organisms/MyOrganism.vue
  ├── Molecule 1
  └── Molecule 2
```

## 📚 Resources

- [Vue.js 3](https://vuejs.org)
- [Next.js](https://nextjs.org)
- [Prisma](https://www.prisma.io)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Accessibility](https://www.a11yproject.com)

## ❓ Troubleshooting

### La base de données ne se connecte pas
- Vérifiez que MySQL est en cours d'exécution
- Vérifiez le DATABASE_URL dans `.env.local`

### Les migrations se bloquent
```bash
# Reset la base (dev uniquement!)
npm run db:reset --workspace=packages/database
```

### Ports déjà utilisés
Changez les ports dans:
- Frontend: `packages/frontend/vite.config.ts`
- Backend: `packages/backend/next.config.js`

## 💡 Tips

- Utilisez Prisma Studio pour explorer la base: `npm run db:studio`
- Hot reload activé en développement (Frontend + Backend)
- Les types TypeScript sont strict mode
- Installez les extensions VS Code pour Vue et Prisma

---

**Happy coding! 🎉**
