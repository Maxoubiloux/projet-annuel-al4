# CLAUDE.md — Backend API

> Ce fichier guide Claude dans la compréhension, la génération et la modification du code de ce projet.
> Il doit être maintenu à jour à chaque évolution structurelle du backend.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Runtime | Node.js |
| Langage | TypeScript (strict mode) |
| Framework | Express.js |
| Base de données | PostgreSQL via Supabase |
| Auth | JWT (implémentation interne) |
| Message broker | RabbitMQ |
| Workers | Email (Nodemailer), PDF (PDFKit/Puppeteer), Payment (Stripe), Image (S3/Cloudinary) |

---

## Structure du projet

```
backend/
├── src/
│   ├── api/
│   │   └── v1/                    # Tous les endpoints versionnés ici
│   │       ├── routes/            # Déclaration des routes Express
│   │       ├── controllers/       # Logique de traitement des requêtes
│   │       ├── middlewares/       # Auth, validation, error handling
│   │       └── validators/        # Schémas de validation (zod / joi)
│   ├── services/                  # Logique métier pure (sans req/res)
│   ├── repositories/              # Accès base de données (pattern Repository)
│   ├── workers/                   # Consommateurs RabbitMQ
│   │   ├── email.worker.ts
│   │   ├── pdf.worker.ts
│   │   ├── payment.worker.ts
│   │   └── image.worker.ts
│   ├── messaging/                 # Producteurs RabbitMQ, config exchanges/queues
│   ├── config/                    # Variables d'environnement, constantes
│   ├── types/                     # Types et interfaces TypeScript globaux
│   ├── utils/                     # Helpers réutilisables
│   └── app.ts                     # Initialisation Express
├── BREAKING_CHANGE.md             # ⚠️ À mettre à jour à chaque breaking change API
├── CLAUDE.md                      # Ce fichier
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Conventions de code

### Nommage
- **Fichiers** : `kebab-case` → `user.controller.ts`, `auth.middleware.ts`
- **Classes** : `PascalCase` → `UserService`, `AuthMiddleware`
- **Fonctions / variables** : `camelCase`
- **Constantes globales** : `UPPER_SNAKE_CASE`
- **Types / Interfaces** : `PascalCase`, préfixe `I` pour les interfaces → `IUserPayload`

### TypeScript
- `strict: true` obligatoire dans `tsconfig.json`
- Pas de `any` — utiliser `unknown` si le type est indéterminé
- Toujours typer les paramètres de fonctions et les retours
- Utiliser les types utilitaires TypeScript (`Partial`, `Pick`, `Omit`, etc.) plutôt que de redéfinir

### Async / Error handling
- Toujours utiliser `async/await`, jamais de callbacks
- Les controllers wrappent leur logique dans un `try/catch` ou utilisent un wrapper `asyncHandler`
- Les erreurs métier remontent via des classes d'erreur custom (`AppError`, `NotFoundError`, etc.)
- Un middleware global `errorHandler` intercepte toutes les erreurs non gérées

---

## Versioning API

- Toutes les routes sont préfixées par `/api/v1/`
- Exemple : `GET /api/v1/users`, `POST /api/v1/auth/login`
- Une nouvelle version (`v2`) implique un nouveau dossier `src/api/v2/` — **ne jamais modifier v1 de façon destructive**

### ⚠️ Règle breaking change
> Toute modification qui casse la compatibilité ascendante d'un endpoint **doit** être documentée dans `BREAKING_CHANGE.md`.

Cela inclut :
- Suppression ou renommage d'un champ dans une réponse JSON
- Changement du type d'un champ existant
- Suppression ou renommage d'une route
- Modification du comportement d'un paramètre existant
- Changement de code HTTP retourné pour un cas existant
- Modification d'un contrat d'authentification (header, format token)

---

## Format des réponses API

### Succès
```json
{
  "success": true,
  "data": { ... }
}
```

### Succès avec pagination
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 154
  }
}
```

