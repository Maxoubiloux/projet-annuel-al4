# Audit d'implémentation — Admin Panel

> **Date :** 2026-07-08 | **Branche :** feature/backend_backoffice | **Auditeur :** Claude Sonnet 5
>
> ⚠️ Cet audit **remplace** la version du 2026-07-07 (conservée dans `admin-implementation-audit_old.md`), devenue obsolète : les commits du 2026-07-08 (`feat(admin/motos|reservations|customers|maintenance|payments|settings|dashboard)…`) ont branché l'intégralité du CRUD sur une vraie API (client `api.ts`, hooks `useAsync`/`useFetch`, Zod, toasts, skeletons, error states). Cet audit part de zéro sur le code actuel et ne réutilise aucun constat de la version précédente sans le re-vérifier ligne à ligne.

---

## Résumé exécutif

| Métrique | Valeur |
|---|---|
| Pages structurellement présentes | 8/8 (100 %) |
| Infrastructure API (client, hooks, toasts, validation, error boundary) | ✅ en place et utilisée partout |
| CRUD réellement connecté au backend | Reservations 100 %, Maintenance ~95 %, Payments ~95 %, Customers ~90 %, Motos ~80 %, Settings — écriture OK mais **pas de lecture initiale** |
| **Problèmes bloquants** | **6** (dont 1 bug transversal touchant 5 pages) |
| **Problèmes importants** | **6** |
| **Améliorations** | **6** |

Le panel a fait un bond qualitatif majeur depuis le dernier audit : ce n'est plus une coquille UI-only. La quasi-totalité des flux CRUD (create/edit/delete/status-change) sur Reservations, Maintenance, Payments et Customers est câblée à de vraies routes API avec validation Zod, gestion de loading/error, et toasts de feedback. Les points restants sont plus ciblés :

