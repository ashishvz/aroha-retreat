#!/bin/bash
# Aroha Retreat — fresh install on a Linux server.
#
# Run this AS THE USER who should own the service, from inside the cloned repo:
#
#   git clone https://github.com/mithunglares/aroha-retreat.git
#   cd aroha-retreat
#   chmod +x deploy/linux-install.sh
#   ./deploy/linux-install.sh [port]
#
# What it does:
#   - installs Node.js, npm and Python3 if missing (Debian/Ubuntu via apt)
#   - npm ci && npm run build
#   - creates .env with a random ADMIN_PASSWORD if one doesn't already exist
#   - generates a systemd unit for THIS user and THIS path, and installs it
#   - enables + starts the service
#   - sets up the nightly database backup cron job (7 rotating copies)
#
# Safe to re-run: it will not overwrite an existing .env, and re-installing
# the systemd unit just restarts the service with the latest build.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${1:-8088}"
SERVICE_NAME="aroha-retreat"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

cd "$ROOT"

echo "==> Installing on: $(hostname)"
echo "==> Repo root:      $ROOT"
echo "==> Port:           $PORT"
echo ""

# --- system packages ----------------------------------------------------
need_apt=""
command -v node    >/dev/null 2>&1 || need_apt="$need_apt nodejs"
command -v npm     >/dev/null 2>&1 || need_apt="$need_apt npm"
command -v python3 >/dev/null 2>&1 || need_apt="$need_apt python3"

if [ -n "$need_apt" ]; then
  echo "==> Installing missing packages:$need_apt"
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo apt-get install -y $need_apt
  else
    echo "apt-get not found — please install these manually first: $need_apt" >&2
    exit 1
  fi
fi

echo "Node:   $(node -v 2>/dev/null || echo missing)"
echo "npm:    $(npm -v 2>/dev/null || echo missing)"
echo "Python: $(python3 --version 2>/dev/null || echo missing)"

# --- build ----------------------------------------------------------------
echo ""
echo "==> npm ci"
npm ci

echo "==> npm run build"
npm run build

# --- .env / admin password -------------------------------------------------
if [ ! -f "$ROOT/.env" ]; then
  umask 077
  echo "ADMIN_PASSWORD=$(python3 -c 'import secrets; print(secrets.token_urlsafe(12))')" > "$ROOT/.env"
  echo "==> Created .env with a random admin password:"
  echo "    $(cat "$ROOT/.env")"
  echo "    Save this somewhere safe — it is only printed once."
else
  echo "==> .env already exists — leaving it alone"
fi

mkdir -p "$ROOT/data"

# --- self-test --------------------------------------------------------------
echo ""
echo "==> Self-test"
python3 "$ROOT/server/app.py" --selftest

# --- systemd unit ------------------------------------------------------
SERVICE_USER="$(id -un)"
echo ""
echo "==> Writing systemd unit for user '$SERVICE_USER' at $ROOT"
sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=Aroha Retreat site + booking API
After=network.target

[Service]
Type=simple
User=$SERVICE_USER
WorkingDirectory=$ROOT
EnvironmentFile=$ROOT/.env
ExecStart=/usr/bin/python3 $ROOT/server/app.py --port $PORT
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"
sleep 1
sudo systemctl --no-pager --full status "$SERVICE_NAME" || true

# --- nightly backup cron (idempotent) -------------------------------------
echo ""
echo "==> Setting up nightly backup cron (03:30, 7 rotating copies)"
( crontab -l 2>/dev/null | grep -v "$SERVICE_NAME-backup" || true; \
  echo "30 3 * * * python3 $ROOT/server/app.py --backup # $SERVICE_NAME-backup" ) | crontab -

echo ""
echo "==> Done."
echo "    Status: sudo systemctl status $SERVICE_NAME"
echo "    Logs:   sudo journalctl -u $SERVICE_NAME -f"
echo "    Open:   http://<this-server-ip>:$PORT"
