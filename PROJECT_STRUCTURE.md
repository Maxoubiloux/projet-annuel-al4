# Structure Complète du Projet

```
projet-annuel-al4/
│
├── 📂 backend/                          → Backend Node.js + TypeScript (DDD)
│   ├── src/
│   │   ├── domain/                      → Logique métier (pur, sans dépendances)
│   │   │   ├── entities/
│   │   │   │   ├── Moto.ts
│   │   │   │   ├── Reservation.ts       (À créer)
│   │   │   │   ├── Location.ts          (À créer)
│   │   │   │   ├── Incident.ts          (À créer)
│   │   │   │   └── User.ts              (À créer)
│   │   │   ├── value-objects/           (À créer)
│   │   │   │   ├── Price.ts
│   │   │   │   ├── Status.ts
│   │   │   │   └── DateRange.ts
│   │   │   ├── repositories/
│   │   │   │   ├── IMotoRepository.ts
│   │   │   │   ├── IReservationRepository.ts (À créer)
│   │   │   │   └── ILocationRepository.ts    (À créer)
│   │   │   └── services/
│   │   │       ├── ReservationService.ts
│   │   │       ├── LocationService.ts   (À créer)
│   │   │       └── IncidentService.ts   (À créer)
│   │   │
│   │   ├── application/                 → Cas d'utilisation
│   │   │   ├── dtos/                    (À créer)
│   │   │   │   ├── CreateReservationDto.ts
│   │   │   │   └── CreateLocationDto.ts
│   │   │   ├── commands/                (À créer)
│   │   │   │   ├── CreateReservationCommand.ts
│   │   │   │   └── CheckinLocationCommand.ts
│   │   │   └── handlers/                (À créer)
│   │   │       ├── CreateReservationHandler.ts
│   │   │       └── CheckinLocationHandler.ts
│   │   │
│   │   ├── infrastructure/              → Dépendances externes
│   │   │   ├── database/                (À créer)
│   │   │   │   ├── PostgresRepository.ts
│   │   │   │   ├── data-source.ts
│   │   │   │   └── migrations/
│   │   │   ├── external/                (À créer)
│   │   │   │   ├── KeycloakIAM.ts
│   │   │   │   └── S3Storage.ts
│   │   │   ├── queues/                  (À créer)
│   │   │   │   ├── RabbitMQClient.ts
│   │   │   │   ├── RequestQueue.ts
│   │   │   │   └── ResponseQueue.ts
│   │   │   └── cache/                   (À créer)
│   │   │       └── RedisCache.ts
│   │   │
│   │   ├── presentation/                → API HTTP
│   │   │   ├── controllers/             (À créer)
│   │   │   │   ├── MotoController.ts
│   │   │   │   ├── ReservationController.ts
│   │   │   │   └── LocationController.ts
│   │   │   ├── middleware/
│   │   │   │   ├── AuthMiddleware.ts    ✓
│   │   │   │   ├── ErrorHandler.ts      (À créer)
│   │   │   │   └── CorrelationIdMiddleware.ts (À créer)
│   │   │   └── routes/
│   │   │       ├── v1/
│   │   │       │   ├── index.ts ✓
│   │   │       │   ├── motos.routes.ts ✓
│   │   │       │   ├── reservations.routes.ts (À créer)
│   │   │       │   └── locations.routes.ts   (À créer)
│   │   │       └── v2/
│   │   │           ├── index.ts ✓
│   │   │           ├── motos.routes.ts ✓
│   │   │           └── reservations.routes.ts (À créer)
│   │   │
│   │   └── shared/                      → Utilitaires partagés
│   │       ├── types/                   (À créer)
│   │       ├── errors/
│   │       │   └── DomainError.ts ✓
│   │       ├── logging/
│   │       │   └── Logger.ts ✓
│   │       ├── validation/              (À créer)
│   │       └── result/
│   │           └── Result.ts ✓
│   │
│   ├── test/
│   │   ├── domain/                      (À créer)
│   │   │   ├── ReservationService.test.ts
│   │   │   └── LocationService.test.ts
│   │   ├── application/                 (À créer)
│   │   │   └── CreateReservationHandler.test.ts
│   │   └── integration/                 (À créer)
│   │       └── API.test.ts
│   │
│   ├── docs/
│   │   ├── ADR/
│   │   │   └── 0001-ddd-architecture.md ✓
│   │   │       (0002-api-versioning.md, 0003-worker-isolation.md, etc.)
│   │   └── BREAKING_CHANGES.md ✓
│   │
│   ├── .github/workflows/
│   │   └── ci.yml ✓
│   │
│   ├── .env.example ✓
│   ├── .eslintrc.json ✓
│   ├── .gitignore ✓
│   ├── jest.config.js ✓
│   ├── Dockerfile ✓
│   ├── .dockerignore ✓
│   ├── tsconfig.json ✓
│   ├── package.json ✓
│   └── README.md ✓
│
├── 📂 worker/                           → Worker Rust (Asynchrone)
│   ├── src/
│   │   ├── main.rs ✓                   (Entry point)
│   │   ├── jobs/                        (À créer)
│   │   │   ├── mod.rs
│   │   │   ├── generate_contract.rs
│   │   │   ├── process_photos.rs
│   │   │   ├── validate_document.rs
│   │   │   └── send_email.rs
│   │   ├── queue/                       (À créer)
│   │   │   ├── mod.rs
│   │   │   ├── consumer.rs
│   │   │   └── producer.rs
│   │   ├── config.rs                    (À créer)
│   │   ├── error.rs                     (À créer)
│   │   └── lib.rs                       (À créer)
│   │
│   ├── tests/                           (À créer)
│   │   └── integration_tests.rs
│   │
│   ├── docs/
│   │   ├── ARCHITECTURE.md              (À créer)
│   │   └── JOBS.md                      (À créer)
│   │
│   ├── .env.example ✓
│   ├── .gitignore ✓
│   ├── Cargo.toml ✓
│   ├── Dockerfile ✓
│   ├── README.md ✓
│   └── .cargo/                          (À créer - config de build)
│
├── 📂 frontend/                         → Frontend React + TypeScript
│   ├── src/
│   │   ├── pages/                       (À créer)
│   │   │   ├── HomePage.tsx
│   │   │   ├── MotoListPage.tsx
│   │   │   ├── MotoDetailPage.tsx
│   │   │   ├── ReservationPage.tsx
│   │   │   └── MyReservationsPage.tsx
│   │   │
│   │   ├── components/                  (À créer)
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Navigation.tsx
│   │   │   ├── moto/
│   │   │   │   ├── MotoCard.tsx
│   │   │   │   └── MotoFilter.tsx
│   │   │   └── reservation/
│   │   │       └── ReservationForm.tsx
│   │   │
│   │   ├── hooks/                       (À créer)
│   │   │   ├── useAuth.ts
│   │   │   ├── useMoto.ts
│   │   │   └── useReservation.ts
│   │   │
│   │   ├── services/                    (À créer)
│   │   │   ├── api.ts          (Isolé de dépendances)
│   │   │   ├── auth.ts
│   │   │   ├── motos.ts
│   │   │   └── reservations.ts
│   │   │
│   │   ├── types/                       (À créer)
│   │   │   ├── index.ts
│   │   │   ├── moto.ts
│   │   │   └── reservation.ts
│   │   │
│   │   ├── styles/                      (À créer)
│   │   │   ├── index.css
│   │   │   └── tailwind.css
│   │   │
│   │   ├── App.tsx ✓
│   │   └── main.tsx ✓
│   │
│   ├── public/                          (À créer)
│   │   └── favicon.ico
│   │
│   ├── .env.example ✓
│   ├── .gitignore ✓
│   ├── index.html ✓
│   ├── package.json ✓
│   ├── tsconfig.json ✓
│   ├── vite.config.ts ✓
│   ├── README.md ✓
│   └── postcss.config.js                (À créer - Tailwind)
│
├── 📂 infrastructure/                   → Infrastructure as Code
│   ├── bicep/                           (À créer)
│   │   ├── main.bicep
│   │   ├── backend.bicep
│   │   ├── worker.bicep
│   │   ├── database.bicep
│   │   └── monitoring.bicep
│   │
│   ├── terraform/                       (À créer)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── README.md                        (À créer)
│
├── 📂 docs/
│   ├── architecture/
│   │   ├── ARCHITECTURE.md ✓
│   │   ├── SEQUENCE_DIAGRAMS.md         (À créer)
│   │   └── ERD.md                       (À créer)
│   │
│   ├── API.md                           (À créer)
│   ├── DEPLOYMENT.md                    (À créer)
│   └── CONTRIBUTING.md                  (À créer)
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                       (Backend only, À étendre)
│   │   ├── deploy.yml                   (À créer)
│   │   └── security.yml                 (À créer)
│   │
│   └── ISSUE_TEMPLATE/                  (À créer)
│       └── bug_report.md
│
├── 📄 docker-compose.yml ✓              → Stack locale complète
├── 📄 setup.sh ✓                        → Script d'initialisation
├── 📄 check-env.sh                      (À créer)
├── 📄 README.md ✓                       → Documentation racine
├── 📄 PROGRESS.md ✓                     → Checklist projet
└── 📄 .gitignore                        (À créer)
