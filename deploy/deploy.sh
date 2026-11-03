#!/usr/bin/env bash
# Runs on the server: bash deploy.sh <image-tag>
# Pulls the new images, restarts the stack, checks it is healthy, and rolls back to the previous tag if it is not.
set -euo pipefail
cd /opt/grains
NEW_TAG="${1:?usage: deploy.sh <tag>}"
: "${DOCKERHUB_USER:?}" "${DOCKERHUB_TOKEN:?}"

PREV_TAG="$(grep -s '^TAG=' .env | cut -d= -f2 || true)"
echo "Deploying $NEW_TAG (previous: ${PREV_TAG:-none})"

health() { # waits up to ~2 minutes for the site and the API to answer
  for _ in $(seq 1 40); do
    if curl -fsS -m 4 http://127.0.0.1/healthz >/dev/null 2>&1 && curl -fsS -m 4 http://127.0.0.1/api/health >/dev/null 2>&1; then return 0; fi
    sleep 3
  done
  return 1
}
up() { printf 'DOCKERHUB_USER=%s\nTAG=%s\n' "$DOCKERHUB_USER" "$1" > .env; docker compose pull -q; docker compose up -d --remove-orphans; }

echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin >/dev/null
trap 'docker logout >/dev/null 2>&1 || true' EXIT

up "$NEW_TAG"
if health; then
  echo "Healthy: $NEW_TAG is live."
  docker image prune -af --filter "until=72h" >/dev/null 2>&1 || true
  exit 0
fi

echo "::error::$NEW_TAG failed its health check" >&2
docker compose logs --tail=60 server >&2 || true
if [ -n "${PREV_TAG:-}" ] && [ "$PREV_TAG" != "$NEW_TAG" ]; then
  echo "Rolling back to $PREV_TAG" >&2
  up "$PREV_TAG"
  health && echo "Rolled back to $PREV_TAG and it is healthy." >&2 || echo "Rollback is not healthy either: check the server." >&2
fi
exit 1