### Erreur
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "L'utilisateur demandé est introuvable."
  }
}
```

---

## Authentification (JWT)

- Le token JWT est transmis via le header `Authorization: Bearer <token>`
- Le middleware `authMiddleware` valide le token et injecte le payload dans `req.user`
- Les routes publiques sont explicitement marquées (pas de middleware auth)
- Ne jamais logger ni stocker le token brut

---

## RabbitMQ — Messaging

- Les **producteurs** (publishers) sont dans `src/messaging/`
- Les **consommateurs** (workers) sont dans `src/workers/`
- Nommage des queues : `<domaine>.<action>` → `email.send`, `pdf.generate`, `payment.process`, `image.upload`
- Les messages sont sérialisés en JSON
- Toujours gérer les cas de `nack` (dead-letter queue recommandée)

---

## Variables d'environnement

Les variables sensibles ne sont jamais committées. Documenter toute nouvelle variable dans `.env.example`.

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=7d

RABBITMQ_URL=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## IAM (Identity & Access Management)

- Le système d'IAM est **externe** au backend (Keycloak / Firebase / Cognito ou équivalent)
- Le frontend appelle l'IAM directement pour : login, création de compte, reset de mot de passe, 2FA
- Le backend **ne fait jamais confiance au frontend** : chaque requête entrante doit avoir son token validé
- La validation du token se fait via un middleware dédié qui appelle l'API de l'IAM ou vérifie la signature JWT
- Ne jamais bypasser la validation de token, même en dev
- Le backend peut appeler l'API d'administration de l'IAM (vérification token, modification utilisateur, envoi de mail)

---

## Architecture logicielle

### Isolation des dépendances externes
- Le domaine métier (`src/domain/`) ne doit **jamais** importer directement une dépendance externe (ORM, client HTTP, SDK tiers)
- Toute dépendance externe est abstraite derrière une interface définie dans le domaine
- Les implémentations concrètes (repositories, adapters) se trouvent dans `src/infrastructure/`
- Exception autorisée : dépendances à interface stable et sans peer-dependencies (ex: `neverthrow`, `immutable`) — **doit être justifiée par un ADR**

### Séparation erreurs métier / erreurs techniques
- Les erreurs métier sont des classes typées dans `src/domain/errors/` — elles ne contiennent **jamais** de code HTTP
- La traduction en code HTTP se fait uniquement dans la couche controller / middleware d'erreur
- Exemple : `UserNotFoundError` (domaine) → `404 Not Found` (controller), pas l'inverse

### Structure cible avec isolation domaine
```
src/
├── api/v1/              # Couche HTTP (routes, controllers, middlewares, validators)
├── domain/              # Domaine métier pur — zéro dépendance externe
│   ├── entities/        # Entités et value objects
│   ├── errors/          # Erreurs métier typées
│   ├── ports/           # Interfaces (repositories, services externes)
│   └── usecases/        # Cas d'usage / services métier
├── infrastructure/      # Implémentations concrètes des ports
│   ├── db/              # Repositories PostgreSQL
│   ├── messaging/       # Client RabbitMQ
│   └── iam/             # Client IAM
├── workers/             # Consommateurs RabbitMQ (isolés du domaine)
├── config/
├── types/
└── utils/
```

---

## ADR (Architecture Decision Records)

- Chaque ADR est un fichier Markdown dans `docs/adr/`
- Nommage : `YYYY-MM-DD-titre-court.md`
- **Un ADR est obligatoire dans les cas suivants :**
  - Changement dans un modèle de données
  - Ajout d'une dépendance externe
  - Choix d'architecture (pattern, lib, approche)
  - Utilisation d'une dépendance dans le domaine métier

### Template ADR minimal
```markdown
# [Titre de la décision]

**Date** : YYYY-MM-DD
**Statut** : Proposé | Accepté | Remplacé par ADR-XXX

## Contexte
Pourquoi cette décision est nécessaire.

## Décision
Ce qui a été décidé.

