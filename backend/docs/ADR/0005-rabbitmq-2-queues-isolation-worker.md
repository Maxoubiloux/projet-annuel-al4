# ADR 0005: RabbitMQ, stratégie à deux files et isolation du worker

**Date** : 2026-07-24
**Statut** : Accepté

## Contexte

Le cahier des charges impose au moins un traitement métier **asynchrone**, exécuté par un worker
**totalement isolé** du backend : le worker n'a aucun accès à la base de données, reçoit toutes les
données nécessaires dans le message entrant, et répond (succès **ou** échec) via une file dédiée —
jamais par un appel HTTP synchrone vers le backend. La communication doit passer par **deux files
distinctes** (demandes backend→worker, réponses worker→backend).

Jusqu'ici, `amqplib` était déclaré dans `backend/package.json` mais **jamais utilisé** : aucune
publication ni consommation côté backend. Le premier cas d'usage câblé est la **génération du contrat
de location en PDF** à la création d'une réservation.

## Décision

- **Broker** : RabbitMQ, via la librairie `amqplib` (déjà présente, API Promise stable). Ajout de
  `@types/amqplib` en devDependency.
- **Deux files + dead-letter** (noms configurables par variables d'environnement, défauts alignés sur
  `worker/.env.example` et `docker-compose.yml`) :
  - `REQUEST_QUEUE` (défaut `worker_requests`) : demandes backend → worker.
  - `RESPONSE_QUEUE` (défaut `worker_responses`) : réponses worker → backend.
  - `DEAD_LETTER_QUEUE` (défaut `worker_dead_letters`) lié à un exchange `worker_dlx` : reçoit les
    messages rejetés (`nack` sans requeue), typiquement les messages malformés.
- **Isolation du domaine** : le domaine dépend d'un port `IContractQueuePublisher`
  (`src/domain/ports/`) dont l'entrée est décrite en termes métier. La connexion, la sérialisation et
  le format d'échange vivent dans `src/infrastructure/queues/` — le domaine n'importe jamais `amqplib`.
- **Format d'échange (contrat)** : messages JSON en `snake_case` (idiomatique côté worker Rust /
  serde). Chaque message porte un `correlation_id` de bout en bout.
  - Demande : `{ correlation_id, job_type: "GenerateRentalContractPdf", reservation_id, data: { moto_id, customer_id, start_date, end_date, total_amount, deposit_amount } }`
  - Réponse : `{ correlation_id, reservation_id, success, url?, error? }`
- **Robustesse** :
  - La publication est *fire-and-forget* : un échec de publication n'annule jamais une réservation
    déjà persistée (le contrat reste en statut `pending`).
  - Le consumer de réponses met à jour la réservation (`contract_status` = `ready`/`failed`,
    `contract_pdf_url`). Message invalide → `nack` sans requeue (DLQ) ; erreur transitoire de mise à
    jour → `nack` avec requeue.
  - Broker indisponible au démarrage → l'API démarre quand même (log `warn`), les fonctionnalités de
    file sont simplement inactives (utile en dev sans RabbitMQ).
- **Modèle de données** : ajout des colonnes `contract_status` (défaut `pending`) et
  `contract_pdf_url` (nullable) sur `bookings` (migration `20260724120000_add_booking_contract_fields`).

Ce document fait **contrat de référence** avec l'équipe Worker (Rust) : toute évolution du format de
message ou des noms de files doit être synchronisée des deux côtés.

## Conséquences

**Positif :**
- Traitement métier réellement asynchrone et découplé ; worker isolé (aucun accès DB, tout en entrée).
- Domaine pur (port + implémentation d'infrastructure) ; testable sans broker (handler pur `handleContractResponse`).
- Traçabilité bout-en-bout via `correlation_id` ; messages rejetés capturés en DLQ.

**Négatif :**
- Une dépendance d'infrastructure supplémentaire à exploiter (RabbitMQ) et à démarrer pour la démo.
- Le couplage se déplace vers le **format de message** : il doit rester synchronisé avec le worker
  (d'où ce contrat documenté).
- La politique de retry par criticité (par type de job) reste à affiner côté worker (hors périmètre
  backend, cf. P2 du plan d'intégration).
