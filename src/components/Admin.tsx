import { useEffect, useState, type FormEvent } from "react";
import { resort } from "../config";
import form from "./Enquire.module.css";
import styles from "./Admin.module.css";

type Booking = {
  id: number;
  room: string;
  check_in: string;
  check_out: string;
  status: "pending" | "confirmed" | "cancelled" | "blocked";
  package: string | null;
  name: string | null;
  phone: string | null;
  guests: number | null;
  note: string | null;
  created_at: string;
};

const KEY = "aroha-admin";
const readPw = () => {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};

export default function Admin() {
  const [pw, setPw] = useState(readPw);
  const [draft, setDraft] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Record<string, string[]>>({});
  const [showCancelled, setShowCancelled] = useState(false);
  const [error, setError] = useState("");
  const [block, setBlock] = useState({ room: "", check_in: "", check_out: "", note: "" });

  const api = async (path: string, body?: object) => {
    const r = await fetch(path, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${pw}`, "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (r.status === 401) {
      setPw("");
      try {
        sessionStorage.removeItem(KEY);
      } catch {}
    }
    if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
    return data;
  };

  const load = () =>
    api("/api/admin/bookings")
      .then((d) => (setBookings(d.bookings), setRooms(d.rooms), setError("")))
      .catch((e) => setError(e.message));

  useEffect(() => {
    if (pw) load();
  }, [pw]);

  const act = (id: number, status: string) => {
    if (status === "cancelled" && !confirm(`Cancel #${id}? The room becomes free again.`)) return;
    api(`/api/admin/bookings/${id}/status`, { status }).then(load, (e) => setError(e.message));
  };

  const onBlock = (e: FormEvent) => {
    e.preventDefault();
    api("/api/admin/blocks", block)
      .then(() => (setBlock({ ...block, check_in: "", check_out: "", note: "" }), load()))
      .catch((e) => setError(e.message));
  };

  if (!pw)
    return (
      <main className={styles.page}>
        <form
          className={`${form.form} ${styles.login}`}
          onSubmit={(e) => {
            e.preventDefault();
            try {
              sessionStorage.setItem(KEY, draft);
            } catch {}
            setPw(draft);
          }}
        >
          <h1 className={form.full}>{resort.name} — bookings</h1>
          <label className={form.full}>
            <span>Password</span>
            <input type="password" autoFocus required value={draft} onChange={(e) => setDraft(e.target.value)} />
          </label>
          <button className={`btn btn-solid ${form.submit}`}>Sign in</button>
        </form>
      </main>
    );

  const allRooms = Object.values(rooms).flat();
  const shown = bookings.filter((b) => showCancelled || b.status !== "cancelled");
  const pending = bookings.filter((b) => b.status === "pending").length;

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1>Bookings</h1>
        <span>{pending} pending</span>
        <label className={styles.toggle}>
          <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} /> show
          cancelled
        </label>
        <button className="btn btn-line" onClick={load}>
          Refresh
        </button>
      </header>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Dates</th>
              <th>Room</th>
              <th>Status</th>
              <th>Guest</th>
              <th>Note</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((b) => (
              <tr key={b.id} data-status={b.status}>
                <td>{b.id}</td>
                <td className={styles.nowrap}>
                  {b.check_in} → {b.check_out}
                </td>
                <td>{b.room}</td>
                <td>
                  <span className={styles.badge} data-status={b.status}>
                    {b.status}
                  </span>
                </td>
                <td>
                  {b.name && (
                    <>
                      {b.name} · {b.guests} guest{b.guests === 1 ? "" : "s"} · {b.package}
                      <br />
                      <a href={`tel:${b.phone}`}>{b.phone}</a>
                      {" · "}
                      <a href={`https://wa.me/${b.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    </>
                  )}
                </td>
                <td>{b.note}</td>
                <td className={styles.nowrap}>
                  {b.status === "pending" && (
                    <button className={styles.ok} onClick={() => act(b.id, "confirmed")}>
                      Confirm
                    </button>
                  )}
                  {b.status !== "cancelled" && (
                    <button className={styles.cancel} onClick={() => act(b.id, "cancelled")}>
                      {b.status === "blocked" ? "Unblock" : "Cancel"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={7}>No upcoming bookings.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form className={`${form.form} ${styles.block}`} onSubmit={onBlock}>
        <h2 className={form.full}>Block a room</h2>
        <p className={`${form.full} ${styles.hint}`}>For phone bookings, maintenance or the owner&rsquo;s own use.</p>
        <label className={form.full}>
          <span>Room</span>
          <select required value={block.room} onChange={(e) => setBlock({ ...block, room: e.target.value })}>
            <option value="">Choose…</option>
            {allRooms.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          <span>From</span>
          <input
            required
            type="date"
            value={block.check_in}
            onChange={(e) => setBlock({ ...block, check_in: e.target.value })}
          />
        </label>
        <label>
          <span>Until (check-out)</span>
          <input
            required
            type="date"
            min={block.check_in}
            value={block.check_out}
            onChange={(e) => setBlock({ ...block, check_out: e.target.value })}
          />
        </label>
        <label className={form.full}>
          <span>Note</span>
          <input
            value={block.note}
            maxLength={500}
            onChange={(e) => setBlock({ ...block, note: e.target.value })}
            placeholder="e.g. Phone booking — Ravi, 98xxxxxx"
          />
        </label>
        <button className={`btn btn-solid ${form.submit}`}>Block room</button>
      </form>
    </main>
  );
}
