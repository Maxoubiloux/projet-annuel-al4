# Git Flow

Ce document décrit le workflow Git utilisé sur ce dépôt.

## Branches permanentes

- `main` -> production (`https://pleingazloc.fr`)
- `develop` -> environnement de dev/staging

Un push sur l'une ou l'autre déclenche automatiquement les tests (`.github/workflows/{backend,frontend,worker}.yml`) puis le déploiement VPS correspondant (`.github/workflows/deploy-vps.yml`), voir [deployment-vps.md](deployment-vps.md).

## Branches de travail

Toujours partir de `develop`, jamais de `main` directement. Préfixe du nom de branche selon le type de travail (ce sont les préfixes déclencheurs de CI, cf. `on.push.branches` dans les workflows) :

- `feature/<nom>` — nouvelle fonctionnalité
- `fix/<nom>` — correction de bug
- `hotfix/<nom>` — correctif urgent

Exemples déjà présents sur le dépôt : `feature/admin_backoffice`, `feature/backend_backoffice`, `feature/visual_redesign`, `fix/backend_communication`.

> Certaines anciennes branches (`fix-error`, `fix-deploy`, ...) utilisent un tiret au lieu du slash — ne pas reproduire ce format, il ne matche pas les triggers CI (`fix/**`).

## Cycle de vie d'une branche

1. Créer la branche depuis `develop` à jour :
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/ma-fonctionnalite
   ```
2. Commiter en suivant la convention ci-dessous.
3. Pousser et ouvrir une Pull Request vers `develop`.
4. La CI (lint/tests build) doit passer avant merge.
5. Merger dans `develop` (via PR GitHub) -> déploiement automatique en dev.
6. Une fois `develop` validé en environnement de dev, ouvrir une PR `develop` -> `main` pour livrer en prod.
7. Supprimer la branche de travail après merge.

## Convention de commit

Le dépôt suit (de façon non stricte) le format [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>(<scope optionnel>): <description>
```

Types observés dans l'historique :

| Type | Usage |
|---|---|
| `feat` | nouvelle fonctionnalité |
| `fix` | correction de bug |
| `hotfix` | correctif urgent, généralement direct sur une branche de prod |
| `chore` | tâche technique sans impact fonctionnel (deps, scripts, config) |
| `docs` | documentation (README, ADR...) |
| `ci` | pipelines CI/CD |
| `test` | ajout/modification de tests |

Le scope correspond en général au module concerné : `backend`, `frontend`, `worker`, `adr`, `lint`, `http`...

Exemples réels :
```
feat(backend): add contract download endpoint
fix: generate PDF AFTER paiement validation
docs(adr): update contract delivery decision
chore(worker): update packaging and docs
```

## Pull Requests

- Une PR par branche de travail, ciblant `develop` (jamais `main` directement, sauf release `develop` -> `main`).
- La CI doit être verte (lint, build, tests des trois workspaces `backend`/`frontend`/`worker` concernés) avant merge.
- Merge via GitHub (pas de push direct sur `develop`/`main` en local).
