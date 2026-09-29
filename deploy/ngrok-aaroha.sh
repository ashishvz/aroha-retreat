#!/bin/bash
# Point Pi ngrok at Aaroha (:8088). Stops existing ngrok first (free tier = 1 tunnel).
# Usage: ./deploy/ngrok-aaroha.sh [ashishvz@192.168.1.19]

set -euo pipefail

PI_HOST="${1:-ashishvz@192.168.1.19}"

ssh -t "$PI_HOST" bash -s <<'EOF'
set -euo pipefail

# ensure site is up
sudo systemctl start aaroha
curl -sf -m 3 -o /dev/null http://127.0.0.1:8088/ || { echo "Aaroha not serving on :8088"; exit 1; }

NGROK="$(command -v ngrok || true)"
if [ -z "$NGROK" ]; then
  for c in /usr/local/bin/ngrok /home/ashishvz/ngrok /usr/bin/ngrok; do
    [ -x "$c" ] && NGROK="$c" && break
  done
fi
[ -n "$NGROK" ] || { echo "ngrok not found on Pi"; exit 1; }

# stop systemd ngrok if present
if systemctl list-unit-files 2>/dev/null | grep -q '^ngrok'; then
  sudo systemctl stop ngrok || true
fi
if systemctl --user list-unit-files 2>/dev/null | grep -q '^ngrok'; then
  systemctl --user stop ngrok || true
fi
pkill -x ngrok 2>/dev/null || true
sleep 1

# prefer named tunnel if config has "aaroha"
CFG=""
for f in "$HOME/.config/ngrok/ngrok.yml" "$HOME/.ngrok2/ngrok.yml"; do
  [ -f "$f" ] && CFG="$f" && break
done

mkdir -p "$HOME/.config/ngrok" "$HOME/logs"
if [ -n "$CFG" ] && grep -q '^\s*aaroha:' "$CFG" 2>/dev/null; then
  echo "Starting named tunnel 'aaroha'..."
  nohup "$NGROK" start aaroha --log=stdout > "$HOME/logs/ngrok-aaroha.log" 2>&1 &
else
  echo "Starting: ngrok http 8088 ..."
  nohup "$NGROK" http 8088 --log=stdout > "$HOME/logs/ngrok-aaroha.log" 2>&1 &
fi

# wait for API
for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 1
  URL="$(curl -sS -m 2 http://127.0.0.1:4040/api/tunnels 2>/dev/null \
    | python3 -c 'import sys,json; d=json.load(sys.stdin); print(next((t["public_url"] for t in d.get("tunnels",[]) if t["public_url"].startswith("https")), ""))' 2>/dev/null || true)"
  if [ -n "$URL" ]; then
    echo ""
    echo "Public URL: $URL"
    echo "$URL" > "$HOME/aaroha/ngrok-url.txt"
    exit 0
  fi
done

echo "ngrok started but no public URL yet. Check:"
echo "  curl -s http://127.0.0.1:4040/api/tunnels"
echo "  tail -50 ~/logs/ngrok-aaroha.log"
exit 1
EOF
