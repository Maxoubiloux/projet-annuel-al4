# Audit d'implémentation — Admin Backoffice

> Généré le 2026-07-01. Mis à jour le 2026-07-03 (25 items frontend). Mis à jour le 2026-07-03 — 5 items supplémentaires (CUS-04, MOTO-06, DASH-02, ConfirmDialogs, ForgotPassword).

---

## Résumé exécutif

L'interface d'administration est un prototype fonctionnel visuellement soigné, mais **100 % déconnecté de tout backend réel**. Aucune page ne fait d'appels API. Toutes les données sont mockées en dur. Le système d'authentification accepte n'importe quel identifiant. Au total, **47 problèmes** ont été identifiés, répartis en **14 bloquants**, **22 importants** et **11 améliorations**.

**État au 2026-07-03** : La couche interface a été complétée. **25 items frontend** ont été implémentés : tri, pagination, filtres locaux, menus contextuels, modales de détail, checkboxes + sélection multiple, menu utilisateur avec déconnexion, persistance localStorage, toggles Settings, export CSV Payments, date dynamique Dashboard, lien React Router. Les **22 items restants** nécessitent le backend (API, CRUD réels, authentification JWT, données serveur).

---

## Checklist globale

| Catégorie | Problèmes | Bloquant | Important | Amélioration |
|---|---|---|---|---|
| Authentification | 3 | 2 | 1 | 0 |
| Dashboard | 7 | 1 | 3 | 3 |
| Fleet (Motos) | 8 | 2 | 4 | 2 |
| Reservations | 7 | 2 | 3 | 2 |
| Customers | 5 | 2 | 2 | 1 |
| Maintenance | 5 | 2 | 2 | 1 |
| Payments | 5 | 2 | 2 | 1 |
| Settings | 4 | 1 | 3 | 0 |
| Layout/Navigation | 3 | 0 | 2 | 1 |
| **Total** | **47** | **14** | **22** | **11** |

---

## Module 1 : Authentification (`src/core/auth/`, `src/domains/auth/`)

### Problèmes identifiés

**MOTO-AUTH-01** — Gravité : **bloquant** — Type : API / sécurité
- Fichier : `src/core/auth/AuthContext.tsx`, lignes 37–45
- Description : La fonction `login()` ignore complètement le mot de passe. Elle crée un mock user avec `id: '1'`, `name: 'Admin System'` sans jamais valider les credentials. N'importe quel email + n'importe quel mot de passe permet de se connecter.
- Comportement attendu : Appel `POST /api/auth/login` avec `{ email, password }`, récupération d'un JWT ou session token, stockage sécurisé.
- Correction proposée : Remplacer la fonction `login()` par un appel fetch/axios vers l'endpoint d'authentification du backend, gérer les erreurs 401, stocker le token en `httpOnly cookie` ou `localStorage` selon la politique de sécurité.

**MOTO-AUTH-02** — Gravité : **bloquant** — Type : sécurité / persistance
- Fichier : `src/core/auth/AuthContext.tsx`, ligne 45
- Description : L'objet `User` complet (avec id, email, rôle) est sérialisé directement dans `localStorage` sans token. Cela est manipulable côté client — n'importe qui peut passer `role: 'admin'` en modifiant le localStorage.
- Comportement attendu : Stocker uniquement un opaque token JWT, et valider le rôle côté serveur à chaque requête.
- Correction proposée : Stocker un JWT opaque, décoder côté client uniquement pour l'affichage (non pour l'autorisation), et valider toutes les requêtes via un middleware backend.

**MOTO-AUTH-03** ✅ — Gravité : **important** — Type : UX / feedback
- Fichier : `src/domains/auth/pages/LoginPage.tsx`, ligne 89
- Description : La page de login affiche explicitement `"Tout email / mot de passe fonctionne pour cette démo."` — texte de placeholder qui ne doit jamais arriver en production.
- Comportement attendu : Message supprimé ou remplacé par un lien "Mot de passe oublié ?".
- **Correction appliquée** : Texte supprimé, remplacé par un lien "Mot de passe oublié ?".

---

## Module 2 : Dashboard (`src/domains/dashboard/pages/DashboardPage.tsx`)

### Problèmes identifiés

**DASH-01** — Gravité : **bloquant** — Type : données mockées / API
- Fichier : `src/domains/dashboard/pages/DashboardPage.tsx`, lignes 13–49
- Description : Toutes les données du dashboard sont hardcodées : `revenueData`, `barsData`, `reservations`, `alerts`, `yardTiles`, `occupancy`. Les KPIs (87.4%, 142, €90.2k, 7) sont des valeurs fixes. Le texte "Sat, 21 Jun 2026" à la ligne 143 est une date en dur.
- Comportement attendu : Données chargées via `GET /api/dashboard/stats`, avec états loading/error.
- Correction proposée : Créer un hook `useDashboardStats()` qui fetch les données et expose `{ data, isLoading, error }`, remplacer toutes les constantes hardcodées.

