#!/usr/bin/env bash
# One-time GitHub setup: creates the private repo, stores every secret the pipeline needs, and pushes the code.
#
#   DOCKERHUB_TOKEN='dckr_pat_...' bash deploy/bootstrap-github.sh            # do it
#   DOCKERHUB_TOKEN='x' bash deploy/bootstrap-github.sh --dry-run             # show what would happen, change nothing
#
# Secrets are read from local files / the server and sent to GitHub over stdin; none are written to the repo.
set -euo pipefail
cd "$(dirname "$0")/.."

REPO="${REPO:-Chinmaya1999/grains-global}"
EC2_HOST="${EC2_HOST:-13.126.73.0}"
EC2_USER="${EC2_USER:-ec2-user}"
PEM="${PEM:-adihuman.pem}"
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-awsmallick1999}"
: "${DOCKERHUB_TOKEN:?Set DOCKERHUB_TOKEN to your Docker Hub access token}"
DRY=0; [ "${1:-}" = "--dry-run" ] && DRY=1

say() { printf '\n== %s ==\n' "$*"; }
run() { if [ "$DRY" = 1 ]; then echo "[dry-run] $*"; else "$@"; fi; }
secret() { # secret NAME  (value on stdin)
  local v; v="$(cat)"
  if [ "$DRY" = 1 ]; then echo "[dry-run] gh secret set $1  (${#v} characters)"; else printf '%s' "$v" | gh secret set "$1" --repo "$REPO"; fi
}
ssh_ec2() { ssh -i "$PEM" -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$EC2_USER@$EC2_HOST" "$@"; }

[ -f "$PEM" ] || { echo "Key file $PEM not found" >&2; exit 1; }
[ -f server/.env ] || { echo "server/.env not found" >&2; exit 1; }

say "GitHub login"
gh auth status >/dev/null 2>&1 || { echo "Run 'gh auth login' first" >&2; exit 1; }
if ! gh auth status 2>&1 | grep -q "'workflow'"; then
  echo "Your GitHub login lacks the 'workflow' permission, which is required to push .github/workflows."
  run gh auth refresh -h github.com -s workflow
fi

say "Commit"
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  run git add -A
  # guard: never commit keys or env files
  if git diff --cached --name-only | grep -E '\.pem$|(^|/)\.env($|\.[^e])' ; then echo "Refusing to commit secret files above" >&2; exit 1; fi
  run git commit -q -m "Grains Global: MERN app with CI/CD to AWS EC2"
else
  echo "already committed"
fi

say "Repository ($REPO, private)"
if gh repo view "$REPO" >/dev/null 2>&1; then echo "exists"; else run gh repo create "$REPO" --private --source=. --remote=origin; fi

say "Secrets"
printf '%s' "$DOCKERHUB_USERNAME" | secret DOCKERHUB_USERNAME
printf '%s' "$DOCKERHUB_TOKEN"    | secret DOCKERHUB_TOKEN
printf '%s' "$EC2_HOST"           | secret EC2_HOST
printf '%s' "$EC2_USER"           | secret EC2_USER
secret EC2_SSH_KEY < "$PEM"
ssh-keyscan -t ed25519,ecdsa,rsa "$EC2_HOST" 2>/dev/null | secret EC2_KNOWN_HOSTS
grep '^MONGODB_URI=' server/.env | cut -d= -f2- | secret MONGODB_URI
grep '^ADMIN_EMAIL=' server/.env | cut -d= -f2- | secret ADMIN_EMAIL
# reuse the JWT secret already running on the server so nobody is signed out by the first pipeline deploy
ssh_ec2 "grep '^JWT_SECRET=' /opt/grains/.env.app | cut -d= -f2-" | secret JWT_SECRET

say "Variables (not secret; edit later in GitHub → Settings → Variables)"
run gh variable set CLIENT_ORIGIN --repo "$REPO" --body "http://$EC2_HOST"
run gh variable set COOKIE_SECURE --repo "$REPO" --body "false"   # change to true once the site is served over HTTPS

say "Push (this starts the first pipeline run)"
run git branch -M main
run git push -u origin main

say "Done"
[ "$DRY" = 1 ] || { echo "Watch it: gh run watch --repo $REPO"; echo "Site:     http://$EC2_HOST"; }
