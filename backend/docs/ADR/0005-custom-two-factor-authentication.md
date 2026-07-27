# ADR 0005: Authentification forte personnalisée avec Keycloak

**Date** : 2026-07-24

**Statut** : Accepté

## Contexte

Le projet doit proposer l'activation et la suppression d'une authentification forte. L'interface client doit rester cohérente avec le design de l'application, tout en conservant Keycloak comme système IAM et source de vérité des informations d'identité.

## Décision

L'application fournit un écran personnalisé dans le profil client pour activer l'A2F TOTP. Le backend génère un secret TOTP et un QR code, vérifie le code fourni par l'utilisateur, puis stocke l'état A2F dans les attributs utilisateur Keycloak (`twoFactorEnabled`, `twoFactorSecret`). Lors du login, le backend vérifie le mot de passe via Keycloak, puis exige le code TOTP si l'A2F est active avant de retourner la session au frontend.

Les dépendances `otplib` et `qrcode` sont confinées à l'infrastructure IAM du backend. Le frontend ne manipule pas le secret autrement que pendant l'étape de configuration.

## Conséquences

- L'écran d'activation/suppression A2F est personnalisé côté frontend.
- Keycloak reste le stockage de référence des utilisateurs et de l'état A2F.
- Le login doit passer par le backend pour que la vérification TOTP personnalisée soit appliquée.
- Si le jury exige strictement les écrans natifs Keycloak, ce choix pourra être remplacé par le required action `CONFIGURE_TOTP` et l'Account Console Keycloak.