**DASH-02** ✅ — Gravité : **important** — Type : bouton sans action
- Fichier : `src/domains/dashboard/pages/DashboardPage.tsx`, lignes 166–175
- Description : Le bouton "Export" (avec icône `Download`) n'a aucun handler `onClick`. Cliquer dessus ne fait rien.
- Comportement attendu : Déclenche le téléchargement d'un rapport CSV/PDF des données du dashboard.
- **Correction appliquée** : Fonction `exportDashboard()` ajoutée — génère un CSV client-side avec KPIs, réservations récentes et alertes maintenance. Nommé `dashboard-YYYY-MM-DD.csv`.

**DASH-03** ✅ — Gravité : **important** — Type : navigation / lien
- Fichier : `src/domains/dashboard/pages/DashboardPage.tsx`, ligne 303
- Description : Le lien "View all" du tableau "Recent reservations" utilise `<a href="/reservations">` — un `<a>` natif provoque un rechargement de page complet dans une SPA React Router.
- Comportement attendu : Utiliser `<Link to="/reservations">` de React Router pour une navigation interne sans rechargement.
- **Correction appliquée** : Remplacé par `<Link to="/reservations">` de `react-router-dom`.

**DASH-04** — Gravité : **important** — Type : état vide / loading
- Fichier : `src/domains/dashboard/pages/DashboardPage.tsx` (entier)
- Description : Aucun état de chargement n'est géré. Le dashboard affiche immédiatement les données mockées sans jamais montrer un skeleton/spinner pendant le fetch réel.
- Comportement attendu : État `isLoading` avec skeletons sur les KPI cards, le graphique et les tableaux.
- Correction proposée : Ajouter un composant skeleton pour chaque section principale, conditionné sur `isLoading`.

**DASH-05** ✅ — Gravité : **amélioration** — Type : date hardcodée
- Fichier : `src/domains/dashboard/pages/DashboardPage.tsx`, ligne 143
- Description : La date `"Sat, 21 Jun 2026"` est hardcodée en dur au lieu d'être calculée dynamiquement.
- Comportement attendu : Afficher `new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })`.
- **Correction appliquée** : Date calculée dynamiquement avec `new Date().toLocaleDateString(…)`.

**DASH-06** — Gravité : **amélioration** — Type : pane non connecté
- Fichier : `src/domains/dashboard/pages/DashboardPage.tsx`, lignes 37–48
- Description : Le "Yard view" affiche une carte de bays et un timeline d'occupation entièrement calculés à partir d'un array hardcodé (`seed`) et de positions CSS en dur. Aucune corrélation avec les vraies motos ou réservations.
- Comportement attendu : Données calculées dynamiquement à partir du statut réel des motos et des réservations actuelles.
- Correction proposée : Mapper les motos réelles sur les bays, calculer les timelines à partir des `startDate`/`endDate` des réservations.

**DASH-07** — Gravité : **amélioration** — Type : KPI non réactifs
- Fichier : `src/domains/dashboard/pages/DashboardPage.tsx`, lignes 100–125
- Description : Les compteurs KPI sidebar contiennent des sous-textes hardcodés comme "142 / 163 on road", "38 due back today", "6 overdue", "€3.0k/day avg", "fcst €112k". Ces valeurs ne sont pas calculées.
- Comportement attendu : Valeurs dérivées des données réelles de la flotte et des réservations.
- Correction proposée : Dériver ces métriques depuis des fonctions de calcul sur les données réelles.

---

## Module 3 : Fleet — Motos (`src/domains/motos/pages/MotoListPage.tsx`)

### Problèmes identifiés

**MOTO-01** — Gravité : **bloquant** — Type : données mockées / API
- Fichier : `src/mocks/motos.ts` + `src/domains/motos/pages/MotoListPage.tsx`, ligne 3
- Description : Toute la liste des motos est chargée depuis `MOTOS_MOCK` (5 motos hardcodées). L'UI prétend afficher "163 motorcycles" (tabs hardcodés) alors qu'il n'y en a que 5 dans les données.
- Comportement attendu : Fetch `GET /api/motos` avec pagination, les compteurs de tabs calculés dynamiquement.
- Correction proposée : Créer un hook `useMotos()`, remplacer l'import du mock par l'appel API, calculer les `count` depuis les données réelles.

**MOTO-02** — Gravité : **bloquant** — Type : bouton sans action / CRUD
- Fichier : `src/domains/motos/pages/MotoListPage.tsx`, lignes 75–82
- Description : Le bouton "Add motorcycle" (`<Plus />`) n'a pas de handler `onClick`. Aucune modale, drawer ou navigation vers un formulaire de création n'est déclenché.
- Comportement attendu : Ouverture d'une modale ou navigation vers `/motos/new` avec un formulaire de création.
- Correction proposée : Ajouter `onClick={() => setCreateOpen(true)}` et implémenter un `CreateMotoModal` avec le formulaire et l'appel `POST /api/motos`.

**MOTO-03** ✅ — Gravité : **important** — Type : bouton sans action
- Fichier : `src/domains/motos/pages/MotoListPage.tsx`, lignes 68–74
- Description : Le bouton "Filters" (`<SlidersHorizontal />`) n'a pas de handler `onClick`. Aucun panneau de filtres n'est implémenté.
- Comportement attendu : Ouverture d'un drawer ou d'un popover avec filtres par statut, catégorie, localisation, plage de prix.
- **Correction appliquée** : Panneau de filtres togglable avec filtre par catégorie + onglets statut. Filtre localisation/prix à ajouter avec API.

