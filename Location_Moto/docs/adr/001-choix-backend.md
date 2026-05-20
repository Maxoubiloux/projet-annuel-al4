# ADR 001 : Choix du langage et du framework Backend

Date : 2026-03-26

## Statut
Accepté

## Contexte
Le projet nécessite un backend robuste avec un typage strict (annotations de type obligatoires) et une évaluation statique du typage. Il doit être capable de gérer la persistance des données et la coordination des opérations métier.

## Décision
Nous choisissons d'utiliser **TypeScript** avec le framework **NestJS**.

## Justification
- **Typage strict** : NestJS est construit autour de TypeScript, ce qui garantit le respect de la contrainte de typage strict et d'évaluation statique (via `tsc` et `eslint`).
- **Architecture robuste** : NestJS impose une architecture modulaire et une injection de dépendances, ce qui facilite l'isolation du domaine métier des dépendances externes (Architecture Hexagonale/Clean Architecture).
- **Écosystème** : Large support pour les bases de données (TypeORM/Prisma), les queues (BullMQ/Microservices NestJS) et les systèmes d'IAM.
- **Maintenance** : Code structuré et facile à tester, répondant aux exigences de tests unitaires du projet.

## Conséquences
- Nécessité de configurer TypeScript de manière stricte (`strict: true` dans `tsconfig.json`).
- Utilisation de `unknown` au lieu de `any` pour respecter les consignes du projet.
- Structure de projet claire avec des modules, contrôleurs et services.
