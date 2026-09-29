#!/bin/bash
# Inspect / point ngrok on the Pi at Aaroha (port 8088).
# Usage: ./deploy/expose.sh [ashishvz@192.168.1.19]

set -euo pipefail

PI_HOST="${1:-ashishvz@192.168.1.19}"

ssh -t "$PI_HOST" bash -s <<'EOF'
set -euo pipefail

echo "=== ngrok binary ==="
command -v ngrok || { echo "ngrok not in PATH"; ls /usr/local/bin/ngrok /home/ashishvz/ngrok 2>/dev/null || true; }

echo ""
echo "=== running ngrok? ==="
ps aux | grep -i '[n]grok' || echo "(none)"

echo ""
echo "=== systemd units ==="
systemctl list-units --type=service --all 2>/dev/null | grep -i ngrok || true
systemctl --user list-units --type=service --all 2>/dev/null | grep -i ngrok || true
ls /etc/systemd/system/*ngrok* ~/.config/systemd/user/*ngrok* 2>/dev/null || true

echo ""
echo "=== ngrok config files ==="
for f in \
  "$HOME/.config/ngrok/ngrok.yml" \
  "$HOME/.ngrok2/ngrok.yml" \
  /etc/ngrok.yml \
  /opt/ngrok/ngrok.yml
do
  if [ -f "$f" ]; then
    echo "--- $f ---"
    # hide authtoken
    sed -E 's/(authtoken:.+)/authtoken: ***REDACTED***/' "$f"
  fi
done

echo ""
echo "=== local API tunnels (4040) ==="
curl -sS -m 3 http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -m json.tool 2>/dev/null \
  || curl -sS -m 3 http://127.0.0.1:4040/api/tunnels 2>/dev/null \
  || echo "(ngrok API not on :4040)"

echo ""
echo "=== aaroha service ==="
systemctl is-active aaroha 2>/dev/null || true
curl -sS -m 2 -o /dev/null -w "local 8088 → %{http_code}\n" http://127.0.0.1:8088/ || true

echo ""
echo "If ngrok is free-tier (1 tunnel), stop the current tunnel and start Aaroha:"
echo "  pkill ngrok || sudo systemctl stop ngrok"
echo "  ngrok http 8088 --log=stdout"
echo ""
echo "Or with a named tunnel in ~/.config/ngrok/ngrok.yml:"
echo "  tunnels:"
echo "    aaroha:"
echo "      proto: http"
echo "      addr: 8088"
echo "  ngrok start aaroha"
EOF
