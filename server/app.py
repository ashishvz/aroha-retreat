#!/usr/bin/env python3
"""
Aroha Retreat — static site + booking API. Stdlib only (runs on the Pi Zero).

  python3 server/app.py [--dist DIR] [--port 8088] [--db FILE] [--rooms FILE]
  python3 server/app.py --selftest
  python3 server/app.py --backup      # nightly cron: data/backup-<Mon..Sun>.db, 7 rotating copies

Rooms come from rooms.json; bookings live in SQLite. An owner's room block is a
booking with status 'blocked'. A room is taken for night d if a non-cancelled
booking has check_in <= d < check_out, so check-out day is free for the next guest.
Admin endpoints need `Authorization: Bearer $ADMIN_PASSWORD`.
"""

import argparse
import hmac
import json
import os
import re
import sqlite3
import threading
import time
from datetime import date, datetime, timedelta
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

HERE = Path(__file__).resolve().parent
ACTIVE = ("pending", "confirmed", "blocked")
PACKAGES = ("farm", "retreat")
MAX_NIGHTS = 14
MAX_AHEAD_DAYS = 365
MAX_RANGE_DAYS = 92
MAX_BODY = 10_000

SCHEMA = """
CREATE TABLE IF NOT EXISTS bookings (
  id         INTEGER PRIMARY KEY,
  room       TEXT NOT NULL,
  check_in   TEXT NOT NULL,
  check_out  TEXT NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('pending','confirmed','cancelled','blocked')),
  package    TEXT,
  name       TEXT,
  phone      TEXT,
  guests     INTEGER,
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS bookings_dates ON bookings (check_in, check_out);
"""


class Conflict(Exception):
    pass


class Invalid(Exception):
    pass


# ------------------------------------------------------------------ core logic


