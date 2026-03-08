<!-- Frontend README -->
# Frontend - A11y Formation

Application Vue.js 3 avec Vite et Atomic Design.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Structure (Atomic Design)

- **Atoms**: Composants basiques (Button, Input)
- **Molecules**: Composants composés (InputGroup, SearchBar)
- **Organisms**: Composants complexes (Forms, Lists)
- **Pages**: Views complètes
- **Stores**: Gestion d'état (Pinia)
- **Utils**: Fonctions utilitaires
- **Types**: Interfaces TypeScript

## Vérification Types et Lint

```bash
npm run type-check
npm run lint
```

## API URL

Par défaut: `http://localhost:3000/api`

Configurer dans `.env.local`:
```
VITE_API_URL=http://localhost:3000/api
```
