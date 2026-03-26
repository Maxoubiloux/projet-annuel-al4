# Présentation du projet : Plateforme de location de motos

## 1. Contexte et objectif

Dans le cadre de mon projet d’école, je souhaite concevoir et développer une plateforme web permettant la location de motos en ligne.

Le projet repose sur un réseau de **trois magasins situés en France**, proposant chacun un catalogue de motos disponibles à la location.

L’objectif principal est de fournir une solution moderne, centralisée et intuitive permettant :
- aux clients de consulter les motos disponibles
- de réserver et payer en ligne
- de gérer leurs locations facilement

---

## 2. Fonctionnalités principales

### 2.1 Gestion des utilisateurs (Authentification)
- Création de compte
- Connexion sécurisée
- Gestion des rôles (client / administrateur)
- Système d’authentification basé sur des services dédiés (workers backend)

### 2.2 Catalogue de motos
- Affichage des motos disponibles par magasin
- Filtres (type, prix, disponibilité, etc.)
- Détail complet de chaque moto (caractéristiques, photos, prix)

### 2.3 Système de réservation
- Sélection des dates de location
- Vérification de disponibilité
- Réservation en ligne

### 2.4 Paiement en ligne
- Intégration d’un système de paiement sécurisé
- Gestion des transactions
- Historique des paiements

### 2.5 Génération de documents PDF
- Génération automatique de factures
- Génération de contrats de location
- Téléchargement des documents

### 2.6 Envoi d’emails
- Confirmation de réservation
- Confirmation de paiement
- Notifications diverses (annulation, rappel, etc.)

---

## 3. Architecture technique

Le projet repose sur une architecture backend moderne avec séparation des responsabilités.

### 3.1 Backend

Le backend sera organisé autour de plusieurs services (workers) :

- **Service d’authentification** : gestion des utilisateurs et des sessions
- **Service de paiement** : traitement des transactions
- **Service d’email** : envoi des notifications
- **Service de génération PDF** : création des factures et contrats

Cette architecture permet :
- une meilleure scalabilité
- une maintenance facilitée
- une séparation claire des responsabilités

### 3.2 Frontend

- Application web moderne (React + TypeScript)
- Interface utilisateur responsive
- Communication avec le backend via API REST

### 3.3 Base de données

- Stockage des utilisateurs, motos, réservations et paiements
- Gestion des relations entre magasins et motos

---

## 4. Organisation des magasins

La plateforme gère **trois magasins physiques en France**, chacun disposant :
- de son propre stock de motos
- de ses disponibilités
- de ses informations spécifiques

Cela permet une gestion centralisée tout en conservant les spécificités locales.

---

## 5. Sécurité

- Authentification sécurisée (JWT ou session)
- Protection des données utilisateurs
- Paiements sécurisés
- Validation des données côté serveur

---

## 6. Évolutions possibles

- Application mobile
- Système de notation des motos
- Gestion des assurances
- Tableau de bord administrateur avancé

---

## 7. API - Authentification (IAM) et séparation des rôles

Le système d’authentification repose sur un service IAM (Identity and Access Management) indépendant. Il gère les utilisateurs, les rôles et les permissions.

### 7.1 API Auth (IAM Service)

#### Authentification
- POST /auth/register → Inscription utilisateur (client ou admin)
- POST /auth/login → Connexion
- POST /auth/logout → Déconnexion
- POST /auth/refresh → Rafraîchir le token

#### Gestion des utilisateurs
- GET /users/me → Récupérer le profil courant
- PUT /users/me → Modifier son profil
- DELETE /users/me → Supprimer son compte

#### Gestion des rôles (admin uniquement)
- GET /admin/users → Liste des utilisateurs
- PUT /admin/users/{id}/role → Modifier le rôle (client/admin)
- DELETE /admin/users/{id} → Supprimer un utilisateur

---

### 7.2 API Client (Frontend utilisateur)

#### Catalogue
- GET /motos → Liste des motos
- GET /motos/{id} → Détail d’une moto
- GET /magasins → Liste des magasins

#### Réservations
- POST /reservations → Créer une réservation
- GET /reservations/me → Voir ses réservations
- DELETE /reservations/{id} → Annuler une réservation

#### Paiement
- POST /payments → Initier un paiement
- GET /payments/{id} → Statut du paiement

---

### 7.3 API Admin

#### Gestion des motos
- POST /admin/motos → Ajouter une moto
- PUT /admin/motos/{id} → Modifier une moto
- DELETE /admin/motos/{id} → Supprimer une moto

#### Gestion des magasins
- POST /admin/magasins → Ajouter un magasin
- PUT /admin/magasins/{id} → Modifier un magasin

#### Gestion des réservations
- GET /admin/reservations → Voir toutes les réservations
- PUT /admin/reservations/{id} → Modifier une réservation

---

### 7.4 API Workers (services internes)

Ces API ne sont pas exposées publiquement, elles sont utilisées entre services.

#### Worker Paiement
- POST /worker/payments/process → Traiter un paiement
- POST /worker/payments/webhook → Callback fournisseur paiement

#### Worker Email
- POST /worker/emails/send → Envoyer un email

#### Worker PDF
- POST /worker/pdf/generate → Générer une facture ou contrat

#### Worker Auth (IAM interne)
- POST /worker/auth/validate → Vérifier un token
- POST /worker/auth/permissions → Vérifier les droits

---

## 8. Conclusion

Ce projet vise à mettre en place une solution complète de location de motos en ligne, avec une architecture moderne basée sur des services séparés (IAM, workers, frontend).

La séparation claire entre client, admin et services internes permet une meilleure sécurité, maintenabilité et évolutivité du système.

