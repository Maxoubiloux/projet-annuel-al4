# ADR 0004: Paiement externe avec Stripe Checkout

**Date** : 2026-07-24

**Statut** : Accepté

## Contexte

Le parcours de réservation doit démontrer l'appel à un service externe métier, tout en restant utilisable en local Docker et en production VPS Docker. Le frontend ne doit pas traiter directement les informations bancaires et doit continuer à appeler uniquement le backend.

## Décision

Les paiements de réservation client utilisent Stripe Checkout en mode test. Le backend crée une session Checkout Stripe pour une réservation en attente, puis le frontend redirige l'utilisateur vers l'URL Stripe retournée. Après le retour sur l'application, le frontend demande au backend de récupérer la session Stripe et de confirmer la réservation uniquement si `payment_status` vaut `paid`.

Le SDK Stripe est isolé dans `infrastructure/external/stripe-payment.gateway.ts` derrière l'interface domaine `IPaymentGateway`. Le domaine ne dépend pas du SDK Stripe.

## Conséquences

- `STRIPE_SECRET_KEY` doit être configurée dans l'environnement backend en local et en production.
- `FRONTEND_URL` doit pointer vers l'URL publique du frontend pour construire les URLs de retour Stripe.
- Sans clé Stripe, le backend démarre mais le paiement renvoie une erreur contrôlée.
- Les tests unitaires peuvent mocker `IPaymentGateway` sans appel réseau.
- Aucune donnée carte bancaire n'est stockée ni transmise au backend.