**MOTO-04** ✅ — Gravité : **important** — Type : bouton sans action
- Fichier : `src/domains/motos/pages/MotoListPage.tsx`, lignes 117–124
- Description : Le bouton "Sort" (`<ArrowUpDown />`) n'a pas de handler `onClick`. Le tri des colonnes n'est pas implémenté.
- Comportement attendu : Menu déroulant avec options de tri (marque, kilométrage, prix, statut) ou tri au clic sur les en-têtes de colonnes.
- **Correction appliquée** : Tri asc/desc au clic sur les en-têtes Motorcycle, Status, Mileage, Rate avec indicateur visuel.

**MOTO-05** ✅ — Gravité : **important** — Type : bouton sans action / CRUD
- Fichier : `src/domains/motos/pages/MotoListPage.tsx`, lignes 186–191
- Description : Le bouton action `<Ellipsis />` en fin de chaque ligne n'a aucun handler. Aucun menu contextuel (voir, éditer, changer de statut, supprimer) n'est implémenté.
- Comportement attendu : Dropdown menu avec options : "View details", "Edit", "Change status", "Delete" (avec confirmation).
- **Correction appliquée** : `RowActionsMenu` dropdown avec View/Edit/Change status/Delete. Actions CRUD à brancher sur `POST|PATCH|DELETE /api/motos/:id`.

**MOTO-06** ✅ — Gravité : **important** — Type : données manquantes
- Fichier : `src/domains/motos/pages/MotoListPage.tsx`, lignes 183–184
- Description : Les colonnes "Next service" et "Location" affichent systématiquement `—` (tiret). La donnée `location` est présente dans le type `Moto` et dans les mocks, mais n'est pas affichée. `nextService` n'existe pas dans le type.
- Comportement attendu : Afficher `moto.location` dans la colonne Location, et soit calculer la prochaine date de service soit l'ajouter au type `Moto`.
- **Correction appliquée** : `moto.location` affiché. Colonne "Next service" conserve `—` en attendant l'ajout de `nextServiceDate` au type + API.

**MOTO-07** ✅ — Gravité : **important** — Type : checkbox sans état
- Fichier : `src/domains/motos/pages/MotoListPage.tsx`, lignes 138 et 163
- Description : Les checkboxes (en-tête et par ligne) ne sont pas contrôlées. Il n'y a pas d'état de sélection, pas de "select all", pas d'action en lot (bulk action).
- Comportement attendu : État de sélection multiple avec compteur, et actions groupées (changer de statut, exporter, supprimer).
- **Correction appliquée** : État `selectedIds: Set<string>`, select-all avec état indéterminé, surlignage des lignes sélectionnées, barre bulk actions. Actions groupées à brancher sur API.

**MOTO-08** ✅ — Gravité : **amélioration** — Type : pagination absente
- Fichier : `src/domains/motos/pages/MotoListPage.tsx`
- Description : Aucune pagination. Avec 163 motos annoncées, tout afficher en une seule liste est impraticable.
- Comportement attendu : Pagination (page/curseur) ou infinite scroll, avec sélecteur du nombre d'items par page.
- **Correction appliquée** : Pagination prev/next avec compteur "X–Y of Z", PAGE_SIZE = 10.

---

## Module 4 : Réservations (`src/domains/reservations/pages/ReservationListPage.tsx`)

### Problèmes identifiés

**RES-01** — Gravité : **bloquant** — Type : données mockées / API
- Fichier : `src/mocks/reservations.ts` + `src/domains/reservations/pages/ReservationListPage.tsx`, ligne 4
- Description : Seulement 4 réservations hardcodées. L'UI affiche "12 pending action" hardcodé à la ligne 67 sans lien avec les données réelles.
- Comportement attendu : Fetch `GET /api/reservations` avec filtres, pagination, le badge "12 pending" calculé depuis `rows.filter(r => r.status === 'pending').length`.
- Correction proposée : Créer un hook `useReservations()`, supprimer la dépendance aux mocks, calculer dynamiquement le badge.

**RES-02** — Gravité : **bloquant** — Type : bouton sans action / CRUD
- Fichier : `src/domains/reservations/pages/ReservationListPage.tsx`, lignes 77–83
- Description : Le bouton "New reservation" n'a aucun handler `onClick`. Pas de formulaire de création implémenté.
- Comportement attendu : Ouverture d'une modale de création de réservation avec choix du client, de la moto, des dates, calcul automatique du montant.
- Correction proposée : Ajouter `onClick={() => setCreateOpen(true)}` et implémenter un `CreateReservationModal`.

**RES-03** — Gravité : **important** — Type : bouton sans action
- Fichier : `src/domains/reservations/pages/ReservationListPage.tsx`, lignes 70–76
- Description : Le bouton "Filters" n'a aucun handler. Pas de filtre par statut, date, montant implémenté.
- Comportement attendu : Drawer ou popover de filtres avec critères : statut de réservation, statut de paiement, plage de dates, montant.
- Correction proposée : Implémenter un composant `ReservationFilters` avec les états de filtre correspondants.

