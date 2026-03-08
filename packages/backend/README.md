# Backend - A11y Formation

API Next.js 14 avec architecture modulaire.

## Setup

```bash
npm install
npm run dev
```

## Build & Run

```bash
npm run build
npm run start
```

## Structure (Modulaire)

Chaque module contient:
- **types.ts**: DTOs et types
- **service.ts**: Logique métier
- **controller.ts**: Handlers des requêtes
- **index.ts**: Exports

## Database

```bash
npm run db:migrate    # Créer migration
npm run db:studio     # Ouvrir Prisma Studio
```

## Vérification Types et Lint

```bash
npm run type-check
npm run lint
```

## API Documentation

### Users Endpoints

- `GET /api/users` - Récupérer tous les utilisateurs
- `POST /api/users` - Créer un nouvel utilisateur
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```

## Variables d'Environnement

`.env.local`:
```
DATABASE_URL="mysql://user:password@localhost:3306/a11y_formation"
NODE_ENV="development"
API_URL="http://localhost:3000"
```