1. **Un bug transversal de pagination** touche les 5 pages à liste paginée (Motos, Reservations, Customers, Maintenance, Payments) : la pagination est appliquée à la fois côté serveur (`page`/`limit` dans l'URL) et côté client (`.slice()` sur le tableau déjà limité par le serveur) → la page 2 et suivantes sont vides ou incorrectes, et les filtres/recherche/tri n'opèrent que sur les 10 lignes déjà reçues, pas sur l'ensemble des données.
2. Quelques actions restent des impasses UI explicites (delete Motos, "View details"/"Change status" Motos, "View profile"/"View bookings" Customers) — souvent avec un commentaire `TODO` qui documente déjà le manque.
3. Le panneau Settings écrit vers l'API mais ne lit jamais l'état existant au chargement (valeurs hardcodées en state initial).
4. Le `CommandPalette` (⌘K) et les notifications du Header utilisent encore des données mockées, alors que le reste de l'app est branché.

---

## Checklist globale

- [ ] Corriger le double-paginate (API + client) sur Motos, Reservations, Customers, Maintenance, Payments
- [ ] Brancher le `CommandPalette` (⌘K) sur les vraies données au lieu de `MOTOS_MOCK`/`CUSTOMERS_MOCK`/`RESERVATIONS_MOCK`
- [ ] Brancher les notifications du Header sur une vraie API (actuellement `MOCK_NOTIFS`, état non persisté)
- [ ] Implémenter `DELETE /api/motos/:id` (bouton présent, TODO explicite)
- [ ] Implémenter "View details" et "Change status" dans le menu ligne de Motos
- [ ] Implémenter les actions bulk (Motos) — actuellement seul "Clear selection" fonctionne
- [ ] Implémenter "View profile" / "View bookings" dans le menu ligne de Customers
- [ ] Faire un `GET /api/settings/rules` + `GET /api/settings/company` au montage de SettingsPage
- [ ] Brancher `ForgotPasswordPage` sur `POST /api/auth/forgot-password` (TODO explicite, aucun appel réseau)
- [ ] Dériver les badges de la Sidebar (163 / 12 / 7) de données réelles
- [ ] Nettoyer les composants UI inutilisés (`Badge`, `Card`, `Input`) ou les utiliser

---

## Module — Infrastructure transversale (Header, Sidebar, CommandPalette, api client)

### État : infrastructure solide, quelques résidus mockés

| # | Gravité | Type | Fichier / Lignes | Description | Comportement attendu | Correction |
|---|---|---|---|---|---|---|
| 1 | **Bloquant** | Pagination | `motos/pages/MotoListPage.tsx:93,134-135`, `reservations/pages/ReservationListPage.tsx:189,275-276`, `customers/pages/CustomerListPage.tsx:78,131-132`, `maintenance/pages/MaintenanceListPage.tsx:174,214-215`, `payments/pages/PaymentListPage.tsx:97,145-146` | Chaque page appelle son hook avec `{ page, limit: PAGE_SIZE }` — le serveur ne renvoie donc que 10 lignes — puis re-filtre/trie/`.slice()` **localement** sur ce tableau déjà limité pour re-paginer. Résultat : à partir de la page 2, `filtered.slice((page-1)*10, page*10)` est vide (le tableau source ne contient jamais plus de 10 éléments). Les compteurs d'onglets, la recherche et les filtres ne portent aussi que sur les 10 lignes déjà chargées, pas sur l'ensemble des données. `useFetch` capture pourtant `meta.total`/`meta.page` renvoyés par l'enveloppe API (`core/hooks/useFetch.ts:69`) mais **aucune page ne les utilise** (vérifié par grep, zéro consommateur). | Pagination server-side uniquement (utiliser `meta.total` pour calculer `totalPages`, ne plus re-slicer côté client), ou fetch complet + pagination 100 % client (choisir une seule stratégie et l'appliquer partout). | Retirer le second `.slice()`/`filtered.length` local ; utiliser `meta?.total` pour le total et laisser le tri/recherche/filtre soit être envoyés en query params au serveur, soit fetcher un `limit` élevé une fois. |
| 2 | **Important** | Recherche globale | `core/components/ui/CommandPalette.tsx:7-8, 60-102` | Le ⌘K importe encore `MOTOS_MOCK` et `CUSTOMERS_MOCK`/`RESERVATIONS_MOCK` depuis `src/mocks/` au lieu des hooks réels `useMotos`/`useCustomers`/`useReservations` déjà utilisés partout ailleurs. | Résultats de recherche reflétant les données réelles de la flotte / des clients / des réservations. | Remplacer les imports mock par `useMotos()`, `useCustomers()`, `useReservations()` (ou un endpoint de recherche dédié `GET /api/search?q=`). |
| 3 | **Important** | Notifications | `core/layout/Header.tsx:27-52, 68, 115-117` | Panneau de notifications (icône cloche) alimenté par `MOCK_NOTIFS` en dur. `markAllRead`/`toggleRead` ne mutent que le state React local — rien n'est persisté ni récupéré du serveur. | `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`. | Créer un hook `useNotifications()` sur le modèle de `useFetch`, avec `useAsync` pour les mutations. |
| 4 | **Amélioration** | Badges nav | `core/layout/Sidebar.tsx:11,12,15` | Les badges "163" (Fleet), "12" (Reservations), "7" (Maintenance) sont des littéraux hardcodés dans la config de nav, jamais recalculés. | Badges dérivés des vraies données (ex. `dash.kpis.totalFleet`, nombre de réservations pending, nombre de jobs "open"). | Passer ces valeurs via un contexte léger alimenté par les KPIs déjà fetchés sur le Dashboard, ou un petit hook `useNavCounts()`. |
| 5 | **Amélioration** | Bouton mort | `core/layout/Header.tsx:366` | Dans le menu utilisateur, "View profile" ne fait que `setUserMenuOpen(false)` — aucune navigation ni modale. | Ouvrir une page/modale de profil admin, ou retirer l'entrée si hors scope. | Ajouter une route `/profile` ou masquer l'item tant qu'il n'est pas implémenté. |
| 6 | **Amélioration** | Composants inutilisés | `core/components/ui/Badge.tsx`, `Card.tsx`, `Input.tsx` | Ces trois primitives existent mais ne sont importées nulle part dans le code (vérifié par grep) — scaffolding mort. | Les utiliser (remplacer les styles inline répétés des Pills/cards par ces composants) ou les supprimer. | Refactor ultérieur, non bloquant. |