**RES-04** ✅ — Gravité : **important** — Type : bouton sans action / CRUD
- Fichier : `src/domains/reservations/pages/ReservationListPage.tsx`, lignes 165–170
- Description : Les boutons `<Eye />` (voir détail) et `<Ellipsis />` (actions) n'ont aucun handler. Aucun détail de réservation ni action (confirmer, annuler, rembourser) ne sont accessibles.
- Comportement attendu : `<Eye>` → modale ou page de détail. `<Ellipsis>` → menu avec "Confirm", "Cancel", "Refund".
- **Correction appliquée** : `ReservationDetailModal` complet (client, moto, dates, montants, statuts). Menu Ellipsis avec Confirm/Cancel/Refund. Appels API à brancher.

**RES-05** ✅ — Gravité : **important** — Type : fonctionnalité absente
- Fichier : `src/domains/reservations/pages/ReservationListPage.tsx`
- Description : Pas de filtre par onglet de statut (contrairement à la page Fleet). Le statut "pending" visible dans la sidebar badge (12) n'a pas de raccourci pour filtrer ces réservations.
- Comportement attendu : Onglets de filtres rapides par statut : Pending / Confirmed / Active / Completed / Cancelled.
- **Correction appliquée** : Tabs All / Pending / Confirmed / Active / Done / Cancelled avec compteurs dynamiques.

**RES-06** ✅ — Gravité : **amélioration** — Type : tri absent
- Fichier : `src/domains/reservations/pages/ReservationListPage.tsx`
- Description : Pas de tri sur les colonnes (date, montant, statut). Les en-têtes ne sont pas cliquables.
- Comportement attendu : En-têtes cliquables avec indicateur de tri asc/desc.
- **Correction appliquée** : Tri asc/desc sur Dates, Amount, Status avec indicateur visuel.

**RES-07** ✅ — Gravité : **amélioration** — Type : pagination absente
- Fichier : `src/domains/reservations/pages/ReservationListPage.tsx`
- Description : Aucune pagination. L'UI annonce "N bookings" mais tout est affiché sans limite.
- Comportement attendu : Pagination avec sélecteur de taille de page.
- **Correction appliquée** : Pagination prev/next avec compteur, PAGE_SIZE = 10.

---

## Module 5 : Clients (`src/domains/customers/pages/CustomerListPage.tsx`)

### Problèmes identifiés

**CUS-01** — Gravité : **bloquant** — Type : données mockées / API
- Fichier : `src/mocks/reservations.ts` + `src/domains/customers/pages/CustomerListPage.tsx`, ligne 3
- Description : Seulement 3 clients hardcodés dans `CUSTOMERS_MOCK`. Un vrai système en a potentiellement des milliers.
- Comportement attendu : Fetch `GET /api/customers` avec pagination et search server-side.
- Correction proposée : Créer un hook `useCustomers()`.

**CUS-02** — Gravité : **bloquant** — Type : bouton sans action / CRUD
- Fichier : `src/domains/customers/pages/CustomerListPage.tsx`, lignes 29–35
- Description : Le bouton "New customer" n'a aucun handler. Pas de formulaire de création de client.
- Comportement attendu : Ouverture d'une modale avec formulaire : prénom, nom, email, téléphone, numéro de permis, upload document.
- Correction proposée : Ajouter `onClick={() => setCreateOpen(true)}` et un `CreateCustomerModal`.

**CUS-03** ✅ — Gravité : **important** — Type : bouton sans action / CRUD
- Fichier : `src/domains/customers/pages/CustomerListPage.tsx`, lignes 156–161
- Description : Le bouton `<Ellipsis />` de chaque ligne client n'a aucun handler. Pas de menu : voir le profil complet, éditer, suspendre/réactiver, voir les réservations du client.
- Comportement attendu : Menu contextuel avec actions : "View profile", "Edit", "Suspend / Reactivate", "View bookings".
- **Correction appliquée** : `CustomerActionsMenu` dropdown avec View profile / Edit / View bookings / Suspend · Reactivate. Appels API à brancher.

**CUS-04** ✅ — Gravité : **important** — Type : données incomplètes
- Fichier : `src/domains/customers/pages/CustomerListPage.tsx` et `src/domains/reservations/types.ts`
- Description : Le type `Customer` ne contient pas : date d'inscription, nombre de réservations, montant total dépensé, notes. La colonne "Status" n'affiche que Active/Suspended sans possibilité de changer le statut depuis la liste.
- Comportement attendu : Afficher le nombre de réservations passées et le chiffre d'affaires par client.
- **Correction appliquée** : Type `Customer` enrichi avec `totalRentals?`, `totalSpent?`, `createdAt?`. Mocks mis à jour. Affichage `X rentals · €Y` dans la cellule customer de la table.

**CUS-05** ✅ — Gravité : **amélioration** — Type : filtres absents
- Fichier : `src/domains/customers/pages/CustomerListPage.tsx`
- Description : Pas de filtre par statut (Active / Suspended), pas de filtre par statut du permis (Verified / Pending). Recherche uniquement sur prénom/nom/email.
- Comportement attendu : Filtres rapides par statut et par validation du permis.
- **Correction appliquée** : Chips de filtre "Status" (All / Active / Suspended) et "Licence" (All / Verified / Pending) fonctionnels en frontend.

---

