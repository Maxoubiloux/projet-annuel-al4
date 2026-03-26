# ADR 0002: Utilisation de Prisma comme ORM

**Date** : 2026-03-26
**Statut** : Accepté

## Contexte

Le projet nécessite un accès à une base de données PostgreSQL pour persister les entités métier (motos, réservations, etc.). Un ORM est nécessaire pour simplifier les requêtes, gérer les migrations et garantir la type-safety.

## Décision

Utiliser **Prisma** comme ORM à la place de TypeORM (initialement listé dans le package.json mais non utilisé).

Raisons :
- Génération automatique de types TypeScript depuis le schéma
- Système de migrations fiable et versionnable
- API de requêtage intuitive et type-safe
- Bonne intégration avec PostgreSQL

## Conséquences

**Positif :**
- Type-safety complète entre le schéma DB et le code TypeScript
- Migrations versionnées et reproductibles
- DX améliorée (auto-complétion, validation au build)

**Négatif :**
- Dépendance au client généré (répertoire `src/generated/prisma`)
- Le client Prisma reste confiné à `src/infrastructure/` pour respecter l'isolation du domaine (ADR 0001)
