# Gestion des Breaking Changes

## Journal des breaking changes

> Chaque rupture de compatibilité ascendante est consignée ici **avant merge**.
> Stratégie de versioning : voir ADR `docs/ADR/004-versioning-par-url-breaking-change.md`.

### [v2] 2026-07-24 — Prix moto en centimes entiers

**Route concernée** : `GET /api/v2/motos/:id` (nouvelle version de `GET /api/v1/motos/:id`)
**Type de changement** : Renommage + changement de type d'un champ de réponse
**Description** : Le champ `pricePerDay` (nombre flottant, en euros) est remplacé par
`dailyPriceCents` (entier, en centimes). Manipuler un entier en centimes évite les erreurs
d'arrondi en virgule flottante côté client. Le champ `pricePerDay` **n'existe plus** dans la
réponse v2 ; tous les autres champs sont inchangés.
**Exemple** :
```jsonc
// v1  →  GET /api/v1/motos/:id
{ "success": true, "data": { "id": "…", "pricePerDay": 49.9, /* … */ } }

// v2  →  GET /api/v2/motos/:id
{ "success": true, "data": { "id": "…", "dailyPriceCents": 4990, /* … */ } }
```
**Migration** : le frontend lit `data.dailyPriceCents` au lieu de `data.pricePerDay` et divise par
100 pour l'affichage en euros. Le basculement se fait via le flag `API_VERSION=v1|v2` (redéploiement
du frontend seul, sans toucher au backend).
**Ancienne version** : `v1` reste disponible et inchangée jusqu'à migration de tous les clients
(délai de transition indicatif : 3 mois).

---

## Procédure

Ce document décrit comment gérer les breaking changes dans notre API sans impacter le frontend.

### Stratégies Disponibles

#### 1. **Versionning par URL** (Principal)
```
GET /api/v1/motos/{id}     → Ancien format (deprecated, 3 mois)
GET /api/v2/motos/{id}     → Nouveau format
```

Avantages:
- Clair et simple
- Facile à router
- Cache HTTP cohérent

#### 2. **Versionning par Header** (Optionnel)
```
GET /api/motos/{id}
Accept-Version: 1.0        → Ancien format
Accept-Version: 2.0        → Nouveau format
```

#### 3. **Feature Flags** (Pour activations progressives)
```typescript
if (user.hasFeatureFlag('motos-v2-format')) {
  return newFormat(moto)
} else {
  return legacyFormat(moto)
}
```

### Processus de Migration

1. **Phase 1: Déployer nouvelle version**
   - Route v2 active
   - v1 toujours fonctionnelle
   - Backend compatible avec les deux

2. **Phase 2: Notifier clients**
   - Donner délai de transition (ex: 3 mois)
   - Documenter les changements
   - Support actif pour migration

3. **Phase 3: Dépréciation**
   - v1 retourne warning header: `Deprecation: true`
   - Logs sur utilisation v1
   - Toujours fonctionnel

4. **Phase 4: Shutdown**
   - Après deadline, v1 peut être retiré
   - Notification 1 mois avant

### Exemple Concret

**Breaking Change**: Format motos changé

```typescript
// v1: Format simple
GET /api/v1/motos/{id}
{
  "id": "moto-123",
  "brand": "Yamaha",
  "price": 50
}

// v2: Format enrichi avec métadonnées
GET /api/v2/motos/{id}
{
  "data": {
    "id": "moto-123",
    "brand": "Yamaha",
    "price": 50
  },
  "metadata": {
    "version": "2.0",
    "lastUpdated": "2026-01-29T10:00:00Z"
  }
}

// Backend gère les deux
const apiVersion = req.url.includes('/v2') ? '2' : '1'
if (apiVersion === '2') {
  return formatV2(moto)
} else {
  return formatV1(moto)
}
```

### Déploiement sans Redémarrage Frontend

Frontend v1 utilise `/api/v1/...` → fonctionne
Backend déploie `/api/v2/...` → disponible

Frontend peut être mis à jour indépendamment vers `/api/v2/...`

### À Éviter

- Changer la réponse sans versionning
- Retirer des champs sans avertissement
- Changer les codes HTTP pour une même action
- Ignorer la compatibilité rétroactive

### À Faire

- Versionner explicitement
- Donner délai de transition
- Maintenir v1 en parallèle
- Documenter tous les changements
- Tester les deux versions