## Module 6 : Maintenance (`src/domains/maintenance/pages/MaintenanceListPage.tsx`)

### Problèmes identifiés

**MAINT-01** — Gravité : **bloquant** — Type : données mockées / API
- Fichier : `src/domains/maintenance/pages/MaintenanceListPage.tsx`, lignes 3–11
- Description : 7 entrées de maintenance hardcodées directement dans le composant sous `MAINTENANCE`. Aucun fetch API.
- Comportement attendu : Fetch `GET /api/maintenance` avec filtres par statut et sévérité.
- Correction proposée : Déplacer les données dans `src/mocks/maintenance.ts`, puis créer un hook `useMaintenance()` pour le fetch réel.

**MAINT-02** — Gravité : **bloquant** — Type : bouton sans action / CRUD
- Fichier : `src/domains/maintenance/pages/MaintenanceListPage.tsx`, lignes 63–68
- Description : Le bouton "New job" (`<Plus />`) n'a aucun handler. Pas de formulaire de création d'ordre de maintenance.
- Comportement attendu : Formulaire de création : sélection de la moto, type d'intervention, date planifiée, coût estimé, technicien assigné.
- Correction proposée : Ajouter `onClick={() => setCreateOpen(true)}` et un `CreateMaintenanceJobModal`.

**MAINT-03** ✅ — Gravité : **important** — Type : bouton sans action / CRUD
- Fichier : `src/domains/maintenance/pages/MaintenanceListPage.tsx`, lignes 122–127
- Description : Le bouton "Details" de chaque ligne n'a aucun handler. Il est visuellement présent mais inactif.
- Comportement attendu : Ouverture d'une modale de détail permettant de voir l'historique, changer le statut (open → scheduled → completed), ajouter des notes, enregistrer le coût réel.
- **Correction appliquée** : `MaintenanceDetailModal` avec type, moto, date, coût, statut, champ notes. Bouton "Mark as done". Sauvegarde à brancher sur `PATCH /api/maintenance/:id`.

**MAINT-04** ✅ — Gravité : **important** — Type : filtres/tabs absents
- Fichier : `src/domains/maintenance/pages/MaintenanceListPage.tsx`
- Description : Pas de filtre par statut (Open / Scheduled / Completed) ni par sévérité (Critical / Warning / OK). Tout s'affiche en vrac.
- Comportement attendu : Tabs ou filtres rapides par statut, avec compteurs.
- **Correction appliquée** : Tabs All / Open / Scheduled / Done avec compteurs + chips sévérité Critical / Warning / OK.

**MAINT-05** — Gravité : **amélioration** — Type : données incomplètes
- Fichier : `src/domains/maintenance/pages/MaintenanceListPage.tsx`, lignes 3–11
- Description : Les données de maintenance n'ont pas de technicien assigné, pas de coût réel (vs estimé), pas d'historique des interventions sur la moto.
- Comportement attendu : Champs `assignedTo`, `actualCost`, `notes`, `completedAt` dans le modèle.
- Correction proposée : Enrichir le type de maintenance, mettre à jour le mock et la table.

---

## Module 7 : Paiements (`src/domains/payments/pages/PaymentListPage.tsx`)

### Problèmes identifiés

**PAY-01** — Gravité : **bloquant** — Type : données mockées / API
- Fichier : `src/domains/payments/pages/PaymentListPage.tsx`, lignes 3–11
- Description : 7 paiements hardcodés dans `PAYMENTS_MOCK` directement dans le fichier du composant. Aucun fetch. Les Summary Cards calculent des totaux sur ces 7 lignes uniquement.
- Comportement attendu : Fetch `GET /api/payments` avec filtres, pagination, agrégats serveur pour les totaux.
- Correction proposée : Créer un hook `usePayments()`, déplacer le mock dans `src/mocks/payments.ts`.

**PAY-02** ✅ — Gravité : **bloquant** — Type : bouton sans action
- Fichier : `src/domains/payments/pages/PaymentListPage.tsx`, lignes 53–60
- Description : Le bouton "Export CSV" (`<Download />`) n'a aucun handler. Rien ne se télécharge au clic.
- Comportement attendu : Déclenchement d'un export CSV de tous les paiements (filtrés ou non), soit via l'API (`GET /api/payments/export`), soit via génération client-side.
- **Correction appliquée** : Export CSV client-side sur les données filtrées actives (Blob + URL.createObjectURL), nommé `payments-YYYY-MM-DD.csv`.

**PAY-03** ✅ — Gravité : **important** — Type : actions sur lignes absentes
- Fichier : `src/domains/payments/pages/PaymentListPage.tsx`
- Description : Aucune colonne d'action sur les lignes de paiement. Impossible de voir le détail d'une transaction, initier un remboursement, ou télécharger une facture.
- Comportement attendu : Colonne actions avec "View receipt", "Refund" (avec confirmation), "Download invoice".
- **Correction appliquée** : Colonne Ellipsis avec menu View receipt / Download invoice / Refund. Refund à brancher sur `POST /api/payments/:id/refund`.

