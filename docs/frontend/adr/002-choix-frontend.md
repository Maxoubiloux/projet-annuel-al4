# ADR 002 : Choix du framework Frontend

Date : 2026-03-26

## Statut
Accepté

## Contexte
Le projet nécessite une interface utilisateur (Frontend) pour que l'application soit accessible. Elle doit être typée et isoler ses dépendances externes.

## Décision
Nous choisissons d'utiliser **React** avec le framework **Next.js** et **Tailwind CSS**.

## Justification
- **TypeScript** : Intégration native de TypeScript avec React pour un typage fort sur l'ensemble du front.
- **Next.js** : Offre une architecture solide (Routing, API Routes, SSR/ISR) et facilite la gestion du SEO et des performances.
- **Interface Utilisateur** : Tailwind CSS permet un développement rapide d'une interface inspirée de *envie2rouler* avec un design moderne et responsive.
- **IAM** : Intégration facile avec des SDK comme Firebase ou Keycloak.

## Conséquences
- Utilisation de hooks pour la gestion de l'état et des effets.
- Isolation des appels API dans des services/hooks dédiés pour respecter les principes d'architecture logicielle.
- Mise en place de composants réutilisables.