def connect(db_path):
    conn = sqlite3.connect(db_path, isolation_level=None, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.executescript(SCHEMA)
    return conn


def load_rooms(path):
    data = json.loads(Path(path).read_text())
    rooms = {k: v for k, v in data.items() if not k.startswith("_")}
    names = [n for v in rooms.values() for n in v]
    assert len(names) == len(set(names)), "room names must be unique"
    return rooms


def parse_day(s, field):
    try:
        return date.fromisoformat(str(s))
    except ValueError:
        raise Invalid(f"{field} must be YYYY-MM-DD")


def parse_stay(check_in, check_out, today):
    ci, co = parse_day(check_in, "check_in"), parse_day(check_out, "check_out")
    if ci < today:
        raise Invalid("check_in is in the past")
    if ci > today + timedelta(days=MAX_AHEAD_DAYS):
        raise Invalid("check_in is too far ahead")
    nights = (co - ci).days
    if not 1 <= nights <= MAX_NIGHTS:
        raise Invalid(f"stay must be 1–{MAX_NIGHTS} nights")
    return ci, co


def room_is_free(conn, room, ci, co):
    row = conn.execute(
        f"SELECT 1 FROM bookings WHERE room = ? AND status IN {ACTIVE}"
        " AND check_in < ? AND check_out > ? LIMIT 1",
        (room, co.isoformat(), ci.isoformat()),
    ).fetchone()
    return row is None


def availability(conn, rooms, start, end):
    """{'YYYY-MM-DD': {type: free_rooms}} for each night in [start, end)."""
    taken = {}  # night -> set(room)
    for b in conn.execute(
        f"SELECT room, check_in, check_out FROM bookings WHERE status IN {ACTIVE}"
        " AND check_in < ? AND check_out > ?",
        (end.isoformat(), start.isoformat()),
    ):
        d = max(date.fromisoformat(b["check_in"]), start)
        last = min(date.fromisoformat(b["check_out"]), end)
        while d < last:
            taken.setdefault(d, set()).add(b["room"])
            d += timedelta(days=1)
    out, d = {}, start
    while d < end:
        busy = taken.get(d, set())
        out[d.isoformat()] = {t: sum(r not in busy for r in names) for t, names in rooms.items()}
        d += timedelta(days=1)
    return out


def hold_room(conn, rooms, room_type, ci, co, status, **fields):
    """Atomically take the first free room of room_type (or the named room). Raises Conflict."""
    candidates = [fields.pop("room")] if fields.get("room") else rooms.get(room_type, [])
    # ponytail: SQLite write lock serialises all bookings; fine for one small resort.
    conn.execute("BEGIN IMMEDIATE")
    try:
        for room in candidates:
            if room_is_free(conn, room, ci, co):
                cur = conn.execute(
                    "INSERT INTO bookings (room, check_in, check_out, status, package, name, phone, guests, note)"
                    " VALUES (?,?,?,?,?,?,?,?,?)",
                    (room, ci.isoformat(), co.isoformat(), status, fields.get("package"),
                     fields.get("name"), fields.get("phone"), fields.get("guests"), fields.get("note")),
                )
                conn.execute("COMMIT")
                return cur.lastrowid, room
        raise Conflict("no room free for those dates")
    except BaseException:
        conn.execute("ROLLBACK")
        raise


def set_status(conn, booking_id, status):
    row = conn.execute("SELECT status FROM bookings WHERE id = ?", (booking_id,)).fetchone()
    if row is None:
        raise Invalid("no such booking")
    allowed = {"confirmed": ("pending",), "cancelled": ACTIVE}
    if status not in allowed or row["status"] not in allowed[status]:
        raise Invalid(f"cannot change {row['status']} to {status}")
    conn.execute("UPDATE bookings SET status = ? WHERE id = ?", (status, booking_id))


def clean_guest_booking(body, rooms, today):
    ci, co = parse_stay(body.get("check_in"), body.get("check_out"), today)
    room_type = body.get("type")
    if room_type not in rooms:
        raise Invalid("unknown room type")
    if body.get("package") not in PACKAGES:
        raise Invalid("unknown package")
    name = str(body.get("name", "")).strip()
    phone = str(body.get("phone", "")).strip()
    note = str(body.get("note", "")).strip()
    if not 1 <= len(name) <= 80:
        raise Invalid("name is required")
    if not re.fullmatch(r"[+\d][\d\s-]{5,19}", phone):
        raise Invalid("phone looks wrong")
    if len(note) > 500:
        raise Invalid("note is too long")
    try:
        guests = int(body.get("guests"))
    except (TypeError, ValueError):
        raise Invalid("guests must be a number")
    if not 1 <= guests <= 20:
        raise Invalid("guests must be 1–20")
    return room_type, ci, co, dict(package=body["package"], name=name, phone=phone, guests=guests, note=note)


# ---------------------------------------------------------------------- http


class RateLimit:
    """ponytail: in-memory, per-process; resets on restart. Fine behind one ngrok tunnel."""

    def __init__(self, limit, window):
        self.limit, self.window, self.hits, self.lock = limit, window, {}, threading.Lock()

    def allow(self, key):
        now = time.monotonic()
        with self.lock:
            recent = [t for t in self.hits.get(key, []) if now - t < self.window]
            if len(recent) >= self.limit:
                self.hits[key] = recent
                return False
            self.hits[key] = recent + [now]
            return True


class Handler(SimpleHTTPRequestHandler):
    app = None  # set in serve()

    # ---- plumbing

    def send_json(self, status, payload):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY:
            raise Invalid("request too large")
        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            raise Invalid("bad json")
        if not isinstance(body, dict):
            raise Invalid("bad json")
        return body

    def client_ip(self):
        fwd = self.headers.get("X-Forwarded-For")
        return fwd.split(",")[0].strip() if fwd else self.client_address[0]

    def is_admin(self):
        pw = self.app["admin_password"]
        got = self.headers.get("Authorization", "").removeprefix("Bearer ")
        return bool(pw) and hmac.compare_digest(got.encode(), pw.encode())

    def api(self, method):
        url = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(url.query).items()}
        rooms, today = self.app["rooms"], date.today()
        conn = connect(self.app["db"])
        try:
            if method == "GET" and url.path == "/api/availability":
                start = parse_day(q.get("from", today.isoformat()), "from")
                end = parse_day(q.get("to", (start + timedelta(days=62)).isoformat()), "to")
                if not 0 < (end - start).days <= MAX_RANGE_DAYS:
                    raise Invalid(f"range must be 1–{MAX_RANGE_DAYS} days")
                counts = {t: len(n) for t, n in rooms.items()}
                return self.send_json(200, {"rooms": counts, "days": availability(conn, rooms, start, end)})

            if method == "POST" and url.path == "/api/bookings":
                if not self.app["limiter"].allow(self.client_ip()):
                    return self.send_json(429, {"error": "too many booking requests, try later"})
                room_type, ci, co, fields = clean_guest_booking(self.read_json(), rooms, today)
                bid, _ = hold_room(conn, rooms, room_type, ci, co, "pending", **fields)
                return self.send_json(201, {"id": bid, "status": "pending"})

            if url.path.startswith("/api/admin/"):
                if not self.is_admin():
                    return self.send_json(401, {"error": "wrong password"})
                return self.admin(method, url.path, q, conn, rooms, today)

            return self.send_json(404, {"error": "not found"})
        except Invalid as e:
            return self.send_json(400, {"error": str(e)})
        except Conflict as e:
            return self.send_json(409, {"error": str(e)})
        finally:
            conn.close()

    def admin(self, method, path, q, conn, rooms, today):
        if method == "GET" and path == "/api/admin/bookings":
            since = parse_day(q.get("from", (today - timedelta(days=7)).isoformat()), "from")
            rows = conn.execute(
                "SELECT * FROM bookings WHERE check_out >= ? ORDER BY check_in, room", (since.isoformat(),)
            ).fetchall()
            return self.send_json(200, {"rooms": rooms, "bookings": [dict(r) for r in rows]})

        m = re.fullmatch(r"/api/admin/bookings/(\d+)/status", path)
        if method == "POST" and m:
            set_status(conn, int(m.group(1)), self.read_json().get("status"))
            return self.send_json(200, {"ok": True})

        if method == "POST" and path == "/api/admin/blocks":
            body = self.read_json()
            room = body.get("room")
            room_type = next((t for t, names in rooms.items() if room in names), None)
            if room_type is None:
                raise Invalid("unknown room")
            ci, co = parse_stay(body.get("check_in"), body.get("check_out"), today)
            note = str(body.get("note", ""))[:500]
            bid, _ = hold_room(conn, rooms, room_type, ci, co, "blocked", room=room, note=note)
            return self.send_json(201, {"id": bid, "status": "blocked"})

        return self.send_json(404, {"error": "not found"})

    # ---- routing

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self.api("GET")
        # SPA fallback: unknown paths (e.g. /admin) get index.html
        path = urlparse(self.path).path
        if not Path(self.translate_path(path)).exists():
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/api/"):
            return self.api("POST")
        self.send_error(HTTPStatus.METHOD_NOT_ALLOWED)

    def log_message(self, fmt, *args):
        print(f"{datetime.now():%Y-%m-%d %H:%M:%S} {self.client_ip()} {fmt % args}", flush=True)