**PAY-04** ✅ — Gravité : **important** — Type : filtres absents
- Fichier : `src/domains/payments/pages/PaymentListPage.tsx`
- Description : Pas de recherche, pas de filtre par statut (paid/pending/refunded), pas de filtre par date ou méthode de paiement.
- Comportement attendu : Barre de recherche + filtre par statut + sélecteur de plage de dates.
- **Correction appliquée** : Barre de recherche (ref/customer) + chips statut All / Paid / Pending / Refunded / Failed fonctionnels.

**PAY-05** — Gravité : **amélioration** — Type : données incomplètes
- Fichier : `src/domains/payments/pages/PaymentListPage.tsx`, lignes 3–11
- Description : Les paiements ne contiennent pas de lien vers la moto, pas de numéro de transaction externe, pas de provider de paiement (Stripe, PayPal, etc.).
- Comportement attendu : Champs `transactionId`, `provider`, `motoId` dans le modèle.
- Correction proposée : Enrichir le type de paiement.

---

## Module 8 : Paramètres (`src/domains/settings/pages/SettingsPage.tsx`)

### Problèmes identifiés

**SETT-01** — Gravité : **bloquant** — Type : formulaire non connecté / API
- Fichier : `src/domains/settings/pages/SettingsPage.tsx`, lignes 92 et 113
- Description : Les boutons "Save rules" et "Save company info" n'ont aucun handler `onClick`. Les inputs utilisent `defaultValue` (non contrôlés) — leurs valeurs ne peuvent pas être lues pour être envoyées. Aucun `onSubmit` n'est implémenté.
- Comportement attendu : Valeurs gérées par `useState` ou `useForm`, appel `PUT /api/settings` au clic sur Save, feedback de succès/erreur.
- Correction proposée : Transformer les inputs `defaultValue` en `value` contrôlés, ajouter les handlers Save avec appel API et toast de confirmation.

**SETT-02** ✅ — Gravité : **important** — Type : toggles non fonctionnels
- Fichier : `src/domains/settings/pages/SettingsPage.tsx`, lignes 140–142
- Description : Les toggles "Compact sidebar" et "Email notifications" reçoivent `on={false}` et `on={true}` en props statiques. Le composant `Toggle` n'expose aucun handler `onClick` — il ne peut pas changer d'état.
- Comportement attendu : Chaque toggle doit avoir un état local ou contextuel, et au changement appeler l'API pour persister la préférence.
- **Correction appliquée** : `Toggle` accepte `onChange: (v: boolean) => void`. Compact sidebar piloté par `useLayout` (persiste localStorage). Email notifications avec `useState` local. Dark mode connecté à `toggleTheme`. Persistance API à brancher.

**SETT-03** ✅ — Gravité : **important** — Type : préférences non persistées
- Fichier : `src/core/hooks/useLayout.tsx`, lignes 13–27
- Description : Les préférences de thème (`theme`) et de sidebar (`collapsed`) sont stockées uniquement en mémoire React (`useState`). Elles sont perdues à chaque rechargement de page.
- Comportement attendu : Persistance dans `localStorage` au moins, ou dans les préférences utilisateur via API.
- **Correction appliquée** : `theme` et `collapsed` initialisés depuis `localStorage` et persistés via `useEffect` à chaque changement.

**SETT-04** — Gravité : **important** — Type : sections manquantes
- Fichier : `src/domains/settings/pages/SettingsPage.tsx`
- Description : La page Settings ne couvre que 3 sections (booking rules, company info, appearance). Des sections critiques manquent : gestion des utilisateurs admin, API keys, webhooks, notifications email/SMS, politique de prix et caution.
- Comportement attendu : Sections complètes de configuration métier.
- Correction proposée : Ajouter des sections pour la gestion des accès admin, la configuration des intégrations et la politique tarifaire.

---

## Module 9 : Layout & Navigation (`src/core/layout/`)

### Problèmes identifiés

**NAV-01** — Gravité : **important** — Type : bouton sans action
- Fichier : `src/core/layout/Header.tsx`, lignes 82–90
- Description : Le bouton notifications (`<Bell />`) a un badge rouge visuel mais aucun handler `onClick`. Aucun panneau de notifications ne s'ouvre.
- Comportement attendu : Clic → dropdown ou drawer listant les alertes récentes (nouvelles réservations, maintenances dues, retards).
- Correction proposée : Ajouter un `NotificationsPanel` conditionnel sur un état `isOpen`.

**NAV-02** ✅ — Gravité : **important** — Type : bouton sans action / déconnexion
- Fichier : `src/core/layout/Header.tsx`, lignes 95–113
- Description : Le bouton "User" avec le chevron (`<ChevronDown />`) n'a aucun handler. Le menu utilisateur (profil, déconnexion) n'est pas implémenté. Il n'y a aucun moyen de se déconnecter depuis l'interface principale.
- Comportement attendu : Dropdown avec "View profile", "Settings" et "Sign out" (qui appelle `logout()` depuis `useAuth`).
- **Correction appliquée** : Dropdown avec nom/email de l'utilisateur, View profile, Settings (navigue vers `/settings`), Sign out (appelle `logout()` + redirige vers `/login`). Fermeture au clic extérieur.

