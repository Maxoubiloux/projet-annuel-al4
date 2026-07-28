#!/usr/bin/env bash
set -Eeuo pipefail

BRANCH="${1:-}"
APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
REMOTE="${GIT_REMOTE:-origin}"
PRUNE_IMAGES="${DEPLOY_PRUNE_IMAGES:-false}"

if [[ -z "$BRANCH" ]]; then
  BRANCH="$(git -C "$APP_DIR" rev-parse --abbrev-ref HEAD)"
fi

case "$BRANCH" in
  main)
    TARGET="prod"
    COMPOSE_FILES=(-f docker-compose.prod.yml)
    ENV_FILE=".env.prod"
    PROJECT_ARGS=()
    ;;
  develop)
    TARGET="dev"
    COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.dev.yml)
    ENV_FILE=".env.dev"
    PROJECT_ARGS=(--project-name "${DEV_COMPOSE_PROJECT_NAME:-moto-dev}")
    ;;
  *)
    echo "Unsupported branch '$BRANCH'. Expected 'main' or 'develop'." >&2
    exit 64
    ;;
esac

LOCK_FILE="/tmp/moto-rental-${TARGET}-deploy.lock"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "A ${TARGET} deployment is already running." >&2
  exit 75
fi

cd "$APP_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE on the VPS. Create it before deploying $TARGET." >&2
  exit 66
fi

echo "Deploying $TARGET from $BRANCH in $APP_DIR"

git fetch --prune "$REMOTE"
git checkout -B "$BRANCH" "$REMOTE/$BRANCH"
git reset --hard "$REMOTE/$BRANCH"

if [[ -f .gitmodules ]]; then
  git submodule update --init --recursive
fi

docker compose \
  "${PROJECT_ARGS[@]}" \
  --env-file "$ENV_FILE" \
  "${COMPOSE_FILES[@]}" \
  config --quiet

docker compose \
  "${PROJECT_ARGS[@]}" \
  --env-file "$ENV_FILE" \
  "${COMPOSE_FILES[@]}" \
  up -d --build --remove-orphans

docker compose \
  "${PROJECT_ARGS[@]}" \
  --env-file "$ENV_FILE" \
  "${COMPOSE_FILES[@]}" \
  ps

if [[ "$PRUNE_IMAGES" == "true" ]]; then
  docker image prune -f
fi

echo "Deployment completed: $TARGET ($BRANCH)"
