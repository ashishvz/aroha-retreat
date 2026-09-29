#!/bin/bash
# Aroha Retreat — pull the latest code, rebuild, and restart the service.
# Run this ON THE SERVER, from inside the repo, after linux-install.sh has
# already been run once.
#
# Usage:
#   cd aroha-retreat
#   ./deploy/linux-update.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_NAME="aroha-retreat"

cd "$ROOT"

echo "==> git pull"
git pull --ff-only

echo "==> npm ci"
npm ci

echo "==> npm run build"
npm run build

echo "==> Self-test"
python3 "$ROOT/server/app.py" --selftest

echo "==> Restarting $SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"
sleep 1
sudo systemctl --no-pager --full status "$SERVICE_NAME" || true

echo ""
echo "==> Done."
echo "    Logs: sudo journalctl -u $SERVICE_NAME -f"
