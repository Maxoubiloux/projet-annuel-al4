# ADR 003 : Choix du Worker et du Système de Queue

Date : 2026-03-26

## Statut
Accepté

## Contexte
Le projet impose un service Worker asynchrone pour des tâches spécifiques au domaine (envoi de mail, traitement de fichier, etc.), communiquant avec le Backend via deux queues (Requêtes et Réponses).

## Décision
Nous choisissons d'utiliser **Rust** pour le Worker et **RabbitMQ** comme système de Queue.

## Justification
- **Points bonus** : Le sujet accorde des points supplémentaires si le Worker est en Rust.
- **Fiabilité de Rust** : Typage fort, gestion de la mémoire sûre et haute performance pour les tâches asynchrones.
- **RabbitMQ** : Un courtier de messages (Message Broker) robuste, largement utilisé et supporté dans les écosystèmes NestJS et Rust.
- **Isolation** : Rust permet une isolation totale du Worker vis-à-vis du Backend (pas d'accès partagé à la BDD ou aux modèles).

## Conséquences
- Nécessité de définir des contrats de données clairs (Schémas JSON ou Protobuf) pour la communication via RabbitMQ.
- Apprentissage de Rust pour l'implémentation des tâches métier.
- Configuration de deux files d'attente : `backend_to_worker` et `worker_to_backend`.
