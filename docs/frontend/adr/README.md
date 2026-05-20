# Architecture Decision Records (ADR)

Ce dossier contient les ADR (Architecture Decision Records) du projet City Moto Yard.

## Qu'est-ce qu'un ADR ?

Un ADR est un document qui enregistre une décision d'architecture importante. Il permet de :
- Documenter le contexte d'une décision
- Justifier le choix fait
- Garder une trace historique des décisions
- Faciliter la communication au sein de l'équipe

## Quand créer un ADR ?

Un ADR doit être créé dans les situations suivantes :
- **Changement dans un modèle** : Modification de la structure des données
- **Ajout d'une dépendance externe** : Nouvelle librairie, framework ou service
- **Choix d'architecture** : Décision structurelle importante

Vous êtes libre d'ajouter des ADR dans d'autres situations si vous le jugez nécessaire.

## Comment créer un ADR ?

1. Copiez le fichier `TEMPLATE.md`
2. Renommez-le avec le numéro suivant (ex: `004-titre.md`)
3. Remplissez les sections requises
4. Datez le document (format YYYY-MM-DD)
5. Commitez le fichier dans git

## Convention de numérotation

Les ADR sont numérotés séquentiellement avec 3 chiffres (001, 002, 003, etc.).

## Statuts possibles

- **Proposé** : La décision est en cours de discussion
- **Accepté** : La décision a été validée et implémentée
- **Rejeté** : La décision a été rejetée
- **Remplacé par ADR YYY** : La décision a été remplacée par une nouvelle décision

## ADR existants

- [ADR 001](./001-choix-backend.md) : Choix du langage et du framework Backend
- [ADR 002](./002-choix-frontend.md) : Choix du framework Frontend
- [ADR 003](./003-choix-worker.md) : Choix du Worker et du Système de Queue
