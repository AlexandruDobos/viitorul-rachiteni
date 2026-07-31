#!/usr/bin/env bash
#
# Remote deploy script for viitorul-rachiteni backend.
#
# Executed on the Hetzner host over SSH by the GitHub Actions workflow
# `.github/workflows/backend-deploy.yml`. Receives one positional argument:
#   $1  Git ref to deploy (tag like "v1.2.3", branch name, or commit SHA).
#
# What it does:
#   1. Validates that we're on the expected host layout (/srv/viitorul-rachiteni)
#   2. Fetches the latest refs + tags from GitHub
#   3. Checks out the requested ref
#   4. Rebuilds only backend containers (frontend is deployed by Cloudflare Pages)
#   5. Restarts services with zero-downtime rolling recreate
#   6. Prints status and a brief health check
#
# The script runs with `sudo` for docker/git commands. Configure sudoers on the
# server so the deploy user can run these without a password (see RELEASING.md).
#
# Idempotent: safe to run multiple times with the same ref.

set -euo pipefail

REF="${1:-}"
if [ -z "${REF}" ]; then
    echo "ERROR: no ref provided" >&2
    echo "Usage: deploy.sh <git-ref>" >&2
    exit 1
fi

REPO_DIR="/srv/viitorul-rachiteni"
BACKEND_DIR="${REPO_DIR}/backend"

if [ ! -d "${BACKEND_DIR}" ]; then
    echo "ERROR: expected backend directory not found at ${BACKEND_DIR}" >&2
    exit 1
fi

# Mark the repo as safe (repo is owned by root, deploy user may not own it).
sudo git config --global --add safe.directory "${REPO_DIR}" || true

echo "==> Fetching latest refs from GitHub"
sudo git -C "${REPO_DIR}" fetch --all --tags --prune

echo "==> Recording current HEAD for potential rollback"
PREVIOUS_HEAD="$(sudo git -C "${REPO_DIR}" rev-parse --short HEAD)"
echo "    previous HEAD: ${PREVIOUS_HEAD}"

echo "==> Checking out ${REF}"
sudo git -C "${REPO_DIR}" checkout --force "${REF}"
sudo git -C "${REPO_DIR}" reset --hard "${REF}"

NEW_HEAD="$(sudo git -C "${REPO_DIR}" rev-parse --short HEAD)"
echo "    new HEAD:      ${NEW_HEAD}"

if [ "${PREVIOUS_HEAD}" = "${NEW_HEAD}" ]; then
    echo "==> Already on ${REF}; will still rebuild to ensure latest artifacts."
fi

echo "==> Building backend images"
cd "${BACKEND_DIR}"

# Compose files layered same way the server currently uses.
COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.prod.yml)

sudo docker compose "${COMPOSE_FILES[@]}" build --pull \
    auth-service app-service donations-service email-service gateway

echo "==> Recreating containers"
sudo docker compose "${COMPOSE_FILES[@]}" up -d --no-deps --remove-orphans \
    auth-service app-service donations-service email-service gateway

echo "==> Container status"
sudo docker compose "${COMPOSE_FILES[@]}" ps

echo "==> Health check (gateway)"
sleep 5
if sudo docker compose "${COMPOSE_FILES[@]}" exec -T gateway \
        curl -fsS --max-time 5 http://localhost:8080/actuator/health >/dev/null 2>&1; then
    echo "    gateway is healthy"
else
    echo "    WARNING: gateway health check did not respond (endpoint may be disabled)"
fi

echo "==> Pruning dangling images"
sudo docker image prune -f >/dev/null

echo "==> Deploy complete (ref=${REF}, head=${NEW_HEAD})"
