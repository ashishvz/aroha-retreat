import { useEffect, useState } from "react";
import { useScrolled } from "../hooks/useScrolled";
import styles from "./Nav.module.css";

const links = [
  { href: "#intro", label: "The farm" },
  { href: "#packages", label: "Packages" },
  { href: "#rates", label: "Rates" },
  { href: "#cottages", label: "Cottages" },
  { href: "#experiences", label: "Experiences" },
  { href: "#location", label: "Location" },
];

export default function Nav() {
  const scrolled = useScrolled(60);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.solid : ""}`}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.brand} onClick={() => setOpen(false)}>
          <img className={styles.mark} src="/logo-mark.webp" alt="" aria-hidden="true" />
          <img className={styles.word} src="/logo-wordmark.webp" alt="Aroha Retreat" />
        </a>

        <button
          className={`${styles.burger} ${open ? styles.burgerOpen : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>

        <nav className={`${styles.links} ${open ? styles.linksOpen : ""}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#enquire" className={styles.cta} onClick={() => setOpen(false)}>
            Enquire
          </a>
        </nav>
      </div>
    </header>
  );
}