**NAV-03** — Gravité : **amélioration** — Type : recherche globale non fonctionnelle
- Fichier : `src/core/layout/Header.tsx`, lignes 53–70
- Description : La barre de recherche globale ("Search bikes, customers, bookings… ⌘K") est purement décorative — c'est un `<span>`, pas un `<input>`. Aucune logique de recherche, aucun raccourci clavier ⌘K.
- Comportement attendu : Ouverture d'une palette de commande (command palette) au clic ou ⌘K, avec recherche globale cross-entités.
- Correction proposée : Implémenter une `CommandPalette` avec fuzzy search sur motos, clients, réservations, ou utiliser une bibliothèque comme `cmdk`.

---

## Quick wins (corrections rapides < 30 min)

| # | ID | Durée estimée | Description |
|---|---|---|---|
| 1 | MOTO-AUTH-03 | 2 min | Supprimer le texte "Tout email / mot de passe fonctionne" dans `LoginPage.tsx` L.89 |
| 2 | DASH-03 | 5 min | Remplacer `<a href="/reservations">` par `<Link to="/reservations">` |
| 3 | DASH-05 | 5 min | Dynamiser la date "Sat, 21 Jun 2026" avec `new Date().toLocaleDateString(...)` |
| 4 | MOTO-06 | 10 min | Afficher `moto.location` au lieu de `—` dans la colonne Location de Fleet |
| 5 | RES-01 (partiel) | 10 min | Calculer le badge "pending" dynamiquement : `rows.filter(r => r.status === 'pending').length` |
| 6 | SETT-03 | 15 min | Initialiser et persister `theme` dans `useLayout.tsx` via `localStorage` |
| 7 | NAV-02 | 20 min | Ajouter un handler sur le bouton User + implémentation `logout()` |
| 8 | SETT-02 | 20 min | Rendre les toggles Settings cliquables avec `useState` + `onChange` |

---

## À corriger par priorité

### Priorité 1 — Bloquant (avant toute mise en production)

1. **MOTO-AUTH-01** : Authentification réelle avec validation des credentials côté serveur (`POST /api/auth/login`)
2. **MOTO-AUTH-02** : Suppression du stockage de l'objet User entier en localStorage, remplacer par un JWT opaque
3. **SETT-01** : Formulaires Settings connectés à une API avec inputs contrôlés et feedback
4. **MOTO-01 / RES-01 / CUS-01 / MAINT-01 / PAY-01** : Remplacement de tous les mocks par des appels API réels
5. **MOTO-02 / RES-02 / CUS-02 / MAINT-02** : Boutons de création CRUD fonctionnels (formulaires + POST API)

### Priorité 2 — Important (avant la V1)

6. **MOTO-05 / RES-04 / CUS-03 / MAINT-03** : Menus d'actions contextuelles sur toutes les lignes de tables
7. **MOTO-03 / RES-03 / CUS-05 / MAINT-04 / PAY-04** : Filtres fonctionnels sur toutes les listes
8. **NAV-02** : Bouton déconnexion accessible depuis le header
9. **MOTO-07** : Checkboxes avec sélection multiple et actions groupées (bulk actions)
10. **SETT-02 / SETT-03** : Toggles Settings fonctionnels + persistance des préférences
11. **PAY-03** : Actions sur les lignes de paiement (remboursement, facture)
12. **DASH-04** : États loading/skeleton sur toutes les sections du dashboard

### Priorité 3 — Amélioration (V2)

13. **NAV-03** : Recherche globale / command palette (⌘K)
14. **MOTO-08 / RES-07** : Pagination sur toutes les listes
15. **DASH-06** : Données Yard view calculées dynamiquement depuis les réservations réelles
16. **RES-05** : Tabs de statut sur la page Réservations
17. **DASH-02** : Export Dashboard fonctionnel (CSV/PDF)
18. **PAY-02** : Export CSV Payments fonctionnel

---

## Checklist actionnable (pour corrections ultérieures)

### Authentification
- [ ] Implémenter `POST /api/auth/login` dans `AuthContext.tsx` (MOTO-AUTH-01)
- [ ] Stocker uniquement le JWT, pas l'objet User (MOTO-AUTH-02)
- [x] Supprimer le texte démo dans `LoginPage.tsx` L.89 (MOTO-AUTH-03) — remplacé par lien "Mot de passe oublié ?"
- [x] Ajouter une page de reset de mot de passe — `ForgotPasswordPage` avec formulaire email + état succès. Route `/forgot-password`. Lien mis à jour dans `LoginPage` (React Router `<Link>`).

### Connexion API — Data fetching
- [ ] Créer `src/hooks/useMotos()` → `GET /api/motos`
- [ ] Créer `src/hooks/useReservations()` → `GET /api/reservations`
- [ ] Créer `src/hooks/useCustomers()` → `GET /api/customers`
- [ ] Créer `src/hooks/useMaintenance()` → `GET /api/maintenance`
- [ ] Créer `src/hooks/usePayments()` → `GET /api/payments`
- [ ] Créer `src/hooks/useDashboardStats()` → `GET /api/dashboard/stats`
- [ ] Remplacer tous les imports de mocks par ces hooks

### Formulaires de création (CRUD)
- [ ] Implémenter `CreateMotoModal` + `POST /api/motos` (MOTO-02)
- [ ] Implémenter `CreateReservationModal` + `POST /api/reservations` (RES-02)
- [ ] Implémenter `CreateCustomerModal` + `POST /api/customers` (CUS-02)
- [ ] Implémenter `CreateMaintenanceJobModal` + `POST /api/maintenance` (MAINT-02)

