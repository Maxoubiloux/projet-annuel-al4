# Gestion des Breaking Changes

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
