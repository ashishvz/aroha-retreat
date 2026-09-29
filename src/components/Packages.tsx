import Reveal from "./Reveal";
import { packages } from "../config";
import styles from "./Packages.module.css";

export default function Packages() {
  return (
    <section id="packages" className={`section ${styles.section}`}>
      <div className="container">
        <Reveal className={styles.head}>
          <p className="eyebrow">Packages</p>
          <h2 className="display">Three ways to stay</h2>
          <hr className="rule" />
          <p className="lead">
            Come for a day, stay the night or give yourself the full retreat.
            Every option includes farm-grown food and the run of the place.
          </p>
        </Reveal>

        <div className={styles.grid}>
          {packages.map((p, i) => (
            <Reveal
              key={p.id}
              as="article"
              className={`${styles.card} ${p.featured ? styles.featured : ""}`}
              delay={i * 130}
            >
              <div className={styles.frame}>
                <img src={p.image} alt={p.name} loading="lazy" decoding="async" />
                {p.featured && <span className={styles.badge}>Most booked</span>}
              </div>

              <p className={styles.duration}>{p.duration}</p>
              <h3 className={styles.name}>{p.name}</h3>
              <p className={styles.blurb}>{p.blurb}</p>

              <ul className={styles.specs}>
                {p.specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>

              <div className={styles.price}>
                <span className={styles.from}>from</span>
                <span className={styles.amount}>{p.from}</span>
                <span className={styles.unit}>{p.fromUnit}</span>
              </div>

              <a href="#enquire" className="btn btn-line">
                Enquire
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
