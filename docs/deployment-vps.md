# Déploiement VPS automatique

Le déploiement automatique se fait via GitHub Actions :

- push sur `develop` -> déploiement dev avec `docker-compose.yml` + `docker-compose.dev.yml`
- push sur `main` -> déploiement prod avec `docker-compose.prod.yml`

Le fichier `docker-compose.yml` reste le compose local. Le déploiement dev VPS ajoute seulement l'override `docker-compose.dev.yml`.

## Préparer le VPS

Installer les prérequis :

```bash
sudo apt update
sudo apt install -y git
```

Installer Docker et le plugin Compose depuis la documentation officielle Docker.

Créer le dossier applicatif :

```bash
sudo mkdir -p /opt/pleingazloc
sudo chown "$USER:$USER" /opt/pleingazloc
```

Ajouter une clé SSH de déploiement au VPS, puis autoriser cette clé sur le dépôt Git.

## Fichiers d'environnement sur le VPS

Créer `/opt/pleingazloc/main/.env.prod` pour `main`.
Il doit contenir les valeurs de `.env.prod.example`, dont `STRIPE_SECRET_KEY`.
Le fichier est déjà préparé pour :

- `https://pleingazloc.fr`
- `https://api.pleingazloc.fr`
- `https://admin.pleingazloc.fr`
- `https://auth.pleingazloc.fr`

Les enregistrements DNS `api`, `admin` et `auth` doivent pointer vers le VPS, comme le domaine principal.

Créer `/opt/pleingazloc/develop/.env.dev` pour `develop` :

```bash
cp .env.dev.example .env.dev
```

Les URLs `DEV_*` sont déjà configurées avec `pleingazloc.fr` et des ports séparés.
Les ports dev exposés par défaut sont `13000`, `13001`, `13002`, `18080` et `15050` pour éviter de toucher à la prod.

## Secrets GitHub

Dans GitHub, ajouter ces secrets :

- `VPS_HOST` : IP ou domaine du VPS
- `VPS_USER` : utilisateur SSH
- `VPS_PORT` : port SSH, optionnel, `22` par défaut
- `VPS_SSH_PRIVATE_KEY` : clé privée SSH utilisée par GitHub Actions
- `VPS_APP_DIR` : dossier parent des déploiements sur le VPS, par exemple `/opt/pleingazloc`
- `VPS_REPOSITORY_URL` : URL SSH du dépôt, par exemple `git@github.com:org/repo.git`

## Déploiement manuel

Depuis le VPS :

```bash
cd /opt/pleingazloc/develop
scripts/deploy/vps-deploy.sh develop

cd /opt/pleingazloc/main
scripts/deploy/vps-deploy.sh main
```

Le script fait :

- `git fetch`
- checkout/reset sur la branche demandée
- validation Docker Compose
- `docker compose up -d --build --remove-orphans`
- affichage de l'état des services

GitHub Actions clone séparément :

- `/opt/pleingazloc/develop` pour la branche `develop`
- `/opt/pleingazloc/main` pour la branche `main`

Cela évite qu'un déploiement prod modifie le working tree utilisé par le stack dev.

Pour la prod, le script ne force pas `--project-name`, afin de conserver les volumes et containers existants du VPS.
