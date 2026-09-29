import { resort } from "../config";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <img className={styles.photo} src="/hero.webp" alt="" aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <img
          className={styles.mark}
          src="/logo-mark.webp"
          alt=""
          aria-hidden="true"
          width={520}
          height={382}
        />

        <h1 className={styles.title}>
          <span className={styles.kannada}>{resort.nameKannada}</span>
          <span className={styles.name}>Aroha</span>
          <span className={styles.sub}>Retreat</span>
        </h1>

        <span className={styles.hair} aria-hidden="true" />

        <p className={styles.tagline}>
          {resort.tagline}
          <span className={styles.tagKannada}>{resort.taglineKannada}</span>
        </p>

        <p className={styles.pillars}>{resort.pillars}</p>
      </div>

      <a href="#intro" className={styles.scroll} aria-label="Scroll to content">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}
