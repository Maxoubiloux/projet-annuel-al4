# Projet Annuel AL4 - City Moto Yard (Location de Motos)

Ce projet est une plateforme de location de motos nommée City Moto Yard.

## 🏍️ Frontend (Next.js)

Le frontend est situé dans le dossier `/frontend`. Il utilise **Next.js 15**, **TypeScript** et **Tailwind CSS**.

### Prérequis

- **Node.js 18.x** ou supérieur
- **npm** ou **yarn**

### Installation

1. Naviguez dans le dossier du frontend :
   ```bash
   cd /frontend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

### Lancement en mode développement

Pour lancer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

### Build pour la production

Pour générer une version optimisée pour la production :
```bash
npm run build
```

Pour lancer la version de production après le build :
```bash
npm run start
```

## 🏗️ Architecture du projet

- `frontend` : Interface utilisateur Next.js.
- `backend` : API (à implémenter).
- `worker` : Traitements asynchrones (à implémenter).
- `docs/adr` : Architecture Decision Records (ADR).
