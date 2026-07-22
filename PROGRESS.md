# Moto Rental Platform - Overview

**Statut**: 🚀 Structure initialisée  
**Date**: 29 janvier 2026  
**Tech Stack**: TypeScript, Rust, React, PostgreSQL, RabbitMQ

## ✨ Qu'avez-vous?

### ✅ Backend (Node.js + TypeScript)
```
src/domain/            Logique métier (DDD)
src/application/       Usecases
src/infrastructure/    Dépendances (BD, Queue, IAM)
src/presentation/      Contrôleurs HTTP (v1 + v2)
src/shared/            Utilitaires (erreurs, logging, result)
```

**Services locaux:**
- Fastify API server
- PostgreSQL database
- Redis cache
- RabbitMQ queue
- Keycloak IAM

### ✅ Worker (Rust)
```
src/main.rs            Entry point
Cargo.toml             Dependencies (Tokio, Lapin)
```

**Responsabilités:**
- PDF generation
- Photo processing
- Document validation
- Email dispatch

### ✅ Frontend (React)
```
src/pages/             Routes
src/components/        Composants réutilisables
src/services/          API clients (isolés)
src/types/             TypeScript types
```

### ✅ Infrastructure
```
docker-compose.yml     Stack locale complète
.github/workflows/     CI/CD pipeline
docs/architecture/     Documentation
```

## 🎯 Prochaines Étapes

### 1️⃣ Lancer le Projet Localement
```bash
docker-compose up -d

# Services:
# - Backend:  http://localhost:3000
# - Frontend: http://localhost:5173
# - Keycloak: http://localhost:8080 (admin:admin)
# - RabbitMQ: http://localhost:15672
```

### 2️⃣ Implémenter les Entités Métier

**Backend (domain/):**
- [ ] Moto entity (complet)
- [ ] Reservation entity
- [ ] Location entity
- [ ] Incident entity
- [ ] User value objects

**Tests unitaires (test/domain/):**
- [ ] Règles métier (validations)
- [ ] Cycles de vie entités

### 3️⃣ Implémenter les Cas d'Usage

**Application (application/handlers/):**
- [ ] CreateReservationHandler
- [ ] CheckinLocationHandler
- [ ] CheckoutLocationHandler
- [ ] ReportIncidentHandler

### 4️⃣ Implémenter Worker Jobs

**Worker (src/main.rs):**
- [x] GenerateRentalContractPdf
- [x] ProcessCheckinPhotos
- [x] ValidateDocument
- [x] SendEmail

### 5️⃣ Implémenter Frontend

**Pages:**
- [ ] Home / Dashboard
- [ ] Motos List
- [ ] Moto Details
- [ ] Reservation Form
- [ ] My Reservations

### 6️⃣ Implémenter la Gestion des Versions

**API Versioning:**
- [ ] Routes v1 complètes
- [ ] Routes v2 avec breaking change
- [ ] Feature flags
- [ ] Tests de rétrocompatibilité

## 📊 Checklist Projet

### Backend
- [ ] Domain entities (100% testées)
- [ ] Application handlers (100% testées)
- [ ] Infrastructure repositories
- [ ] API routes v1 + v2
- [ ] Middleware auth
- [ ] Error handling
- [ ] Logging + correlation ID
- [ ] Database migrations
- [ ] Docker image

### Worker
- [x] Job handlers
- [x] Queue consumer/producer
- [x] Retry policy
- [x] Dead letter queue
- [x] Observability
- [ ] Docker image

### Frontend
- [ ] Components
- [ ] Pages
- [ ] API client isolation
- [ ] Auth flow (Keycloak)
- [ ] Error handling
- [ ] Responsive design

### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker Hub push
- [ ] IaC (Bicep/Terraform)
- [ ] Cloud deployment
- [ ] Monitoring

### Documentation
- [ ] ADRs (Architecture Decision Records)
- [ ] API docs
- [ ] Deployment guide
- [ ] Contributing guide

## 🔄 Git Workflow

**Branches:**
```
main (production)
  ↓
develop (staging)
  ↓
feature/reservation-system
feature/worker-jobs
feature/api-versioning
```

**Commits:**
```
feat(backend): implement reservation entity
test(domain): add reservation validation tests
docs(adr): add api versioning decision
```

## 📞 Support

- 📖 Architecture: [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)
- 🔧 Backend: [backend/README.md](backend/README.md)
- ⚙️ Worker: [worker/README.md](worker/README.md)
- 🎨 Frontend: [frontend/README.md](frontend/README.md)
- 🚀 Deployment: [infrastructure/README.md](infrastructure/README.md)
