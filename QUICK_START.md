# 🏍️ Moto Rental Platform - Architecture Professionnelle

## ✨ État du Projet

```
🎯 Phase 1: Structure & Architecture                    [████████████████] 100% ✅

📊 Statistiques Actuelles:
  • 30+ fichiers créés
  • 3 services principaux configurés
  • Docker-compose complète
  • CI/CD pipeline
  • Documentation ADR
  • Structure DDD (Domain-Driven Design)
```

---

## 📦 Stack Technique

### Backend (Node.js + TypeScript)
```
✅ Framework:      Fastify (haute performance)
✅ DB:             PostgreSQL + TypeORM
✅ Cache:          Redis
✅ Queue:          RabbitMQ
✅ Auth:           Keycloak + JWT
✅ Logging:        Pino (JSON)
✅ Testing:        Jest
✅ Quality:        ESLint, TypeScript strict
✅ DevOps:         Docker, GitHub Actions
```

### Worker (Rust)
```
✅ Runtime:        Tokio (async)
✅ Queue:          RabbitMQ via Lapin
✅ Jobs:           PDF, Photos, Documents, Emails
✅ Retry:          Exponential backoff
✅ Observability:  Tracing
✅ Docker:         Alpine multi-stage
```

### Frontend (React)
```
✅ Framework:      React 18 + React Router
✅ Build:          Vite (ultra-rapide)
✅ State:          Zustand (léger)
✅ Styling:        Tailwind CSS
✅ API:            Axios (isolé)
✅ TypeScript:     Strict mode
✅ Responsive:     Mobile-first
```

### Infrastructure
```
✅ Local:          Docker Compose
✅ Cloud:          Google Cloud Run (recommandé)
✅ Database:       Cloud SQL
✅ Queue:          Pub/Sub
✅ Storage:        Cloud Storage
✅ IaC:            Bicep / Terraform (à créer)
```

---

## 🎯 Architecture DDD - Backend

### Domain Layer (Métier pur)
```typescript
domain/
├── entities/
│   ├── Moto                    ✓ Créée
│   ├── Reservation             (À créer)
│   ├── Location                (À créer)
│   ├── Incident                (À créer)
│   └── User                    (À créer)
├── value-objects/              (À créer)
├── repositories/               (Interfaces)
│   └── IMotoRepository         ✓ Créée
└── services/
    ├── ReservationService      ✓ Créée
    ├── LocationService         (À créer)
    └── IncidentService         (À créer)
```

### Application Layer (Usecases)
```typescript
application/
├── dtos/                       (À créer)
├── commands/                   (À créer)
└── handlers/                   (À créer)
    ├── CreateReservationHandler
    ├── CheckinLocationHandler
    └── CheckoutLocationHandler
```

### Infrastructure Layer (Dépendances)
```typescript
infrastructure/
├── database/       PostgreSQL + TypeORM
├── external/       Keycloak, S3/GCS
├── queues/         RabbitMQ consumer/producer
└── cache/          Redis
```

### Presentation Layer (HTTP API)
```typescript
presentation/
├── middleware/
│   ├── AuthMiddleware          ✓ Créée (JWT)
│   ├── ErrorHandler            (À créer)
│   └── CorrelationIdMiddleware  (À créer)
└── routes/
    ├── v1/                     (Legacy, 3 mois)
    │   ├── motos.routes.ts     ✓
    │   ├── reservations        (À créer)
    │   └── locations           (À créer)
    └── v2/                     (Current)
        ├── motos.routes.ts     ✓
        └── reservations        (À créer)
```

---

## 🚀 Démarrage Rapide

### Option 1: Docker Compose (⭐ Recommandé)

```bash
# Lance TOUT (Backend, Worker, Frontend, Keycloak, BD, Cache, Queue)
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend

# Services disponibles:
# - Backend:   http://localhost:3000
# - Frontend:  http://localhost:5173
# - Keycloak:  http://localhost:8080   (admin:admin)
# - RabbitMQ:  http://localhost:15672  (guest:guest)
# - PostgreSQL: localhost:5432
# - Redis:     localhost:6379
```

### Option 2: Développement Local

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (nouveau terminal)
cd frontend
npm install
npm run dev

# Worker (nouveau terminal)
cd worker
cargo run

# Services externe (Docker)
docker-compose up -d postgres redis rabbitmq keycloak
```

### Option 3: Vérifier l'Environnement

```bash
./check-env.sh   # Vérifier Node.js, Rust, Docker, etc.
./setup.sh       # Installation initiale
```

---

## 📋 Checklist Implémentation

### Phase 1: Entités Métier (1-2 semaines)
```
Backend:
  [ ] Moto entity (complet)
  [ ] Reservation entity
  [ ] Location entity
  [ ] Incident entity
  [ ] Value objects (Price, Status, DateRange)
  [ ] Tous les repositories (interfaces)
  [ ] Tests unitaires (70%+ coverage)
```

### Phase 2: Usecases (1-2 semaines)
```
Backend:
  [ ] CreateReservationHandler
  [ ] CheckinLocationHandler
  [ ] CheckoutLocationHandler
  [ ] ReportIncidentHandler
  [ ] Repositories (PostgreSQL)
  [ ] Tests d'intégration
