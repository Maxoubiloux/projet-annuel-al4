# ADR 007: RabbitMQ, stratégie à deux files et isolation du worker

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
  - Demande : `{ correlation_id, job_type: "GenerateRentalContractPdf", reservation_id, data: { moto_id, customer_id, start_date, end_date, total_amount, deposit_amount, customer?, moto?, shop? } }`
    - `customer` : `{ first_name, last_name, email, phone }`
    - `moto` : `{ brand, model, plate, category? }`
    - `shop` : `{ name, city }`
    - Ces trois blocs sont **dénormalisés** : le worker n'ayant aucun accès à la base, tout ce qui
      doit figurer sur le contrat doit transiter dans le message. Ils sont **optionnels** sur le
      wire (le worker retombe sur les identifiants) afin que backend et worker puissent être
      déployés indépendamment.
  - Réponse : `{ correlation_id, reservation_id, success, url?, error? }`
- **Stockage du PDF produit** : le worker écrit le fichier (écriture atomique via fichier temporaire
  puis `rename`) dans un **volume Docker partagé** monté sur `CONTRACTS_DIR` côté worker et sur
  `uploads/contracts/` côté backend. Le worker ne renvoie qu'une URL (`PUBLIC_BASE_URL` + chemin) :
  il n'appelle jamais le backend, et le backend ne connaît jamais le worker.
- **Diffusion du PDF** : le contrat contient des données personnelles (identité, coordonnées,
  montants), il n'est donc **pas** servi par la route statique publique `/uploads/`. L'accès passe
  par `GET /api/v1/reservations/:id/contract`, qui vérifie le token et n'autorise que
  l'administrateur ou le client propriétaire de la réservation, puis streame le fichier depuis le
  volume. C'est cette URL que le worker renvoie dans sa réponse.
  À cette occasion, `/uploads/motos` a été ajouté à `PUBLIC_GET_PREFIXES` : les photos de motos
  s'affichent via des balises `<img>`, qui n'envoient jamais de header `Authorization`. Le
  commentaire de `main.ts` affirmait à tort que `/uploads/*` était exempté du hook d'authentification
  — il ne l'a jamais été, et toutes les images renvoyaient un 401.
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
- Le volume partagé de contrats introduit un couplage d'infrastructure (backend et worker doivent
  monter le même volume) en échange de la suppression de toute dépendance réseau entre les deux
  services. Une bascule ultérieure vers un stockage objet (S3/MinIO) ne changerait que la valeur de
  l'URL renvoyée dans la réponse.
- La diffusion du PDF passe par une route applicative plutôt que par le serveur de fichiers
  statiques : c'est un peu plus de code (un cas d'usage + une route) mais l'autorisation est
  explicite et testée, et le contrat n'est jamais accessible à qui possède seulement l'URL.
