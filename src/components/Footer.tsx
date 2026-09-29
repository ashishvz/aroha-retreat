import { resort } from "../config";
import styles from "./Footer.module.css";

const links = [
  { href: "#intro", label: "The farm" },
  { href: "#packages", label: "Packages" },
  { href: "#rates", label: "Rates" },
  { href: "#cottages", label: "Cottages" },
  { href: "#experiences", label: "Experiences" },
  { href: "#location", label: "Location" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <img
          className={styles.logo}
          src="/logo-full.webp"
          alt={`${resort.name} — ${resort.tagline}`}
          loading="lazy"
        />

        <div className={styles.cols}>
          <nav className={styles.col} aria-label="Footer">
            <p className={styles.colTitle}>Explore</p>
            {links.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className={styles.col}>
            <p className={styles.colTitle}>Connect</p>
            <a href={`https://wa.me/${resort.whatsapp}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a href={resort.socials.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href={`mailto:${resort.email}`}>{resort.email}</a>
            <a href={`tel:+${resort.phone}`}>{resort.phoneDisplay}</a>
          </div>

          <div className={styles.col}>
            <p className={styles.colTitle}>Visit</p>
            <p className={styles.plain}>{resort.address}</p>
            <p className={styles.plain}>{resort.houseRule}</p>
            <a href="#enquire" className={styles.enquire}>
              Enquire &rarr;
            </a>
          </div>
        </div>
      </div>

      <div className={styles.base}>
        <div className={`container ${styles.baseInner}`}>
          <span>
            © {new Date().getFullYear()} {resort.name}
          </span>
          <span className={styles.kannada}>{resort.taglineKannada}</span>
        </div>
      </div>
    </footer>
  );
}
