# Projet Annuel AL4 - City Moto Yard (Location de Motos)

Ce projet est une plateforme de location de motos nommée City Moto Yard.

## 🏍️ Frontend (Next.js)

Le frontend est situé dans le dossier `Location_Moto/frontend`. Il utilise **Next.js 15**, **TypeScript** et **Tailwind CSS**.

### Prérequis

- **Node.js 18.x** ou supérieur
- **npm** ou **yarn**

### Installation

1. Naviguez dans le dossier du frontend :
   ```bash
   cd Location_Moto/frontend
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

- `Location_Moto/frontend` : Interface utilisateur Next.js.
- `Location_Moto/backend` : API (à implémenter).
- `Location_Moto/worker` : Traitements asynchrones (à implémenter).
- `Location_Moto/docs/adr` : Architecture Decision Records (ADR).