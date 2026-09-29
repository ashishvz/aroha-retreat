# Aroha Retreat — website

A farm-stay / meditation retreat website for Hrudhi Farms, Kanakapura. Vite + React +
TypeScript frontend, with a small stdlib-only Python backend that serves the built site
and a booking API.

- Frontend: `src/` (Vite, React, TypeScript, CSS Modules)
- Backend: `server/app.py` (Python 3, no third-party packages — serves `dist/` and `/api/*`)
- Data: SQLite (`data/bookings.db`) + `server/rooms.json` for room inventory
- Content: `src/config.ts` — packages, rates, inclusions, cottages, experiences, and the
  photo/video gallery all live here as plain data

---

## 1. Local development

### Windows

Double-click scripts are in `scripts/`:

| Script          | Does                                             |
|-----------------|---------------------------------------------------|
| `install.bat`   | installs npm + Python dependencies                |
| `start.bat`     | starts the Vite dev server and the API together    |
| `stop.bat`      | stops both                                         |
| `status.bat`    | shows whether they're currently running            |

Run `install.bat` once, then `start.bat`. Once running, open **http://localhost:5173** —
the Vite dev server proxies `/api/*` requests to the Python backend on port 8088
automatically (see `vite.config.ts`).

These `.bat` files are thin wrappers around `scripts/run.ps1`, which does the actual
work (installing, starting/stopping processes, writing PID/log files under `.run/`).

### macOS / Linux (or manually, anywhere)

```bash
npm install

# terminal 1 — frontend
npm run dev

# terminal 2 — backend / API
python3 server/app.py
```

Open **http://localhost:5173**.

### Production preview locally

```bash
npm run build     # outputs to dist/
npm run preview   # serves the production build via Vite
```

or serve the real production stack (build + Python backend, same as a live server):

```bash
npm run build
python3 server/app.py --port 8088
```

Open **http://localhost:8088**.

---

## 2. Deploying to a Linux server

Two scripts in `deploy/` handle this: **`linux-install.sh`** for a fresh server, and
**`linux-update.sh`** to pull and deploy new changes afterwards. Both are meant to be
run *on the server itself*, as the user who should own the process (not from your own
machine over SSH).

### First-time install

```bash
git clone https://github.com/mithunglares/aroha-retreat.git
cd aroha-retreat
chmod +x deploy/linux-install.sh deploy/linux-update.sh
./deploy/linux-install.sh          # defaults to port 8088
# or: ./deploy/linux-install.sh 8080
```

This script:

1. Installs Node.js, npm and Python 3 via `apt` if any are missing.
2. Runs `npm ci && npm run build`.
3. Creates a `.env` file with a random `ADMIN_PASSWORD` if one doesn't exist yet
   (printed once to the terminal — save it somewhere safe).
4. Generates a `systemd` unit (`aroha-retreat.service`) for the current user and repo
   path, installs it to `/etc/systemd/system/`, and enables + starts it.
5. Adds a nightly cron job (03:30) that runs `server/app.py --backup`, keeping 7
   rotating database backups.

It's safe to re-run — it won't overwrite an existing `.env`, and re-running just
rebuilds and restarts the service.

Requires `sudo` for installing packages, writing the systemd unit, and managing the
service and crontab.

### Updating after a `git push`

```bash
cd aroha-retreat
./deploy/linux-update.sh
```

This pulls the latest commit, reinstalls dependencies, rebuilds, runs the self-test,
and restarts the `aroha-retreat` service.

### Managing the service

```bash
sudo systemctl status aroha-retreat        # is it running?
sudo systemctl restart aroha-retreat       # restart
sudo systemctl stop aroha-retreat          # stop
sudo journalctl -u aroha-retreat -f        # live logs
```

### Reverse proxy / HTTPS

The scripts above only get the site running on plain HTTP at the chosen port. Putting
it behind `nginx` with a real domain and `certbot` for HTTPS is a separate, optional
step not covered here — ask if you'd like a script for that once a domain is decided.

### Legacy Raspberry Pi scripts

`deploy/deploy.sh`, `deploy/aaroha.service`, `deploy/expose.sh` and
`deploy/ngrok-aaroha.sh` are older, Pi-specific scripts (SSH-push deploy to a
particular Raspberry Pi, plus an ngrok tunnel). They're left as-is in case that Pi
deployment is still in use, but they're unrelated to `linux-install.sh` /
`linux-update.sh` above and predate the "Aroha Retreat" name.

---

## 3. Environment variables

| Variable         | Effect                                                                 |
|------------------|--------------------------------------------------------------------------|
| `ADMIN_PASSWORD` | Enables the `/admin` bookings page. If unset, the backend logs a warning and disables `/api/admin`. |

Set it in a `.env` file next to `server/app.py` (already handled by
`linux-install.sh`), which the systemd unit loads via `EnvironmentFile=`.

---

## 4. `server/app.py` reference

```
python3 server/app.py [--dist DIR] [--port 8088] [--db FILE] [--rooms FILE] [--selftest] [--backup]
```

| Flag         | Default                | Purpose                                            |
|--------------|-------------------------|------------------------------------------------------|
| `--dist`     | `<repo>/dist`            | Static files to serve                                |
| `--port`     | `8088`                    | HTTP port                                            |
| `--db`       | `<repo>/data/bookings.db` | SQLite database path                                 |
| `--rooms`    | `server/rooms.json`       | Room inventory config                                |
| `--selftest` | —                          | Validates config/DB and exits (used before restarts) |
| `--backup`   | —                          | Writes a rotating backup (`data/backup-<Mon..Sun>.db`), run nightly via cron |

---

## 5. Editing content

Almost all copy and data lives in **`src/config.ts`**: resort details, packages,
rates/tariffs, the inclusions comparison table, cottages, experiences, and the
`moments` gallery array.

To add a new photo or video to the "Moments" gallery: drop the file into
`public/gallery/photos/` or `public/gallery/videos/` (plus a matching thumbnail in
`thumbs/` for a photo, or a poster frame in `posters/` for a video), then add one
entry to the `moments` array in `src/config.ts`. No other code changes are needed —
see the doc comment above that array for the exact shape.
