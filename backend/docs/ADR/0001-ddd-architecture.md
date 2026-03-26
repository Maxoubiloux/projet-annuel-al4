# ADR 0001: Architecture Domain-Driven Design

**Date**: 2026-03-26  
**Status**: ACCEPTED  
**Context**: Besoin d'une architecture scalable et maintenable pour la plateforme de location de motos

## Décision

Adopter une architecture **Domain-Driven Design (DDD)** avec les couches suivantes :
- **Domain** : Logique métier pure (entités, value objects, services)
- **Application** : Cas d'utilisation et orchestration
- **Infrastructure** : Dépendances externes (BD, queues, IAM)
- **Presentation** : Contrôleurs et routes HTTP

## Justification

1. **Testabilité** : La logique métier est isolée des dépendances externes
2. **Maintenabilité** : Les règles métier sont centralisées et faciles à trouver
3. **Scalabilité** : Permet l'évolution sans refactoring massif
4. **Langage partagé** : Le code reflète le domaine métier
5. **Indépendance technologique** : Facile de changer une dépendance externe

## Conséquences

- Code plus testable et maintenable
- Meilleure organisation du projet
- Plus de boilerplate initialement
- Apprentissage requis pour l'équipe
- Peut sembler over-engineered pour petits projets

## Alternatives Considérées

1. **Layered Architecture** : Trop générique, pas assez de structure
2. **Hexagonal Architecture** : Similar, mais moins clarifiant pour le métier
3. **Monolithe simple** : Rapide mais non-scalable à long terme
