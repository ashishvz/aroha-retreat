#!/bin/bash
# Build Aaroha Retreats and deploy static files to the Raspberry Pi.
# Usage: ./deploy/deploy.sh [ashishvz@192.168.1.19]
#
# Serves on port 8088 so Pi-hole keeps :80 and house-tracker keeps :8090.
# Open: http://192.168.1.19:8088

set -euo pipefail

PI_HOST="${1:-ashishvz@192.168.1.19}"
REMOTE_DIR="/home/ashishvz/aaroha"
PORT=8088
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

echo "Building..."
npm run build

echo "Syncing dist → $PI_HOST:$REMOTE_DIR ..."
ssh "$PI_HOST" "mkdir -p '$REMOTE_DIR/dist' '$REMOTE_DIR/deploy' '$REMOTE_DIR/server' '$REMOTE_DIR/data'"
rsync -avz --delete \
  "$ROOT/dist/" \
  "$PI_HOST:$REMOTE_DIR/dist/"

# server code only — data/ (the bookings DB) is never touched by rsync
rsync -avz --delete --exclude __pycache__ \
  "$ROOT/server/" \
  "$PI_HOST:$REMOTE_DIR/server/"

rsync -avz \
  "$ROOT/deploy/aaroha.service" \
  "$PI_HOST:$REMOTE_DIR/deploy/aaroha.service"

echo "Installing / restarting systemd service..."
ssh "$PI_HOST" bash -s <<EOF
set -euo pipefail
python3 "$REMOTE_DIR/server/app.py" --selftest
if [ ! -f "$REMOTE_DIR/.env" ]; then
  umask 077
  echo "ADMIN_PASSWORD=\$(python3 -c 'import secrets; print(secrets.token_urlsafe(12))')" > "$REMOTE_DIR/.env"
  echo "Created $REMOTE_DIR/.env with a random admin password — read it with: ssh $PI_HOST cat $REMOTE_DIR/.env"
fi
# nightly DB backup, 7 rotating copies (idempotent)
# "|| true": no crontab yet (or nothing left after grep) must not trip set -e
( crontab -l 2>/dev/null | grep -v 'aaroha-backup' || true; echo "30 3 * * * python3 $REMOTE_DIR/server/app.py --backup # aaroha-backup" ) | crontab -
sudo cp "$REMOTE_DIR/deploy/aaroha.service" /etc/systemd/system/aaroha.service
sudo systemctl daemon-reload
sudo systemctl enable aaroha
sudo systemctl restart aaroha
sudo systemctl --no-pager --full status aaroha || true
EOF

echo ""
echo "Done. Open http://192.168.1.19:$PORT"
echo "Optional Pi-hole Local DNS: aaroha.lan → 192.168.1.19  then http://aaroha.lan:$PORT"
