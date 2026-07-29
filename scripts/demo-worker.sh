#!/usr/bin/env bash
#
# Démonstration du worker Rust (génération asynchrone des contrats PDF).
#
#   ./scripts/demo-worker.sh up          # démarre la stack et attend qu'elle soit prête
#   ./scripts/demo-worker.sh check       # état des services, files et topologie
#   ./scripts/demo-worker.sh isolation   # prouve que le worker n'a aucun accès à la base
#   ./scripts/demo-worker.sh job [id]    # publie un job et suit le traitement de bout en bout
#   ./scripts/demo-worker.sh dlq         # message illisible -> dead-letter queue
#   ./scripts/demo-worker.sh resilience  # coupe le broker et montre la reconnexion
#   ./scripts/demo-worker.sh tests       # tests du worker et du backend
#
set -euo pipefail

cd "$(dirname "$0")/.."

RABBIT_UI="http://localhost:15672"
RABBIT_AUTH="guest:guest"
API="http://localhost:3000"

bold=$'\033[1m'; green=$'\033[32m'; yellow=$'\033[33m'; red=$'\033[31m'; dim=$'\033[2m'; off=$'\033[0m'

title() { printf '\n%s▸ %s%s\n' "$bold" "$1" "$off"; }
ok()    { printf '  %s✓%s %s\n' "$green" "$off" "$1"; }
warn()  { printf '  %s!%s %s\n' "$yellow" "$off" "$1"; }
fail()  { printf '  %s✗%s %s\n' "$red" "$off" "$1"; }
note()  { printf '  %s%s%s\n' "$dim" "$1" "$off"; }
pause() { printf '\n%s— Entrée pour continuer —%s' "$dim" "$off"; read -r _; }