---

## Module — Authentification (`domains/auth`)

### LoginPage : ✅ 100 % — intégration Keycloak réelle (PKCE, check-sso, redirection), rien à signaler.

### ForgotPasswordPage : ⚠️ non connecté

| # | Gravité | Type | Lignes | Description | Comportement attendu | Correction |
|---|---|---|---|---|---|---|
| 7 | **Bloquant** | Handler vide (TODO explicite) | `domains/auth/pages/ForgotPasswordPage.tsx:10-16` | `handleSubmit` contient `// TODO: POST /api/auth/forgot-password with { email }` et se contente de `setSubmitted(true)`. Aucun appel réseau n'est fait — l'écran de succès s'affiche même si l'email n'existe pas ou si le serveur est down. | Appel réel à `POST /api/auth/forgot-password`, écran de succès affiché seulement après réponse OK (ou de façon générique pour ne pas leak l'existence du compte, mais après un vrai appel). | `await api.post('/auth/forgot-password', { email }); setSubmitted(true);` avec gestion d'erreur réseau (toast ou message inline). |

---

## Module — Dashboard (`domains/dashboard`)

### État : Pane "Operations" ~90 % réel, Pane "Yard view" 100 % cosmétique

`useDashboard()` fetch bien 5 endpoints réels (`/dashboard/kpis`, `/dashboard/revenue`, `/dashboard/rentals`, `/reservations?limit=5`, `/maintenance/alerts`) avec fallback silencieux sur des données statiques si l'API échoue — bon pattern défensif, mais qui masque aussi une régression backend (le bandeau d'erreur `dash.error` compense partiellement).

