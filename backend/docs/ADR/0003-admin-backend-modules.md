# ADR 0003: Backend des modules du panel admin (Reservations, Customers, Maintenance, Payments, Settings, Dashboard, Auth)

**Date** : 2026-07-09
**Statut** : Accepté

## Contexte

Le panel admin (`admin/`) appelle 26 endpoints métier qui n'existaient pas côté backend (seuls `motos`/`brands`/`shops` étaient implémentés). Plusieurs décisions de modélisation et d'architecture ont dû être tranchées pour construire ces modules en suivant le pattern DDD existant (`domain/usecases` → Result → `presentation` → `infrastructure/db`).

## Décisions

### 1. Extension des modèles existants plutôt que de nouvelles tables parallèles
- **`User` → Customer** : ajout de `firstName`, `lastName`, `phone`, `licenseNumber`, `licenseVerified`, `status` sur le modèle `User` existant, plutôt qu'une table `Customer` séparée. `User` est déjà lié à `Booking.userId` ; dupliquer aurait cassé cette relation et introduit un problème de synchronisation avec Keycloak. Le champ `password` legacy n'est pas utilisé par le domaine (Keycloak reste l'unique IAM) — une valeur aléatoire y est écrite à la création pour satisfaire la contrainte `NOT NULL`.
- **`Booking` → Reservation** : ajout de `status`, `paymentStatus`, `totalAmount`, `depositAmount` sur `Booking` plutôt qu'une nouvelle table `Reservation`. Le modèle représentait déjà une réservation ; le nom de table (`bookings`) n'est pas exposé à l'API.

### 2. Contrat Moto revu : noms plutôt qu'IDs, specs techniques optionnelles
Le formulaire admin envoie `brand`/`category`/`status` en texte libre (pas de sélection d'ID) et n'a pas de champs `serialNumber`/`style`/`hp`/`torque`/`consumption`/`range`. Le contrat `POST/PUT /motos` accepte désormais ces noms et upsert `Brand`/`Category`/`Status` par nom (même pattern que `prisma/seed.ts`). Les champs techniques deviennent optionnels en base (`NULL` autorisé). Colonnes ajoutées : `deposit`, `location`, `next_service_date`. Une migration de données renomme les statuts moto seedés `PUBLISHED` → `available` pour correspondre à l'enum du front.

### 3. `Payment` créé en effet de bord par `CreateReservationUseCase`
Le front n'appelle jamais `POST /payments` — seuls `GET /payments` et `POST /payments/:id/refund` existent côté UI. `CreateReservationUseCase` reçoit donc à la fois `IReservationRepository` et `IPaymentRepository`, et crée un `Payment` lié (`status` aligné sur `paymentStatus` de la réservation) immédiatement après la réservation. `RefundReservationUseCase` répercute le remboursement sur le `Payment` lié via `findByBookingId`.

### 4. `Setting` — table clé/valeur générique (JSON)
Plutôt que trois tables dédiées (`booking_rules`, `company_info`, `preferences`), un unique modèle `Setting { key, value: Json, updatedAt }` stocke les trois blobs de configuration. Plus simple à faire évoluer (ajout d'une nouvelle clé = aucune migration), au prix d'une perte de validation au niveau schéma DB (compensée par la validation Joi + les usecases `Put*`/`Patch*`). Seedé avec les valeurs par défaut actuellement hardcodées côté front.

### 5. `GET /reservations` sert deux shapes différentes selon le consommateur
La page Reservations (`?page&limit`) attend une liste imbriquée (`moto`/`customer` en objets), le Dashboard (`?limit=5&sort=-createdAt`) attend une liste aplatie avec des champs calculés (`period`, `days`, `amount` formaté, `status` réduit à 4 valeurs). Plutôt que de modifier le front ou de dupliquer la route, `GetReservationsController` bascule sur la présence du paramètre `sort` pour choisir la shape de réponse — documenté en commentaire dans le contrôleur pour ne pas surprendre un futur lecteur.

### 6. Réservation liée à un `Shop` par défaut, invisible du panel admin
`Booking.shopId` reste `NOT NULL` (intégrité conservée), mais le panel admin n'a aucune notion de "shop". `PrismaReservationRepository` résout un shop par défaut (`findFirst`, ou création d'un shop "Plein Gaz Loc" si aucun n'existe) plutôt que d'exposer ce concept dans l'API admin ou de rendre la colonne nullable.

### 7. `POST /auth/forgot-password` — proxy vers l'API Admin Keycloak
Le backend n'a ni `bcrypt` ni `nodemailer`, et `backend/CLAUDE.md` établit que Keycloak est l'unique IAM. `KeycloakAdminClient` (`infrastructure/external/`) obtient un token via `client_credentials`, recherche l'utilisateur par email dans Keycloak et déclenche son flux natif `UPDATE_PASSWORD` (execute-actions-email). Aucun token de reset n'est géré côté backend. La route est ajoutée à `PUBLIC_PATHS` de `AuthMiddleware` (un utilisateur qui a oublié son mot de passe n'est pas authentifié). La réponse est volontairement identique que l'email existe ou non (anti user-enumeration) — toute erreur IAM est avalée silencieusement dans `ForgotPasswordUseCase`.

## Conséquences

**Positif :**
- Aucune nouvelle table dupliquant `User`/`Booking` ; les relations existantes (`Booking.userId`, `Booking.motoId`) restent valides.
- Le contrat `/motos` correspond enfin à ce que le formulaire admin envoie réellement (auparavant, Create/Edit échouaient en 400 contre le vrai backend).
- Pas de nouvelle dépendance externe (pas de bcrypt/nodemailer/lib de dates ajoutée).

**Négatif :**
- Le concept "Shop" existe en base mais n'est piloté par aucune UI admin — une évolution future devra soit l'exposer, soit le retirer explicitement du schéma.
- `Setting` en JSON perd la validation de schéma DB native ; toute anomalie de forme n'est détectée qu'au niveau applicatif.
- Les motos créées avant cette migration (`status = "PUBLISHED"`) ont été renommées en `"available"` par une migration de données — à surveiller si un autre système lisait cette valeur telle quelle.