queue_depth() {
  curl -s -u "$RABBIT_AUTH" "$RABBIT_UI/api/queues/%2F" \
    | python3 -c "
import json,sys
for q in json.load(sys.stdin):
    print(f\"{q['name']:>22} : {q.get('messages',0)} message(s)\")" 2>/dev/null \
    || fail "RabbitMQ injoignable sur $RABBIT_UI"
}

# Première réservation en base, pour n'avoir aucun UUID à taper en direct.
first_reservation() {
  docker compose exec -T postgres psql -U postgres -d moto_rental -t -A \
    -c "select id from bookings order by created_at limit 1;" 2>/dev/null | tr -d '\r'
}

publish_job() {
  local rid="$1"
  python3 - "$rid" <<'PY'
import base64, json, sys, urllib.request

rid = sys.argv[1]
job = {
    "correlation_id": f"demo-{rid[:8]}",
    "job_type": "GenerateRentalContractPdf",
    "reservation_id": rid,
    "data": {
        "moto_id": "550e8400-e29b-41d4-a716-446655440001",
        "customer_id": "550e8400-e29b-41d4-a716-446655440002",
        "start_date": "2026-08-01",
        "end_date": "2026-08-05",
        "total_amount": 340,
        "deposit_amount": 500,
        "customer": {"first_name": "Camille", "last_name": "Durand",
                     "email": "camille.durand@example.com", "phone": "+33600000000"},
        "moto": {"brand": "Yamaha", "model": "MT-07",
                 "plate": "AB-123-CD", "category": "Roadster"},
        "shop": {"name": "Plein Gaz Loc", "city": "Paris"},
    },
}
body = json.dumps({"properties": {}, "routing_key": "worker_requests",
                   "payload": json.dumps(job), "payload_encoding": "string"}).encode()
req = urllib.request.Request(
    "http://localhost:15672/api/exchanges/%2F/amq.default/publish",
    data=body,
    headers={"content-type": "application/json",
             "authorization": "Basic " + base64.b64encode(b"guest:guest").decode()})
print(json.load(urllib.request.urlopen(req)).get("routed"))
PY
}

cmd_up() {
  title "Démarrage de la stack"
  docker compose up -d --build
  note "Attente du worker…"
  for _ in $(seq 1 60); do
    if docker compose logs worker 2>/dev/null | grep -q "Consumer started"; then
      ok "worker en écoute sur worker_requests"
      return 0
    fi
    sleep 2
  done
  fail "le worker n'a pas démarré — docker compose logs worker"
  return 1
}

cmd_check() {
  title "Services"
  docker compose ps --format '  {{.Service}} :: {{.Status}}'

  title "Démarrage du worker (logs structurés JSON)"
  docker compose logs worker 2>/dev/null | grep -E "Worker starting|topology declared|Consumer started" | tail -3

  title "Files déclarées"
  queue_depth
  note "Deux files distinctes + une DLQ : backend -> worker, worker -> backend."
  note "Backend et worker déclarent la même topologie, sans conflit."
}

cmd_isolation() {
  title "Le worker n'a aucun accès à la base de données"
  if docker compose exec -T worker env | grep -qiE "database|postgres|prisma"; then
    fail "une variable de base de données est exposée au worker"
  else
    ok "aucune variable DATABASE_* / POSTGRES_* dans son environnement"
  fi

  title "Variables réellement fournies au worker"
  docker compose exec -T worker env | grep -E "RABBITMQ_URL|QUEUE|EXCHANGE|CONTRACTS_DIR|PUBLIC_BASE_URL" | sed 's/^/  /'

  title "Son image ne contient qu'un binaire statique"
  docker compose exec -T worker ls -l /usr/local/bin/worker | sed 's/^/  /'
  note "Tout ce dont il a besoin arrive dans le message RabbitMQ (ADR 0005)."
}

cmd_job() {
  local rid="${1:-}"
  [ -z "$rid" ] && rid="$(first_reservation)"
  if [ -z "$rid" ]; then
    fail "aucune réservation en base — crée-en une depuis l'application"
    return 1
  fi

  title "Réservation ciblée"
  docker compose exec -T postgres psql -U postgres -d moto_rental -t -A -F' | ' \
    -c "select id, contract_status, coalesce(contract_pdf_url,'(aucune)') from bookings where id='$rid';" \
    | sed 's/^/  /'

  title "Publication du job sur worker_requests"
  [ "$(publish_job "$rid")" = "True" ] && ok "message routé" || fail "publication refusée"

  title "Traitement par le worker"
  for _ in $(seq 1 30); do
    if docker compose logs --since 60s worker 2>/dev/null | grep -q "Contract generated"; then break; fi
    sleep 1
  done
  docker compose logs --since 60s worker 2>/dev/null \
    | grep -E "Job received|Contract generated" | tail -2 | sed 's/^/  /'
  note "correlation_id et duration_ms sont dans les logs : traçabilité bout-en-bout."

  title "Le PDF existe des deux côtés du volume partagé"
  printf '  worker  : '; docker compose exec -T worker  ls -l "/data/contracts/$rid.pdf" 2>/dev/null || fail "absent"
  printf '  backend : '; docker compose exec -T backend ls -l "/app/uploads/contracts/$rid.pdf" 2>/dev/null || fail "absent"

  title "Réponse consommée par le backend, réservation mise à jour"
  docker compose exec -T postgres psql -U postgres -d moto_rental -t -A -F' | ' \
    -c "select contract_status, contract_pdf_url from bookings where id='$rid';" | sed 's/^/  /'

  title "Téléchargement du contrat"
  note "Route authentifiée (le contrat contient des données personnelles) :"
  note "  GET $API/api/v1/reservations/$rid/contract"
  note "Sans token :"
  printf '  '; curl -s -o /dev/null -w "HTTP %{http_code}\n" "$API/api/v1/reservations/$rid/contract"
  note "Avec un token admin : 200 application/pdf — voir README de démo."
}

cmd_dlq() {
  title "Avant"
  queue_depth

  title "Publication d'un message illisible"
  curl -s -u "$RABBIT_AUTH" -X POST "$RABBIT_UI/api/exchanges/%2F/amq.default/publish" \
    -H 'content-type: application/json' \
    -d '{"properties":{},"routing_key":"worker_requests","payload":"ceci nest pas du json","payload_encoding":"string"}' \
    >/dev/null && ok "message envoyé"
  sleep 3

  title "Réaction du worker"
  docker compose logs --since 30s worker 2>/dev/null | grep -i "dead-letter" | tail -1 | sed 's/^/  /'

  title "Après"
  queue_depth
  note "nack sans requeue : le message part en DLQ au lieu de boucler à l'infini."
  note "Console RabbitMQ : $RABBIT_UI (guest/guest)"
}

cmd_resilience() {
  title "Arrêt du broker"
  docker compose stop rabbitmq >/dev/null 2>&1 && ok "rabbitmq arrêté"
  sleep 5
  docker compose logs --since 30s worker 2>/dev/null | grep -iE "unreachable|retrying" | tail -2 | sed 's/^/  /'

  title "Redémarrage"
  docker compose start rabbitmq >/dev/null 2>&1 && ok "rabbitmq redémarré"
  for _ in $(seq 1 45); do
    if docker compose logs --since 90s worker 2>/dev/null | grep -q "Consumer started"; then
      ok "worker de nouveau en écoute"
      return 0
    fi
    sleep 2
  done
  warn "reprise plus lente que prévu — docker compose logs worker"
}

cmd_tests() {
  title "Worker (Rust) — aucun broker requis"
  (cd worker && cargo fmt --all -- --check && ok "format" \
    && cargo clippy --all-targets --locked -- -D warnings >/dev/null 2>&1 && ok "clippy sans warning" \
    && cargo test --locked 2>&1 | grep -E "^test result" | sed 's/^/  /')

  title "Backend (TypeScript)"
  (cd backend && npm test 2>&1 | tail -4 | sed 's/^/  /')
}

case "${1:-}" in
  up)         cmd_up ;;
  check)      cmd_check ;;
  isolation)  cmd_isolation ;;
  job)        cmd_job "${2:-}" ;;
  dlq)        cmd_dlq ;;
  resilience) cmd_resilience ;;
  tests)      cmd_tests ;;
  *)
    sed -n '3,12p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