def serve(args):
    Handler.app = {
        "db": args.db,
        "rooms": load_rooms(args.rooms),
        "admin_password": os.environ.get("ADMIN_PASSWORD", ""),
        "limiter": RateLimit(10, 3600),
    }
    Path(args.db).parent.mkdir(parents=True, exist_ok=True)
    connect(args.db).close()
    if not Handler.app["admin_password"]:
        print("WARNING: ADMIN_PASSWORD not set — /api/admin is disabled", flush=True)
    httpd = ThreadingHTTPServer(("0.0.0.0", args.port), partial(Handler, directory=args.dist))
    print(f"Serving {args.dist} + /api on :{args.port} (db {args.db})", flush=True)
    httpd.serve_forever()


def backup(db_path):
    dest = Path(db_path).with_name(f"backup-{date.today():%a}.db")
    src, dst = sqlite3.connect(db_path), sqlite3.connect(dest)
    src.backup(dst)
    src.close(), dst.close()
    print(f"backed up to {dest}")


# ------------------------------------------------------------------ selftest


def selftest():
    import tempfile

    rooms = {"aframe": ["A1", "A2"], "verandah": ["V1"]}
    today = date(2030, 1, 1)
    d = lambda n: today + timedelta(days=n)
    with tempfile.TemporaryDirectory() as tmp:
        conn = connect(os.path.join(tmp, "t.db"))
        guest = dict(package="farm", name="Asha", phone="9999999999", guests=2, note="")

        b1, r1 = hold_room(conn, rooms, "aframe", d(0), d(2), "pending", **guest)
        b2, r2 = hold_room(conn, rooms, "aframe", d(1), d(3), "pending", **guest)
        assert {r1, r2} == {"A1", "A2"}, "second booking gets the other room"
        try:
            hold_room(conn, rooms, "aframe", d(1), d(2), "pending", **guest)
            raise AssertionError("third overlapping booking must conflict")
        except Conflict:
            pass

        # check-out day is free for the next guest
        b3, r3 = hold_room(conn, rooms, "aframe", d(2), d(3), "pending", **guest)
        assert r3 == r1, "same-day turnover reuses the room"

        a = availability(conn, rooms, d(0), d(4))
        assert a[d(0).isoformat()] == {"aframe": 1, "verandah": 1}
        assert a[d(1).isoformat()]["aframe"] == 0
        assert a[d(3).isoformat()]["aframe"] == 2

        # cancel frees the room; cancelled can't be re-confirmed
        set_status(conn, b2, "cancelled")
        assert availability(conn, rooms, d(1), d(2))[d(1).isoformat()]["aframe"] == 1
        try:
            set_status(conn, b2, "confirmed")
            raise AssertionError("cancelled booking must not be confirmable")
        except Invalid:
            pass
        set_status(conn, b1, "confirmed")

        # owner block on a specific room
        hold_room(conn, rooms, "verandah", d(5), d(7), "blocked", room="V1", note="repairs")
        assert availability(conn, rooms, d(5), d(6))[d(5).isoformat()]["verandah"] == 0
        try:
            hold_room(conn, rooms, "verandah", d(6), d(8), "pending", **guest)
            raise AssertionError("blocked room must not be bookable")
        except Conflict:
            pass

        # validation
        good = dict(type="aframe", package="farm", check_in=d(10).isoformat(), check_out=d(12).isoformat(),
                    name="Asha", phone="+91 99999 99999", guests="2")
        assert clean_guest_booking(good, rooms, today)[0] == "aframe"
        for bad in (dict(check_in=d(-1).isoformat()), dict(check_out=d(10).isoformat()),
                    dict(check_out=d(40).isoformat()), dict(type="x"), dict(phone="abc"),
                    dict(name=""), dict(guests="0"), dict(package="day")):
            try:
                clean_guest_booking({**good, **bad}, rooms, today)
                raise AssertionError(f"should reject {bad}")
            except Invalid:
                pass

        rl = RateLimit(2, 60)
        assert rl.allow("ip") and rl.allow("ip") and not rl.allow("ip") and rl.allow("other")
        conn.close()
    print("ok: selftest")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--dist", default=str(HERE.parent / "dist"))
    p.add_argument("--port", type=int, default=8088)
    p.add_argument("--db", default=str(HERE.parent / "data" / "bookings.db"))
    p.add_argument("--rooms", default=str(HERE / "rooms.json"))
    p.add_argument("--selftest", action="store_true")
    p.add_argument("--backup", action="store_true")
    a = p.parse_args()
    selftest() if a.selftest else backup(a.db) if a.backup else serve(a)
