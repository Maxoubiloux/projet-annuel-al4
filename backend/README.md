# Moto Rental Platform - Backend

Backend TypeScript/Node.js avec architecture DDD pour la plateforme de location de motos.

## Architecture

```
src/
├── domain/          → Logique métier pure
├── application/     → Cas d'utilisation
├── infrastructure/  → Dépendances externes
├── presentation/    → Contrôleurs HTTP
└── shared/         → Utilitaires
```

## Démarrage Rapide

```bash
# 1. Installation
npm install

# 2. Configuration
cp .env.example .env

# 3. Base de données
docker-compose up -d
npm run db:migrate

# 4. Développement
npm run dev

# 5. Tests
npm run test:unit
npm run test:watch
```

## Scripts

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Compiler en production
- `npm run start` - Démarrer en production
- `npm run lint` - Vérifier le code
- `npm run test` - Lancer les tests
- `npm run typecheck` - Vérifier les types TypeScript

## Base de Données

PostgreSQL est utilisée pour persister les données.

### Migrations

```bash
# Générer une migration
npm run db:migrate:generate -- src/infrastructure/database/migrations/CreateMotosTable

# Exécuter les migrations
npm run db:migrate
```

## Authentification

L'authentification utilise **Keycloak** pour la gestion des identités. À chaque requête, le token JWT est validé via middleware.

## Queues & Worker

Communication asynchrone avec le Worker via **RabbitMQ** :
- Queue `requests` : Backend → Worker
- Queue `responses` : Worker → Backend

## Tests

```bash
# Tests unitaires
npm run test:unit

# Mode watch
npm run test:watch

# Couverture
npm run test:coverage
```

Cible minimale : 70% de couverture

## Documentation

- [ADRs](docs/ADR/) - Architecture Decision Records
- [Breaking Changes](docs/BREAKING_CHANGES.md) - Gestion des versions
- [API Documentation](docs/API.md) - Endpoints détaillés

## Sécurité

- Validation JWT stricte
- Pas de dépendances non-auditées
- Type-safe (TypeScript strict)
- Gestion d'erreurs explicite
