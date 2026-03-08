PROJECT_STRUCTURE.md

# 📁 Structure Complète du Projet

## Tree View

```
a11y-formation/
│
├── 📄 package.json                    # Root workspace config
├── 📄 README.md                       # Documentation principale
├── 📄 GETTING_STARTED.md              # Guide de démarrage rapide
├── 📄 .gitignore                      # Git ignore global
├── 📄 .prettierrc                     # Prettier config
├── 📄 .prettierignore                 # Prettier ignore
├── 📄 setup.sh                        # Script de setup
│
└── 📦 packages/
    │
    ├── 🎨 frontend/                   # Vue.js 3 + Vite
    │   ├── 📄 package.json
    │   ├── 📄 tsconfig.json
    │   ├── 📄 tsconfig.app.json
    │   ├── 📄 vite.config.ts
    │   ├── 📄 index.html
    │   ├── 📄 .env.example
    │   ├── 📄 .gitignore
    │   ├── 📄 .eslintrc.json
    │   ├── 📄 README.md
    │   │
    │   └── 📁 src/
    │       ├── 📄 main.ts
    │       ├── 📄 App.vue
    │       ├── 📄 router.ts
    │       │
    │       ├── 📁 components/          # Atomic Design
    │       │   ├── 📁 atoms/           # Composants basiques
    │       │   │   ├── Button.vue
    │       │   │   └── Input.vue
    │       │   ├── 📁 molecules/       # Composants composés
    │       │   │   └── InputGroup.vue
    │       │   └── 📁 organisms/       # Composants complexes
    │       │       └── UserForm.vue
    │       │
    │       ├── 📁 pages/               # Pages/Views
    │       │   └── UsersPage.vue
    │       │
    │       ├── 📁 stores/              # Pinia State Management
    │       │   └── userStore.ts
    │       │
    │       ├── 📁 utils/               # Utilitaires
    │       │   └── api.ts
    │       │
    │       ├── 📁 types/               # Types TypeScript
    │       │   └── index.ts
    │       │
    │       ├── 📁 assets/              # Images, fonts
    │       │
    │       └── 📁 styles/              # CSS global
    │
    ├── 🔧 backend/                    # Next.js API Routes
    │   ├── 📄 package.json
    │   ├── 📄 tsconfig.json
    │   ├── 📄 next.config.js
    │   ├── 📄 .env.example
    │   ├── 📄 .gitignore
    │   ├── 📄 README.md
    │   │
    │   ├── 📁 app/
    │   │   ├── 📄 page.tsx
    │   │   ├── 📄 layout.tsx
    │   │   │
    │   │   └── 📁 api/
    │   │       └── 📁 users/
    │   │           └── 📄 route.ts
    │   │
    │   ├── 📁 public/                  # Assets statiques
    │   │
    │   └── 📁 src/
    │       ├── 📁 modules/             # Architecture Modulaire
    │       │   └── 📁 users/           # Exemple de module
    │       │       ├── 📄 types.ts     # DTOs et types
    │       │       ├── 📄 service.ts   # Logique métier
    │       │       ├── 📄 controller.ts # Handlers
    │       │       └── 📄 index.ts     # Exports
    │       │
    │       ├── 📁 config/              # Configuration
    │       │   └── 📄 prisma.ts
    │       │
    │       ├── 📁 middleware/          # Middlewares
    │       │
    │       ├── 📁 utils/               # Utilitaires
    │       │
    │       └── 📁 types/               # Types globaux
    │           └── 📄 index.ts
    │
    └── 💾 database/                   # Prisma Schema
        ├── 📄 package.json
        ├── 📄 .env.example
        ├── 📄 .gitignore
        ├── 📄 README.md
        │
        └── 📁 prisma/
            ├── 📄 schema.prisma        # Schema Prisma
            └── 📄 seed.js              # Data seeding
```

## 📊 Détails des Fichiers Clés

### Root Level
- `package.json` - Workspace configuration avec npm workspaces
- `README.md` - Documentation complète du projet
- `GETTING_STARTED.md` - Guide rapide pour démarrer
- `setup.sh` - Script automatique de configuration
- `.gitignore` - Ignore les fichiers système et dépendances

### Frontend
- `components/` - Atomic Design hierarchy
  - `atoms/` - Éléments de base réutilisables
  - `molecules/` - Composants faits d'atoms
  - `organisms/` - Composants complexes
- `pages/` - Views/Pages de l'application
- `stores/` - Gestion d'état avec Pinia
- `router.ts` - Configuration Vue Router

### Backend
- `src/modules/` - Modules métier indépendants
  - Chaque module: types, service, controller
- `src/config/` - Configuration globale (Prisma DB)
- `app/api/` - Routes API Next.js

### Database
- `prisma/schema.prisma` - Définition du schéma
- `prisma/seed.js` - Initial data

## 🔄 Flux de Communication

```
┌─────────────┐
│  Frontend   │  (Vue.js 3)
│  Port 5173  │
└──────┬──────┘
       │ HTTP/Axios
       ↓
┌─────────────────────────────┐
│   Backend API                │ (Next.js)
│   localhost:3000/api         │ Port 3000
├─────────────────────────────┤
│ • User Module                │
│ • Other Modules              │
└──────┬──────────────────────┘
       │ Prisma ORM
       ↓
┌─────────────┐
│  MySQL DB   │
│ Port 3306   │
└─────────────┘
```

## 🎯 Avantages de cette Architecture

### Monorepo
✅ Code partagé entre front et back
✅ Gestion simplifiée des dépendances
✅ Déploiement coordonné
✅ Un seul git repository

### Frontend (Atomic Design)
✅ Composants réutilisables
✅ Évolutivité
✅ Maintenance facilitée
✅ Documentation implicite

### Backend (Modulaire)
✅ Scalabilité horizontale
✅ Modules indépendants
✅ Responsabilités claires
✅ Tests unitaires faciles

### Database (Prisma)
✅ Typesafe ORM
✅ Migrations automatiques
✅ Seed documentation
✅ Studio visuel

## 📝 Prochaines Étapes

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer MySQL & .env**
   ```bash
   # Voir GETTING_STARTED.md
   ```

3. **Lancer les migrations**
   ```bash
   npm run db:migrate --workspace=packages/database
   ```

4. **Démarrer le développement**
   ```bash
   npm run dev
   ```

## 🚀 Scaling

### Ajouter un Module Backend
```
packages/backend/src/modules/newmodule/
├── types.ts
├── service.ts
├── controller.ts
└── index.ts
```

### Ajouter un Composant Frontend
```
packages/frontend/src/components/{atoms|molecules|organisms}/
└── MyComponent.vue
```

### Ajouter une Entité Database
```
prisma/schema.prisma    # Ajouter model
npm run db:migrate      # Créer migration
```

---

**Architecture prête pour la production! 🎉**
