# ADR 004: Versioning d'API par URL pour les breaking changes

**Date** : 2026-07-24
**Statut** : Accepté

## Contexte

L'API expose des contrats consommés par plusieurs frontends (client Next.js, back-office admin)
déployés indépendamment du backend. Le cahier des charges exige de pouvoir livrer une *breaking
change* (rupture de compatibilité ascendante d'un endpoint) **sans redéployer le backend** pour que
les clients basculent : chaque client doit pouvoir migrer à son rythme.

Une breaking change est notamment : suppression/renommage d'un champ de réponse, changement de type
d'un champ, suppression/renommage d'une route, changement de comportement d'un paramètre, changement
de code HTTP pour un cas existant, ou modification du contrat d'authentification.

Le backend est déjà structuré avec des préfixes `/api/v1` et `/api/v2` (`presentation/routes/v1`,
`presentation/routes/v2`), mais `v2` était un stub vide et aucune breaking change réelle n'était
démontrable.

## Décision

Adopter le **versioning par URL** comme stratégie de référence :

- `v1` reste disponible et **inchangée** (non destructif) tant que les clients ne l'ont pas quittée.
- Une nouvelle version majeure de contrat vit dans un dossier dédié `presentation/routes/v{n}/` et
  est montée sur le préfixe `/api/v{n}` dans `main.ts`.
- Les use cases du domaine sont **réutilisés** entre versions ; seule la couche présentation
  (controllers + presenters) diffère. Un *presenter* pur par version sérialise l'entité domaine vers
  le DTO de la version (ex. `presentation/presenters/v2/moto-v2.presenter.ts`).
- Le basculement côté client se fait via un simple flag d'environnement (`API_VERSION=v1|v2`) : on
  redéploie le frontend seul, le backend expose les deux versions en parallèle.
- Toute breaking change est documentée **avant merge** dans `backend/docs/BREAKING_CHANGES.md` avec
  une entrée datée (route concernée, type de changement, migration, échéance de v1).

Première application concrète (démonstrable en soutenance) : `GET /api/v2/motos/:id` renvoie
`dailyPriceCents` (entier, centimes) au lieu de `pricePerDay` (float, euros) — renommage **et**
changement de type de champ.

Alternatives écartées : versioning par header `Accept-Version` (routage/cache HTTP moins lisibles,
plus difficile à démontrer) et feature flags (utile pour des activations progressives, pas pour une
rupture de contrat franche).

## Conséquences

**Positif :**
- Rupture de contrat livrable sans coordination de déploiement backend/frontend.
- v1 garantie non régressée (nouveau code isolé dans `v{n}`).
- Contrat testable version par version ; logique métier non dupliquée (use cases partagés).

**Négatif :**
- Duplication de la couche présentation entre versions (controllers/presenters).
- Nécessite une discipline documentaire (`BREAKING_CHANGES.md`) et une politique de dépréciation
  (délai de transition, header `Deprecation` sur v1) pour éviter l'accumulation de versions.