| # | Gravité | Type | Lignes | Description | Comportement attendu | Correction |
|---|---|---|---|---|---|---|
| 8 | **Important** | Données mockées | `domains/dashboard/pages/DashboardPage.tsx:48-60 (yardTiles/occupancy), 475-537, 489-502` | Le pane "Yard view" (bascule Operations/Yard view en haut de page) est **entièrement** cosmétique : `yardTiles` (motif de seed fixe), `occupancy` (barres de timeline), et la stat "4.9★ avg. customer rating" ne sont reliés à aucune donnée API, contrairement au pane "Operations" qui utilise déjà `useDashboard()`. | Yard map et occupancy timeline alimentés par `GET /api/yard/bays` et `GET /api/yard/occupancy?days=7` (déjà listés comme manquants dans l'audit précédent, toujours vrais). | Créer ces deux endpoints et les hooks associés ; retirer `yardTiles`/`occupancy` en dur. |
| 9 | **Amélioration** | Incohérence visuelle | `DashboardPage.tsx:363, 383` | Le donut "Fleet status" utilise un `conic-gradient` avec des pourcentages fixes (57 %/84 %/93 %) et un bucket "Reserved" toujours à `'11'`/`'7%'`, alors que les valeurs numériques affichées au centre (`availableCount`, `onRoad`, `maintenanceDue`) viennent bien de l'API — le graphique peut donc afficher des proportions qui ne correspondent plus aux chiffres réels dès qu'ils divergent du seed. | Calculer les pourcentages du conic-gradient à partir des mêmes valeurs API que les libellés. | Dériver les angles du donut de `apiKpis` au lieu de constantes. |

---

## Module — Fleet / Motos (`domains/motos`)

### État : Create/Edit ✅ réels et validés (Zod), Delete et actions ligne ❌

| # | Gravité | Type | Lignes | Description | Comportement attendu | Correction |
|---|---|---|---|---|---|---|
| 10 | **Bloquant** | Handler vide (TODO explicite) | `domains/motos/pages/MotoListPage.tsx:193-205` | Le `ConfirmDialog` de suppression a un `onConfirm` qui contient `// TODO: DELETE /api/motos/:id + toast` et se contente de `setDeleteTarget(null)` — la moto n'est jamais supprimée. | `DELETE /api/motos/:id` via `useAsync`, toast de succès/échec, `refetch()`. | Reproduire exactement le pattern déjà utilisé pour confirm/cancel/refund des réservations (`useAsync` + `api.delete`). |
| 11 | **Bloquant** | Handlers vides | `MotoListPage.tsx:58-62` (`RowActionsMenu`) | "View details" et "Change status" ont `onClick: onClose` — ils ferment juste le menu, aucune modale/action associée (seul "Edit" fonctionne). | Ouvrir une vue détail en lecture seule, et un moyen rapide de changer le statut (dropdown inline ou modale dédiée) sans repasser par "Edit" complet. | Ajouter une modale `MotoDetailModal` (lecture seule) et un composant `ChangeMotoStatusModal` ou un `<select>` inline avec `PATCH /api/motos/:id/status`. |
| 12 | **Important** | Actions bulk absentes | `MotoListPage.tsx:324-337` | La barre d'actions bulk (affichée dès qu'une case est cochée) ne propose que "Clear selection" — le code source ne contient même plus le commentaire TODO de l'ancien audit, mais aucune action delete/status en masse n'a été ajoutée malgré la sélection multiple fonctionnelle (checkboxes, indeterminate state). | Boutons "Delete selected" et "Change status" opérant sur `selectedIds`. | `Promise.all(Array.from(selectedIds).map(id => api.delete(...)))` (ou un endpoint bulk dédié côté backend) + toast récapitulatif. |

---

## Module — Réservations (`domains/reservations`)

### État : ✅ ~100 % — CRUD complet et branché