### Actions contextuelles sur les lignes
- [x] Implémenter `RowActionsMenu` sur Fleet (voir, éditer, changer statut, supprimer) (MOTO-05) — dropdown frontend ; actions CRUD à brancher sur API
- [x] Implémenter `ReservationDetailModal` + menu actions (confirmer, annuler, rembourser) (RES-04) — modal détail + menu Ellipsis fonctionnels ; appels API à brancher
- [x] Implémenter `CustomerActionsMenu` (voir profil, éditer, suspendre, voir réservations) (CUS-03) — dropdown frontend ; actions à brancher sur API
- [x] Implémenter `MaintenanceDetailModal` (détail, changer statut, notes, coût réel) (MAINT-03) — modal avec champ notes ; sauvegarde à brancher sur API
- [x] Ajouter colonne actions sur Payments (voir reçu, rembourser, télécharger facture) (PAY-03) — colonne + dropdown ; refund à brancher sur API
- [x] Ajouter confirmation dialog avant toute action destructive (delete, cancel, refund) — composant `ConfirmDialog` réutilisable ; branché sur Delete (Fleet), Suspend/Reactivate (Customers), Cancel/Refund (Reservations), Refund (Payments)

### Filtres & recherche
- [x] Implémenter `FiltersPanel` sur Fleet (statut, catégorie, localisation, prix) (MOTO-03) — filtres statut (tabs) + catégorie (panel) fonctionnels
- [x] Implémenter filtres sur Reservations (statut, paiement, dates, montant) (RES-03) — filtrage statut via tabs ; filtres date/montant/paiement à compléter
- [x] Ajouter tabs de statut sur Reservations (RES-05)
- [x] Ajouter filtres sur Customers (statut, permis) (CUS-05) — chips statut + permis fonctionnels
- [x] Ajouter tabs/filtres sur Maintenance (statut, sévérité) (MAINT-04) — tabs statut + chips sévérité fonctionnels
- [x] Ajouter filtres sur Payments (statut, dates, méthode) (PAY-04) — recherche + chips statut fonctionnels ; filtre date/méthode à compléter

### Tri
- [x] Implémenter tri sur colonnes Fleet (MOTO-04) — tri asc/desc sur Motorcycle, Status, Mileage, Rate
- [x] Implémenter tri sur colonnes Reservations (RES-06) — tri asc/desc sur Dates, Amount, Status

### Pagination
- [x] Ajouter pagination sur Fleet (MOTO-08)
- [x] Ajouter pagination sur Reservations (RES-07)
- [x] Ajouter pagination sur Customers
- [x] Ajouter pagination sur Maintenance
- [x] Ajouter pagination sur Payments

### États loading/error/empty
- [ ] Ajouter skeletons loading sur le Dashboard (DASH-04)
- [ ] Ajouter états loading/error/empty sur toutes les listes
- [ ] Ajouter toasts/notifications de feedback après chaque action CRUD

### Navigation & Layout
- [x] Ajouter menu utilisateur + déconnexion dans `Header.tsx` (NAV-02) — dropdown avec View profile, Settings, Sign out
- [x] Implémenter `NotificationsPanel` sur l'icône Bell (NAV-01)
- [x] Implémenter `CommandPalette` (⌘K) pour la recherche globale (NAV-03)
- [x] Remplacer `<a href="/reservations">` par `<Link to>` (DASH-03)

### Settings
- [ ] Transformer les inputs Settings en controlled + connecter à l'API (SETT-01) — inputs contrôlés ✓ ; feedback visuel "Saved!" ✓ ; appel `PUT /api/settings` à brancher
- [x] Rendre les toggles Settings fonctionnels avec `useState` (SETT-02) — Compact sidebar, Email notifications et Dark mode sont cliquables et réactifs
- [x] Persister thème et sidebar dans `localStorage` via `useLayout.tsx` (SETT-03)
- [ ] Ajouter sections manquantes : users admin, API keys, webhooks, politique tarifaire (SETT-04)

### Corrections mineures
- [x] Dynamiser la date dans le Dashboard (DASH-05) — `new Date().toLocaleDateString('en-GB', …)`
- [x] Afficher `moto.location` dans la colonne Location de Fleet (MOTO-06)
- [x] Implémenter checkboxes de sélection multiple dans Fleet (MOTO-07) — select-all + barre bulk actions
- [x] Calculer le badge "pending" dynamiquement dans Reservations (RES-01 partiel)
- [x] Enrichir le type `Customer` avec `totalRentals`, `totalSpent`, `createdAt` (CUS-04) — champs optionnels, mocks mis à jour, affichés dans la table
- [x] Enrichir le type `Moto` avec `nextServiceDate` (MOTO-06) — champ optionnel, mocks mis à jour, affiché formaté dans la colonne "Next service"
- [x] Rendre le bouton "Export" Dashboard fonctionnel (DASH-02) — CSV client-side : KPIs + réservations + alertes
- [x] Rendre le bouton "Export CSV" Payments fonctionnel (PAY-02) — export CSV client-side sur données filtrées
