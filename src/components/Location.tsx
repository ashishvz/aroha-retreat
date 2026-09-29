import Reveal from "./Reveal";
import { resort } from "../config";
import styles from "./Location.module.css";

const notes = [
  {
    label: "By car",
    body: "Roughly 1.5 hours from Bengaluru down Kanakapura Road — the last stretch is a farm track, so take it slow.",
  },
  {
    label: "Transport",
    body: "Getting here is on you; we don't run a pickup from Bengaluru. Happy to suggest a driver.",
  },
  {
    label: "The pin",
    body: "Search Hrudhi Farms on Google Maps, or open the pin below — we'll WhatsApp it once your dates are confirmed.",
  },
];

export default function Location() {
  return (
    <section id="location" className="section">
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.copy}>
          <p className="eyebrow">Getting here</p>
          <h2 className="display">Finding the farm</h2>
          <hr className="rule" />
          <p className={styles.address}>{resort.address}</p>

          <dl className={styles.notes}>
            {notes.map((n) => (
              <div key={n.label}>
                <dt>{n.label}</dt>
                <dd>{n.body}</dd>
              </div>
            ))}
          </dl>

          <a
            className="btn btn-line"
            href={resort.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps
          </a>
        </Reveal>

        <Reveal className={styles.mapWrap} delay={130}>
          <iframe
            title="Map to Aroha Retreat"
            className={styles.map}
            src={resort.mapEmbedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Reveal>
      </div>
    </section>
  );
}
