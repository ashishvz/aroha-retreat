import Reveal from "./Reveal";
import Book from "./Book";
import { resort } from "../config";
import styles from "./Enquire.module.css";

export default function Enquire() {
  return (
    <section id="enquire" className={`section ${styles.section}`}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.intro}>
          <p className="eyebrow">Book</p>
          <h2 className="display">Plan your stay</h2>
          <hr className="rule" />
          <p className="lead">
            Pick a cottage and your dates to see what&rsquo;s free. We hold the
            room straight away and confirm with you personally &mdash; no payment
            online.
          </p>

          <div className={styles.direct}>
            <a
              className={styles.directLink}
              href={`https://wa.me/${resort.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.directLabel}>WhatsApp</span>
              <span className={styles.directValue}>{resort.phoneDisplay}</span>
            </a>
            <a className={styles.directLink} href={`tel:+${resort.phone}`}>
              <span className={styles.directLabel}>Phone</span>
              <span className={styles.directValue}>{resort.phoneDisplay}</span>
            </a>
            <a className={styles.directLink} href={`mailto:${resort.email}`}>
              <span className={styles.directLabel}>Email</span>
              <span className={styles.directValue}>{resort.email}</span>
            </a>
          </div>

          <p className={styles.houseRule}>{resort.houseRule}</p>
        </Reveal>

        <Reveal delay={130}>
          <Book />
        </Reveal>
      </div>
    </section>
  );
}
