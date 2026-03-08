# A11y Formation - Monorepo

Monorepo pour le projet de formation en accessibilité web (A11y).

## Architecture

```
a11y-formation/
├── packages/
│   ├── frontend/       # Vue.js + Vite (Atomic Design)
│   ├── backend/        # Next.js API (Architecture Modulaire)
│   └── database/       # Prisma + MySQL
├── package.json        # Root workspace
└── README.md          # This file
```

## Stack Technologique

### Frontend
- **Framework**: Vue.js 3
- **Build Tool**: Vite
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Styling**: CSS Modules
- **Architecture**: Atomic Design

### Backend
- **Framework**: Next.js 14 (API Routes)
- **Runtime**: Node.js
- **ORM**: Prisma
- **Database**: MySQL
- **Architecture**: Modulaire

### Database
- **DBMS**: MySQL
- **ORM**: Prisma
- **Migration Tool**: Prisma Migrate

## Installation

### Prérequis
- Node.js >= 18
- npm >= 9
- MySQL >= 8.0

### Setup Initial

```bash
# Cloner le repository
git clone <repository>
cd a11y-formation

# Installer les dépendances de tous les workspaces
npm install

# Copier les fichiers d'environnement
cp packages/frontend/.env.example packages/frontend/.env.local
cp packages/backend/.env.example packages/backend/.env.local
cp packages/database/.env.example packages/database/.env.local

# Configurer la base de données
# 1. Créer une base MySQL nommée 'a11y_formation'
# 2. Mettre à jour le DATABASE_URL dans packages/database/.env.local

# Créer les migrations Prisma
npm run db:migrate --workspace=packages/database

# Seed la base de données
npm run db:seed --workspace=packages/database
```

## Développement

### Lancer en mode développement

```bash
npm run dev
```

Cela démarrera:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Database Studio: http://localhost:5555

### Frontend uniquement

```bash
npm run dev --workspace=packages/frontend
```

### Backend uniquement

```bash
npm run dev --workspace=packages/backend
```

## Scripts Disponibles

### Root
```bash
npm run dev           # Démarrer le dev pour front et back
npm run build         # Build tous les packages
npm run lint          # Linter tous les packages
npm run type-check    # Vérifier les types tous les packages
```

### Frontend (`packages/frontend`)
```bash
npm run dev           # Démarrer le dev server
npm run build         # Build pour la production
npm run preview       # Prévisualiser la build
npm run lint          # Linter le code
npm run type-check    # Vérifier les types TypeScript
```

### Backend (`packages/backend`)
```bash
npm run dev           # Démarrer le dev server
npm run build         # Build pour la production
npm run start         # Démarrer la production
npm run lint          # Linter le code
npm run type-check    # Vérifier les types TypeScript
npm run db:push       # Pusher les changements Prisma
npm run db:migrate    # Créer une nouvelle migration
npm run db:studio     # Ouvrir Prisma Studio
```

### Database (`packages/database`)
```bash
npm run db:push       # Pusher les changements Prisma
npm run db:migrate    # Créer une nouvelle migration
npm run db:studio     # Ouvrir Prisma Studio
npm run db:seed       # Seed la base de données
```

## Structure des Dossiers

### Frontend - Atomic Design
```
packages/frontend/src/
├── components/
│   ├── atoms/         # Composants basiques (Button, Input, etc.)
│   ├── molecules/     # Composants composés (InputGroup, SearchBar, etc.)
│   └── organisms/     # Composants complexes (Forms, Lists, etc.)
├── pages/             # Pages/Views
├── stores/            # Pinia stores
├── utils/             # Fonctions utilitaires
├── types/             # Types TypeScript
├── assets/            # Images, fonts, etc.
└── styles/            # Variables CSS globales
```

### Backend - Architecture Modulaire
```
packages/backend/
├── src/
│   ├── modules/       # Modèles métier (users, posts, etc.)
│   │   └── users/
│   │       ├── types.ts
│   │       ├── service.ts
│   │       ├── controller.ts
│   │       └── index.ts
│   ├── config/        # Configuration (DB, etc.)
│   ├── middleware/    # Middlewares Express
│   ├── utils/         # Fonctions utilitaires
│   └── types/         # Types globaux
├── app/               # App routes (Next.js App Router)
│   ├── api/           # API routes
│   ├── page.tsx       # Page d'accueil
│   └── layout.tsx
└── public/            # Assets statiques
```

### Database - Prisma
```
packages/database/
├── prisma/
│   ├── schema.prisma  # Schema Prisma
│   └── seed.js        # Data seeding
└── .env              # Configuration DB
```

## Conventions

### Naming
- Dossiers: `kebab-case`
- Fichiers: `PascalCase.vue` (composants), `camelCase.ts` (utilitaires)
- Variables: `camelCase`
- Types/Interfaces: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`

### Git
- Branch: `feature/`, `fix/`, `docs/`, etc.
- Commit: Messages clairs et descriuptifs

### Code Style
- Prettier pour le formatting
- ESLint pour les règles de code
- TypeScript strict mode

## Ressources

- [Vue.js 3 Documentation](https://vuejs.org)
- [Next.js Documentation](https://nextjs.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [A11y - Web Accessibility](https://www.a11yproject.com)

## License

MIT
