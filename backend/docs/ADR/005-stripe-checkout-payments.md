# ADR 005: Paiement externe avec Stripe Checkout

**Date** : 2026-07-24

**Statut** : Accepté

## Contexte

Le parcours de réservation doit démontrer l'appel à un service externe métier, tout en restant utilisable en local Docker, en environnement de développement VPS et en production VPS Docker. Le frontend ne doit pas traiter directement les informations bancaires et doit continuer à appeler uniquement le backend.

## Décision

Les paiements de réservation client utilisent Stripe Checkout en mode test. Le backend crée une session Checkout Stripe pour une réservation en attente, puis le frontend redirige l'utilisateur vers l'URL Stripe retournée. Après le retour sur l'application, le frontend demande au backend de récupérer la session Stripe et de confirmer la réservation uniquement si `payment_status` vaut `paid`.

La session Stripe porte l'identifiant de réservation dans `metadata.reservationId` et `client_reference_id`. Lors de la confirmation, le backend refuse une session dont l'identifiant Stripe ne correspond pas à la réservation à confirmer.

Les URLs de retour Stripe sont construites côté backend. `FRONTEND_URL` reste la source principale, notamment lorsqu'un environnement est servi sous un chemin dédié. Si `FRONTEND_URL` ne contient pas de chemin, le backend peut reprendre l'en-tête `Origin` uniquement s'il fait partie des origines autorisées par `CORS_ORIGIN`. Cela permet d'utiliser le même backend avec plusieurs frontends autorisés sans ouvrir les redirections Stripe à une origine arbitraire.

Une fois le paiement confirmé, le backend marque le paiement et la réservation comme payés, confirme la réservation, puis publie la demande de génération de contrat PDF dans RabbitMQ si le publisher de contrats est disponible. L'échec de publication du contrat n'annule pas la confirmation du paiement.

Le SDK Stripe est isolé dans `infrastructure/external/stripe-payment.gateway.ts` derrière l'interface domaine `IPaymentGateway`. Le domaine ne dépend pas du SDK Stripe.

## Conséquences

- `STRIPE_SECRET_KEY` doit être configurée dans l'environnement backend en local et en production.
- `FRONTEND_URL` doit pointer vers l'URL publique du frontend pour construire les URLs de retour Stripe.
- `CORS_ORIGIN` doit lister les frontends autorisés lorsque l'environnement accepte plusieurs origines.
- Sans clé Stripe, le backend démarre mais le paiement renvoie une erreur contrôlée.
- Les tests unitaires peuvent mocker `IPaymentGateway` sans appel réseau.
- Aucune donnée carte bancaire n'est stockée ni transmise au backend.
- La génération du contrat PDF est déclenchée après confirmation de paiement, mais reste découplée du paiement grâce à RabbitMQ.