## Conséquences
Impact positif et négatifs de cette décision.
```

> ⚠️ Claude doit proposer la création d'un ADR à chaque fois qu'il génère du code impliquant un choix d'architecture ou l'ajout d'une nouvelle dépendance.

---

## Tests unitaires

- Les tests unitaires couvrent **en priorité** : le domaine métier, les cas d'usage, les validators
- Les dépendances externes sont **mockées** — les tests ne doivent pas nécessiter de base de données ni de broker
- Framework : `jest` + `ts-jest`
- **Emplacement** : dossier `backend/tests/` miroir de `backend/src/` — ex. `src/domain/usecases/create-moto.usecase.ts` → `tests/domain/usecases/create-moto.usecase.spec.ts`
- Les imports dans les specs utilisent les alias TypeScript (`@domain/*`, `@application/*`, `@presentation/*`, `@shared/*`) — pas de chemins relatifs vers `src/`
- Jest est configuré avec `roots: ['<rootDir>/src', '<rootDir>/tests']` dans `backend/jest.config.cjs`
- Un test doit être lisible comme une spec : `describe / it / expect`
- **Ne jamais utiliser `any` dans les tests**, sauf pour mocker une dépendance externe complexe

> ⚠️ Claude doit générer les tests unitaires associés à chaque nouveau cas d'usage ou service métier créé.

---

## Observabilité

- Chaque requête entrante reçoit (ou génère) un **correlation ID** (`X-Correlation-Id` header)
- Le correlation ID est propagé dans tous les logs liés à cette requête et dans les messages RabbitMQ
- Les logs doivent être structurés en JSON (utiliser `pino` ou `winston`)
- Niveaux de log à respecter :
  - `info` : entrée/sortie d'une requête, publication d'un message
  - `warn` : retry, dégradation non bloquante
  - `error` : exception non gérée, échec définitif d'un traitement
  - `debug` : détails internes (désactivé en prod)
- **Ne jamais logger** : tokens JWT, mots de passe, données personnelles sensibles

### Format de log attendu
```json
{
  "level": "info",
  "correlationId": "uuid-v4",
  "message": "User created successfully",
  "userId": "123",
  "timestamp": "2025-03-26T10:00:00.000Z"
}
```

---

## Worker — Règles d'isolation

- Le Worker est un service **totalement isolé** du backend
- Il n'a **aucun accès direct** à la base de données du backend (lecture seule tolérée si justifiée par ADR)
- Il reçoit toutes les données nécessaires dans le **message RabbitMQ entrant**
- Il publie sa réponse (succès ou échec) dans la **queue de réponse** — il n'appelle jamais le backend en HTTP
- Deux queues obligatoires :
  - `backend → worker` : demandes de traitement
  - `worker → backend` : réponses (y compris les erreurs)

### Politique de retry
- Chaque tâche worker a une politique de retry explicite définie dans son code
- Critères à définir par tâche : nombre de tentatives max, délai entre tentatives, comportement en cas d'échec définitif (dead-letter queue)
- Les tâches critiques (paiement, envoi de mail transactionnel) ont un retry plus agressif que les tâches non critiques

> ⚠️ Claude doit toujours définir la politique de retry lors de la création d'un nouveau handler worker.

---

## Breaking Changes — Procédure complète

Le backend doit pouvoir déployer une breaking change **sans redéploiement du frontend**.

### Stratégie retenue : versioning par URL
- `v1` reste disponible et fonctionnelle tant que le frontend n'a pas migré
- `v2` (ou supérieur) coexiste en parallèle dans `src/api/v2/`
- Le frontend migre vers la nouvelle version à son rythme

### Ce qui constitue une breaking change (rappel)
- Suppression / renommage d'un champ de réponse
- Changement de type d'un champ existant
- Suppression / renommage d'une route
- Changement de comportement d'un paramètre
- Changement de code HTTP pour un cas existant
- Modification du contrat d'authentification

### Mise à jour de BREAKING_CHANGE.md obligatoire
> Toute breaking change **doit** être documentée dans `BREAKING_CHANGE.md` **avant** d'être mergée.

Format attendu dans `BREAKING_CHANGE.md` :
```markdown
## [v2] YYYY-MM-DD — Titre court

**Route concernée** : `POST /api/v1/resource`
**Type de changement** : Renommage de champ / Suppression de route / ...
**Description** : Ce qui change et pourquoi.
**Migration** : Ce que le frontend doit faire pour passer à v2.
**Ancienne version** : `v1` reste disponible jusqu'à [date ou condition].
```

---

## Instructions pour Claude

### Règles absolues
- **Ne jamais** modifier une route existante de façon destructive sans créer une `v{n+1}` et mettre à jour `BREAKING_CHANGE.md`
- **Ne jamais** mettre de code HTTP (`404`, `500`...) dans le domaine métier
- **Ne jamais** importer un ORM, un SDK ou un client HTTP directement dans `src/domain/`
- **Ne jamais** utiliser `any` en TypeScript sauf mock de test — utiliser `unknown` + type narrowing
- **Ne jamais** logger un token JWT, un mot de passe ou une donnée personnelle sensible

### À faire systématiquement
- Générer les types TypeScript pour chaque nouvelle entité ou payload
- Créer un fichier de test `*.spec.ts` pour chaque nouveau cas d'usage ou service métier
- Proposer un ADR lors de l'ajout d'une dépendance externe ou d'un choix d'architecture
- Inclure le `correlationId` dans tous les logs générés
- Définir la politique de retry pour tout nouveau handler worker
- Respecter la séparation `domain / infrastructure / api`
- Lors d'un nouveau module, créer : `*.route.ts`, `*.controller.ts`, `*.usecase.ts`, `*.repository.ts` (port dans domain + impl dans infrastructure), `*.types.ts`, `*.spec.ts`

### Migrations de BDD
- Les migrations ne sont **jamais auto-générées sans review humaine**
- Toujours proposer le SQL de migration en commentaire avant de l'appliquer