```

### Phase 3: Worker Asynchrone (1 semaine)
```
Worker (Rust):
  [ ] RabbitMQ consumer
  [ ] GenerateRentalContractPdf job
  [ ] ProcessCheckinPhotos job
  [ ] ValidateDocument job
  [ ] SendEmail job
  [ ] Retry policy
  [ ] Tests Rust
```

### Phase 4: Frontend (1-2 semaines)
```
Frontend:
  [ ] Pages principales
  [ ] Composants réutilisables
  [ ] API services (isolés)
  [ ] Auth flow (Keycloak)
  [ ] Error handling
  [ ] Responsive design
```

### Phase 5: Breaking Changes & Versioning (3-5 jours)
```
Backend:
  [ ] Routes v1 complètes + maintenues
  [ ] Routes v2 avec nouveau format
  [ ] Feature flags pour activation progressive
  [ ] Tests de rétrocompatibilité
  [ ] Documentation BREAKING_CHANGES.md
```

### Phase 6: DevOps & Deployment (1 semaine)
```
DevOps:
  [ ] CI/CD pipeline complète (GitHub Actions)
  [ ] Dockerfile optimisés (multi-stage)
  [ ] Docker Hub push
  [ ] IaC (Bicep/Terraform)
  [ ] Cloud deployment (Google Cloud Run)
  [ ] Monitoring & observabilité
```

---

## 🎓 Architecture Décisions

### ADR 0001: Domain-Driven Design ✓
- Séparation nette domain/infrastructure
- Testabilité maximale
- Maintenabilité à long terme

### ADR 0002: API Versioning (À créer)
- Versions d'URL (`/v1`, `/v2`)
- Support 3 mois pour legacy
- Feature flags pour activations progressives

### ADR 0003: Worker Isolation (À créer)
- Rust pour performance & sécurité
- RabbitMQ pour découplage
- Retry policy par job

### ADR 0004: Type Safety (À créer)
- TypeScript strict mode
- Rust pour Worker
- No `any`, préférer `unknown`

---

## 📞 Documentation

| Fichier | Contenu |
|---------|---------|
| [README.md](README.md) | Vue globale du projet |
| [PROGRESS.md](PROGRESS.md) | Checklist détaillée |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Arborescence complète |
| [backend/README.md](backend/README.md) | Backend setup & API |
| [worker/README.md](worker/README.md) | Worker jobs & retry |
| [frontend/README.md](frontend/README.md) | Frontend setup |
| [docker-compose.yml](docker-compose.yml) | Stack locale |
| [backend/docs/BREAKING_CHANGES.md](backend/docs/BREAKING_CHANGES.md) | Gestion des versions |
| [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) | Architecture globale |
| [backend/docs/ADR/](backend/docs/ADR/) | Architecture Decision Records |

---

## 💡 Bonnes Pratiques

### ✅ À Faire

```typescript
// Domain - Logique métier pure
class Moto {
  isAvailable(): boolean { ... }
}

// Services - Usecases
class CreateReservationHandler {
  handle(cmd: CreateReservationCommand): Promise<Result<...>> { ... }
}

// Tests - Isolés de tout
describe('ReservationService', () => {
  it('should validate dates', () => { ... })
})

// Errors - Séparation métier/technique
class KycNotApprovedException extends DomainError { ... }
```

### ❌ À Éviter

```typescript
// ❌ Domain ne dépend jamais d'externe
class Moto {
  async save(db: Database) { } // WRONG
}

// ❌ Controllers sans validation
app.post('/reservations', (req) => {
  const { userId } = req.body // Pas typé!
})

// ❌ Versioning sans documentation
// POST /api/reservations → incompatible, pas de v1/v2
```

---

## 🎬 Prochaines Étapes Immédiates

### 1️⃣ Valider l'env local
```bash
./check-env.sh
docker-compose up -d
curl http://localhost:3000/health
```

### 2️⃣ Créer la première entité complète
```bash
# Backend: Finaliser Reservation entity
# + ReservationService avec tests
# + Repository interface
```

### 3️⃣ Créer le premier handler
```bash
# Application: CreateReservationHandler
# + Tests complets
# + Intégration domain
```

### 4️⃣ Tester la pipeline CI/CD
```bash
git commit -m "feat: add reservation entity"
# GitHub Actions devrait run tests, lint, build...
```

---

## 🔥 Points Clés pour la Démo

### Breaking Changes
```
Déployer v2 avec nouveau format
Frontend v1 continue à utiliser /v1
Backend SANS redémarrage
Frontend upgrade quand prête → /v2
Demo: zéro downtime! 🚀
```

### Asynchrone
```
Frontend soumet photos de checkout
Queue job → Worker compresse
Notification quand fini
Traçabilité complète via correlation ID
```

### Type Safety
```
TypeScript strict + Rust
Compilation = tests automatiques
Zero runtime type errors
```

---

**🎉 Architecture complète et prête pour développement!**

**Questions? Consultez la documentation ou demandez!**
