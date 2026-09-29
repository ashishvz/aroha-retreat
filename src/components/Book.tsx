import { useEffect, useState, type FormEvent } from "react";
import { resort, packages, cottages } from "../config";
import { buildWhatsAppUrl } from "../lib/whatsapp";
import form from "./Enquire.module.css";
import styles from "./Book.module.css";

type Avail = { rooms: Record<string, number>; days: Record<string, Record<string, number>> };

/** Local-calendar ISO date (toISOString would give UTC, i.e. yesterday before 5:30am IST). */
const iso = (d: Date) => d.toLocaleDateString("en-CA");
const addDays = (day: string, n: number) => {
  const d = new Date(day + "T00:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
};
const nightsBetween = (a: string, b: string) => {
  const out: string[] = [];
  for (let d = a; d < b; d = addDays(d, 1)) out.push(d);
  return out;
};

const today = iso(new Date());
const RANGE_DAYS = 90;
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function Book() {
  const [pkg, setPkg] = useState<string>("farm");
  const [type, setType] = useState(cottages[0].type);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [month, setMonth] = useState(today.slice(0, 7) + "-01");
  const [avail, setAvail] = useState<Avail | null>(null);
  const [availError, setAvailError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState<number | null>(null);

  const isDay = pkg === "day";
  const pkgName = packages.find((p) => p.id === pkg)?.name ?? pkg;
  const typeName = cottages.find((c) => c.type === type)?.name ?? type;

  const loadAvail = () =>
    fetch(`/api/availability?from=${today}&to=${addDays(today, RANGE_DAYS)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((a: Avail) => (setAvail(a), setAvailError(false)))
      .catch(() => setAvailError(true));

  useEffect(() => {
    loadAvail();
  }, []);

  const freeOn = (day: string) => avail?.days[day]?.[type];
  const total = avail?.rooms[type] ?? 0;

  // rooms free for every night of the chosen stay; undefined = outside loaded range
  const stayNights = checkIn && checkOut > checkIn ? nightsBetween(checkIn, checkOut) : [];
  const stayFree = stayNights.length
    ? stayNights.map(freeOn).reduce<number | undefined>(
        (min, n) => (min === undefined || n === undefined ? undefined : Math.min(min, n)),
        Infinity
      )
    : undefined;

  const pick = (day: string) => {
    setError("");
    if (checkIn && !checkOut && day > checkIn) setCheckOut(day);
    else {
      setCheckIn(day);
      setCheckOut("");
    }
  };

  const whatsapp = (message: string) =>
    buildWhatsAppUrl(resort.whatsapp, {
      name,
      phone,
      pkg: isDay ? pkgName : `${pkgName} — ${typeName}`,
      checkIn,
      checkOut: isDay ? "" : checkOut,
      guests,
      message,
    });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (isDay) {
      window.open(whatsapp(note), "_blank", "noopener");
      return;
    }
    if (!checkOut) return setError("Pick a check-out date.");
    setBusy(true);
    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, package: pkg, check_in: checkIn, check_out: checkOut, guests, name, phone, note }),
      });
      const body = await r.json().catch(() => ({}));
      if (r.ok) setBooked(body.id);
      else if (r.status === 409) setError("Sorry — those dates were just taken. Please pick other dates.");
      else setError(body.error ?? "Something went wrong. Please try again or WhatsApp us.");
    } catch {
      setError("Couldn't reach the booking system. Please WhatsApp us instead.");
    } finally {
      setBusy(false);
      loadAvail();
    }
  };

  if (booked !== null)
    return (
      // the tall form collapses into this card — bring it back into view
      <div className={form.form} ref={(el) => el?.scrollIntoView({ block: "center", behavior: "smooth" })}>
        <div className={form.full}>
          <p className="eyebrow">Room held · ref #{booked}</p>
          <h3 className={styles.doneTitle}>We&rsquo;ve held your room</h3>
          <p>
            {typeName}, {checkIn} → {checkOut}, {guests} guest{guests === "1" ? "" : "s"}. Your booking is{" "}
            <strong>pending</strong> — we&rsquo;ll confirm on WhatsApp or phone shortly.
          </p>
        </div>
        <a
          className={`btn btn-solid ${form.submit}`}
          href={whatsapp(`Booking ref #${booked}${note ? ` — ${note}` : ""}`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Send us your details on WhatsApp
        </a>
      </div>
    );

  return (
    <form className={form.form} onSubmit={onSubmit}>
      <label className={form.full}>
        <span>Package</span>
        <select value={pkg} onChange={(e) => setPkg(e.target.value)}>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — from {p.from}
            </option>
          ))}
        </select>
      </label>

      {!isDay && (
        <label className={form.full}>
          <span>Cottage</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {cottages.map((c) => (
              <option key={c.type} value={c.type}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {!isDay && (
        <Calendar
          month={month}
          setMonth={setMonth}
          freeOn={freeOn}
          total={total}
          checkIn={checkIn}
          checkOut={checkOut}
          onPick={pick}
          failed={availError}
        />
      )}

      <label>
        <span>{isDay ? "Date" : "Check-in"}</span>
        <input
          required
          type="date"
          min={today}
          value={checkIn}
          onChange={(e) => (setCheckIn(e.target.value), checkOut <= e.target.value && setCheckOut(""))}
        />
      </label>
      {!isDay && (
        <label>
          <span>Check-out</span>
          <input
            required
            type="date"
            min={checkIn ? addDays(checkIn, 1) : today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </label>
      )}

      {!isDay && stayNights.length > 0 && (
        <p className={`${form.full} ${styles.status}`} data-state={stayFree === 0 ? "full" : "ok"}>
          {stayFree === undefined
            ? "Checking availability…"
            : stayFree === 0
              ? `No ${typeName} free for all ${stayNights.length} night(s) — try other dates or another cottage.`
              : `${stayFree} room${stayFree === 1 ? "" : "s"} free for your ${stayNights.length} night${stayNights.length === 1 ? "" : "s"}.`}
        </p>
      )}

      <label className={form.full}>
        <span>Guests</span>
        <input required type="number" min={1} max={20} value={guests} onChange={(e) => setGuests(e.target.value)} />
      </label>
      <label>
        <span>Name</span>
        <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </label>
      <label>
        <span>Phone</span>
        <input
          required
          type="tel"
          pattern="[+0-9][0-9 \-]{5,19}"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone or WhatsApp"
        />
      </label>
      <label className={form.full}>
        <span>Message</span>
        <textarea
          rows={2}
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything we should know?"
        />
      </label>

      <button type="submit" className={`btn btn-solid ${form.submit}`} disabled={busy || (!isDay && stayFree === 0)}>
        {isDay ? "Send via WhatsApp" : busy ? "Holding your room…" : "Request booking"}
      </button>
      {error && (
        <p className={form.note} role="alert">
          {error}
        </p>
      )}
      {!isDay && <p className={styles.fine}>No payment now. We hold the room and confirm with you personally.</p>}
    </form>
  );
}

function Calendar(props: {
  month: string;
  setMonth: (m: string) => void;
  freeOn: (day: string) => number | undefined;
  total: number;
  checkIn: string;
  checkOut: string;
  onPick: (day: string) => void;
  failed: boolean;
}) {
  const { month, setMonth, freeOn, total, checkIn, checkOut, onPick, failed } = props;
  const first = new Date(month + "T00:00:00");
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday-first
  const shift = (n: number) => {
    const d = new Date(first.getFullYear(), first.getMonth() + n, 1);
    setMonth(iso(d));
  };
  const lastBookable = addDays(today, RANGE_DAYS - 1);
  const canPrev = month > today.slice(0, 7) + "-01";
  const canNext = addDays(month, daysInMonth) <= lastBookable;

  return (
    <div className={`${form.full} ${styles.cal}`}>
      <div className={styles.calHead}>
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">
          ‹
        </button>
        <strong>{first.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</strong>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month">
          ›
        </button>
      </div>
      <div className={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <span key={i} className={styles.wd}>
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={"x" + i} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = addDays(month, i);
          const free = freeOn(day);
          const out = day < today || day > lastBookable;
          // a full night can still be a check-out day
          const pickingOut = checkIn && !checkOut && day > checkIn;
          const state = out ? "out" : free === undefined ? "unknown" : free === 0 ? "full" : free === 1 && total > 1 ? "few" : "free";
          const selected = day === checkIn || day === checkOut;
          const inRange = checkIn && checkOut && day > checkIn && day < checkOut;
          return (
            <button
              key={day}
              type="button"
              className={styles.day}
              data-state={state}
              data-selected={selected || undefined}
              data-range={inRange || undefined}
              disabled={out || (state === "full" && !pickingOut)}
              onClick={() => onPick(day)}
              aria-label={`${day}: ${free === undefined ? "unknown" : `${free} free`}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className={styles.legend}>
        <span data-state="free">Available</span>
        <span data-state="few">1 left</span>
        <span data-state="full">Full</span>
        {failed && <em>Couldn&rsquo;t load availability — you can still request, we&rsquo;ll check.</em>}
      </div>
    </div>
  );
}
