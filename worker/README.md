# Moto Rental Platform - Worker

Worker asynchrone écrit en **Rust** pour traitement des tâches asynchrones.

## 🎯 Responsabilités

- Génération de contrats PDF
- Validation et traitement de documents (permis, identité)
- Compression et normalisation de photos
- Envoi d'emails
- Gestion des retries avec politique exponential backoff

## 🚀 Démarrage

```bash
# Installation
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build
cargo build --release

# Run
cargo run

# Tests
cargo test
```

## 🔧 Configuration

Créer `.env` depuis `.env.example`

```bash
RABBITMQ_URL=amqp://guest:guest@localhost:5672
REQUEST_QUEUE=worker_requests
RESPONSE_QUEUE=worker_responses
LOG_LEVEL=debug
```

## 📦 Jobs Supportés

### 1. GenerateRentalContractPdf
Génère le PDF du contrat de location.

**Input:**
```json
{
  "location_id": "uuid",
  "snapshot": { ... }
}
```

**Output:**
```json
{
  "location_id": "uuid",
  "url": "s3://bucket/contracts/..."
}
```

**Retry Policy:** 3 tentatives (1s, 4s, 16s)

### 2. ProcessCheckinPhotos
Compresse et normalise les photos d'état des lieux.

**Retry Policy:** 2 tentatives

### 3. ValidateDocument
Valide les documents uploadés (OCR, format, signatures).

**Retry Policy:** 1 tentative → dead-letter si écec

### 4. SendEmail
Envoie des emails transactionnels.

**Retry Policy:** 5 tentatives (attente possible)

## 🐳 Docker

```bash
docker build -t moto-rental-worker:latest .
docker run -e RABBITMQ_URL=amqp://... moto-rental-worker:latest
```

## 📊 Observabilité

Logs structurés en JSON pour intégration avec système de logs centralisé :

```json
{
  "timestamp": "2026-01-29T10:30:00Z",
  "level": "INFO",
  "job_type": "GenerateRentalContractPdf",
  "location_id": "uuid",
  "correlation_id": "uuid",
  "duration_ms": 1234
}
```
