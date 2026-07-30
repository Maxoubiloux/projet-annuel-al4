# Moto Rental Platform — Worker

Worker asynchrone écrit en **Rust**. Il consomme les demandes publiées par le backend sur RabbitMQ,
génère le **contrat de location en PDF**, et publie sa réponse (succès *ou* échec) sur la file de
réponses.

## Isolation

Le worker est totalement isolé du backend (cf. [ADR 007](../backend/docs/ADR/007-rabbitmq-2-queues-isolation-worker.md)) :

- **aucun accès à la base de données** ;
- **aucun appel HTTP vers le backend** — tout ce qui figure sur le contrat arrive dans le message ;
- deux files distinctes : `worker_requests` (backend → worker) et `worker_responses` (worker → backend) ;
- les messages inexploitables partent en dead-letter (`worker_dlx` → `worker_dead_letters`).

Le seul point de contact hors messages est le **volume de contrats**, partagé avec le backend : le
worker y écrit le PDF, le backend le sert via une route authentifiée
`GET /api/v1/reservations/:id/contract` (le contrat contient des données personnelles).

## Job supporté

### `GenerateRentalContractPdf`

**Message entrant** (`worker_requests`) — miroir de `ContractJobRequest` dans
`backend/src/infrastructure/queues/messages.ts` :

```json
{
  "correlation_id": "uuid",
  "job_type": "GenerateRentalContractPdf",
  "reservation_id": "uuid",
  "data": {
    "moto_id": "uuid",
    "customer_id": "uuid",
    "start_date": "2026-08-01",
    "end_date": "2026-08-05",
    "total_amount": 340,
    "deposit_amount": 500,

    "customer": { "first_name": "…", "last_name": "…", "email": "…", "phone": "…" },
    "moto": { "brand": "…", "model": "…", "plate": "…", "category": "…" },
    "shop": { "name": "…", "city": "…" }
  }
}
```

Les trois blocs `customer` / `moto` / `shop` sont **dénormalisés** (le worker ne peut rien aller
chercher) et **optionnels** : s'ils manquent, le contrat est tout de même produit avec les
identifiants, ce qui permet de déployer backend et worker indépendamment.

**Message sortant** (`worker_responses`) :

```json
{ "correlation_id": "uuid", "reservation_id": "uuid", "success": true,  "url": "http://localhost:3000/api/v1/reservations/<uuid>/contract" }
{ "correlation_id": "uuid", "reservation_id": "uuid", "success": false, "error": "…" }
```

**Politique de retry** : 3 reprises, backoff exponentiel de base 1 s (1 s, 2 s, 4 s), plafonné à
30 s. Une erreur **permanente** (JSON invalide, `job_type` inconnu, `reservation_id` inexploitable)
n'est jamais rejouée.

**Politique d'acquittement** :

| Cas | Action worker | Effet backend |
|---|---|---|
| JSON illisible / `job_type` inconnu | `nack` sans requeue, aucune réponse | message en DLQ |
| Échec après épuisement des reprises | réponse `success: false` puis `ack` | `contract_status = 'failed'` |
| Succès | réponse `success: true` puis `ack` | `contract_status = 'ready'` + `contract_pdf_url` |

Le PDF est écrit de façon **atomique** (fichier temporaire puis `rename`) : le backend ne peut jamais
servir un fichier partiel.

## Démarrage

```bash
cp .env.example .env      # ajuster CONTRACTS_DIR et RABBITMQ_URL
cargo run                 # nécessite un RabbitMQ joignable

cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
cargo test                # aucun broker requis
```

En pratique, le worker se lance avec le reste de la plateforme :

```bash
docker compose up -d --build rabbitmq backend worker
docker compose logs -f worker
```

## Configuration

| Variable | Défaut | Rôle |
|---|---|---|
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672` | Connexion au broker |
| `REQUEST_QUEUE` | `worker_requests` | File des demandes |
| `RESPONSE_QUEUE` | `worker_responses` | File des réponses |
| `DEAD_LETTER_QUEUE` | `worker_dead_letters` | File de rebut |
| `DEAD_LETTER_EXCHANGE` | `worker_dlx` | Exchange fanout de rebut |
| `CONTRACTS_DIR` | `/data/contracts` | Répertoire d'écriture des PDF |
| `PUBLIC_BASE_URL` | `http://localhost:3000` | Racine de l'URL renvoyée |
| `MAX_RETRIES` | `3` | Reprises par job |
| `RETRY_BACKOFF_MS` | `1000` | Délai de base du backoff |
| `RUST_LOG` / `LOG_LEVEL` | `info` | Niveau de log |

Les noms et défauts des files sont **identiques à ceux du backend** : les deux services déclarent la
même topologie, et RabbitMQ rejette toute redéclaration divergente.

## Observabilité

Logs structurés en JSON (`tracing`), avec le `correlation_id` reçu du backend propagé dans tous les
logs du job **et** renvoyé dans la réponse — une seule recherche suffit à suivre une réservation de
bout en bout :

```json
{
  "timestamp": "2026-07-28T10:30:00Z",
  "level": "INFO",
  "fields": {
    "message": "Contract generated",
    "correlation_id": "uuid",
    "reservation_id": "uuid",
    "duration_ms": 42,
    "url": "http://localhost:3000/api/v1/reservations/<uuid>/contract"
  }
}
```

## Structure

```
src/
├── main.rs              # câblage, arrêt gracieux (SIGTERM/SIGINT), tracing
├── config.rs            # variables d'environnement
├── error.rs             # erreurs + classification retryable / permanent
├── retry.rs             # backoff exponentiel plafonné
├── jobs/
│   ├── mod.rs           # dispatcher : parse, retry, réponse, ack/nack
│   ├── messages.rs      # contrat d'échange (miroir de messages.ts)
│   └── generate_contract.rs  # rendu PDF (printpdf) + écriture atomique
└── queue/
    ├── mod.rs           # connexion avec reprise au démarrage
    ├── topology.rs      # déclaration miroir de celle du backend
    ├── consumer.rs      # boucle de consommation, prefetch, ack/nack
    └── producer.rs      # publication persistante avec confirmations
```

## Docker

```bash
docker build -t moto-rental-worker:latest ./worker
```

Image multi-stage (build `rust:1.93-slim-bookworm`, runtime `debian:bookworm-slim`), exécutée par un
utilisateur non privilégié. `lapin` est compilé sans backend TLS — le worker ne parle qu'AMQP en
clair au broker interne — ce qui évite toute dépendance système à l'exécution.
