# ADR 006: Authentification forte avec Keycloak

**Date** : 2026-07-24

**Statut** : Accepté

## Contexte

Le projet doit proposer l'activation, la consultation et la suppression d'une authentification forte. L'application conserve Keycloak comme système IAM et source de vérité des informations d'identité.

## Décision

L'application s'appuie sur le mécanisme TOTP natif de Keycloak. Depuis le profil client, le frontend déclenche une redirection Keycloak avec l'action `CONFIGURE_TOTP`. Keycloak gère alors l'affichage du QR code, la génération du secret, la vérification du code et l'enregistrement du credential OTP.

Le backend ne manipule pas le secret TOTP. Il expose uniquement des routes applicatives pour lire et supprimer l'état A2F :

- `GET /api/v1/auth/me/2fa` lit les credentials Keycloak de l'utilisateur et considère l'A2F active lorsqu'un credential de type `otp` existe.
- `DELETE /api/v1/auth/me/2fa` supprime les credentials Keycloak de type `otp` via l'API Admin Keycloak.

Les anciens attributs applicatifs `twoFactorEnabled` et `twoFactorSecret` ne sont pas la source de vérité. Ils peuvent être nettoyés lors de la désactivation, mais l'état réel de l'A2F est porté par les credentials OTP Keycloak.

## Conséquences

- Keycloak reste responsable du secret TOTP, du QR code, de la vérification du code et du stockage du credential OTP.
- Le backend n'a pas besoin de dépendances applicatives de génération ou de validation TOTP comme `otplib` ou `qrcode` pour ce parcours.
- Le frontend conserve une intégration simple : activation via redirection Keycloak, consultation/suppression via l'API backend.
- La suppression A2F passe par l'API Admin Keycloak, donc le backend doit disposer des droits nécessaires sur les credentials utilisateur.
- Le login et le challenge TOTP restent gérés par Keycloak, ce qui évite de réimplémenter une logique de sécurité sensible dans l'application.