Create (`CreateReservationModal` + `POST /reservations`), Confirm/Cancel/Refund (via `useAsync` + endpoints réels), détail modal, validation Zod avec règle `endDate >= startDate`. Aucun problème bloquant ou important identifié spécifique à ce module — seul le bug de pagination transversal (#1) s'applique ici aussi.

---

## Module — Clients (`domains/customers`)

### État : Create/Edit/Suspend ✅ réels, deux actions de menu mortes

| # | Gravité | Type | Lignes | Description | Comportement attendu | Correction |
|---|---|---|---|---|---|---|
| 13 | **Important** | Handlers vides (commentaire présent) | `domains/customers/pages/CustomerListPage.tsx:30-34` | "View profile" et "View bookings" ont `onClick: onClose` (commentaire `// TODO: "View profile" / "View bookings" modals — out of Day 3 scope` toujours présent dans le code) — seul "Edit" et "Suspend/Reactivate" fonctionnent. | Vue détail client (historique, coordonnées complètes) et vue de ses réservations (filtrée sur `customerId`). | Modale `CustomerDetailModal` (lecture seule) + lien vers `/reservations?customerId=...` ou modale listant les réservations du client via `GET /reservations?customerId=`. |

Email/téléphone sont déjà cliquables (`mailto:`/`tel:`, lignes 302 & 306) — corrigé depuis l'audit précédent.

---

## Module — Maintenance (`domains/maintenance`)

### État : ✅ ~95 % — Create, mark-as-done, notes (autosave conditionnel) tous branchés ; ligne entièrement cliquable

| # | Gravité | Type | Lignes | Description | Comportement attendu | Correction |
|---|---|---|---|---|---|---|
| 14 | **Amélioration** | Champ lecture seule | `domains/maintenance/pages/MaintenanceListPage.tsx:100-102` | Le coût estimé (`Estimated cost`) est affiché via `InfoRow` (texte statique) dans la modale détail — impossible de le corriger après création, contrairement aux notes qui sont éditables + sauvegardées. | Champ `cost` éditable avec bouton "Save" (même pattern que les notes). | Remplacer l'`InfoRow` par un `<input type="number">` contrôlé + `PATCH /maintenance/:id` avec `{ cost }`. |

---

## Module — Paiements (`domains/payments`)

### État : ✅ ~95 % — refund, receipt modal, download tous branchés

| # | Gravité | Type | Lignes | Description | Comportement attendu | Correction |
|---|---|---|---|---|---|---|
| 15 | **Important** | Export incomplet (conséquence du bug #1) | `domains/payments/pages/PaymentListPage.tsx:83-93, 216` | `exportCSV(sorted)` n'exporte que les paiements actuellement chargés côté client, c'est-à-dire **la page API courante (10 lignes)** à cause du bug de pagination transversal — pas l'historique complet des paiements malgré le libellé "Export CSV" qui laisse penser à un export total. | Export CSV portant sur l'ensemble des paiements (ou sur la plage de dates sélectionnée), pas seulement la page affichée. | Une fois #1 corrigé : soit fetcher tout l'historique pour l'export (`GET /payments?limit=10000`), soit un endpoint dédié `GET /payments/export.csv`. |
| 16 | **Amélioration** | Libellé trompeur | `domains/payments/components/ReceiptModal.tsx:10-28` | "Download invoice" génère en réalité un fichier `.txt` brut nommé `receipt-*.txt` avec le contenu `RECEIPT` — ni un vrai reçu formaté, ni une facture PDF. | Un PDF de facture (ou au minimum un reçu HTML imprimable) cohérent avec le libellé du bouton. | Générer un PDF côté backend (`GET /payments/:id/invoice.pdf`) ou renommer le bouton en "Export receipt (.txt)" en attendant. |

---

## Module — Paramètres (`domains/settings`)

### État : écriture (PUT/PATCH) branchée, mais **aucune lecture initiale**

| # | Gravité | Type | Lignes | Description | Comportement attendu | Correction |
|---|---|---|---|---|---|---|
| 17 | **Bloquant** | Pas de fetch au montage | `domains/settings/pages/SettingsPage.tsx:79-87` | `rules` et `company` sont initialisés avec des littéraux hardcodés (`minDays: 1`, `"City Moto Yard"`, `"contact@citymotoyard.fr"`, etc.) — il n'y a **aucun** `GET /settings/rules` ni `GET /settings/company` au montage. Les boutons "Save rules"/"Save company info" appellent bien `PUT` avec succès (toast, validation Zod), mais après un rechargement de page, l'écran réaffiche toujours les valeurs par défaut hardcodées et non les valeurs réellement enregistrées côté serveur. | Au montage : `GET /settings/rules` et `GET /settings/company` pour hydrater le state, avec skeleton/loading pendant le fetch. | Ajouter `useFetch<BookingRules>('/settings/rules')` et `useFetch<CompanyInfo>('/settings/company')`, seedant `rules`/`company` via `useEffect` quand les données arrivent (garder les littéraux actuels comme fallback uniquement). |

Les toggles "Dark mode"/"Compact sidebar" sont légitimement en localStorage uniquement (préférences d'affichage locales, pas de sens serveur) — ce n'est pas un manque. Le toggle "Email notifications" appelle bien `PATCH /settings/preferences` avec rollback optimiste en cas d'échec — correct.

---

## Quick wins (< 30 min chacun)

| Priorité | Tâche | Durée estimée |
|---|---|---|
| 1 | Connecter `ForgotPasswordPage` → `POST /auth/forgot-password` | 10 min |
| 2 | Implémenter le DELETE moto (`MotoListPage.tsx:199`) sur le modèle du cancel/refund réservations | 15 min |
| 3 | Retirer/masquer "View profile" dans le menu utilisateur du Header, ou pointer vers `/settings` | 5 min |
| 4 | Rendre le coût de maintenance éditable (même pattern que les notes) | 20 min |
| 5 | Dériver les badges Sidebar des KPIs déjà fetchés par `useDashboard()` | 20 min |
| 6 | Renommer "Download invoice" en un libellé cohérent avec le `.txt` généré, en attendant le vrai PDF | 5 min |

---

## À corriger ensuite par priorité

### Priorité 1 — Bug transversal (bloque la fiabilité des 5 listes)
1. Corriger le double-paginate sur Motos/Reservations/Customers/Maintenance/Payments : utiliser `meta.total` de `useFetch` et supprimer le `.slice()` client — **3h** (une fois le pattern fixé sur une page, réplicable rapidement sur les 4 autres)

### Priorité 2 — Actions mortes restantes
2. Delete moto (`DELETE /api/motos/:id`) — 30 min
3. "View details" + "Change status" moto (modale détail + patch statut) — 2h
4. Actions bulk Motos (delete/status en masse) — 1h30
5. "View profile" + "View bookings" client (modale détail + vue réservations filtrées) — 2h

### Priorité 3 — Données encore mockées
6. `CommandPalette` → brancher sur `useMotos`/`useCustomers`/`useReservations` — 1h
7. Notifications Header → `GET/PATCH /api/notifications` — 2h
8. Dashboard Pane B (Yard view) → `GET /api/yard/bays`, `/api/yard/occupancy` — 3h

### Priorité 4 — Settings & polish
9. `GET /settings/rules` + `GET /settings/company` au montage de SettingsPage — 1h
10. Cohérence donut Fleet status (calculer les % depuis les KPIs réels) — 30 min
11. Export CSV Payments sur l'historique complet (dépend de la Priorité 1) — 1h
12. Vrai PDF de facture pour "Download invoice" — 3h (dépend du backend)

---

## Checklist actionnable finale

```
BUG TRANSVERSAL (PRIORITÉ 1)
 [ ] Motos — utiliser meta.total, retirer le double .slice()
 [ ] Reservations — idem
 [ ] Customers — idem
 [ ] Maintenance — idem
 [ ] Payments — idem

ACTIONS MORTES
 [ ] DELETE /api/motos/:id (MotoListPage.tsx:199)
 [ ] Moto — "View details" (modale détail lecture seule)
 [ ] Moto — "Change status" (patch statut inline ou modale)
 [ ] Moto — bulk delete + bulk status change
 [ ] Customer — "View profile" (modale détail)
 [ ] Customer — "View bookings" (vue réservations filtrées par client)

DONNÉES MOCKÉES RESTANTES
 [ ] CommandPalette → useMotos/useCustomers/useReservations
 [ ] Header notifications → GET/PATCH /api/notifications
 [ ] Dashboard Pane B (yard map + occupancy) → GET /api/yard/bays, /api/yard/occupancy
 [ ] Sidebar badges → dérivés des KPIs réels

SETTINGS
 [ ] GET /settings/rules au montage
 [ ] GET /settings/company au montage

AUTH
 [ ] ForgotPasswordPage → POST /auth/forgot-password

POLISH / COHÉRENCE
 [ ] Donut Fleet status — % dynamiques depuis apiKpis
 [ ] Maintenance — coût éditable (comme les notes)
 [ ] Payments — vrai PDF de facture (ou renommer le bouton)
 [ ] Payments — export CSV sur l'historique complet, pas la page courante
 [ ] Header — retirer/implémenter "View profile"
 [ ] Nettoyer ou utiliser Badge.tsx / Card.tsx / Input.tsx (composants inutilisés)
```
