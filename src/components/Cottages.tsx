import Reveal from "./Reveal";
import { cottages } from "../config";
import styles from "./Cottages.module.css";

export default function Cottages() {
  return (
    <section id="cottages" className={`section ${styles.section}`}>
      <div className="container">
        <Reveal className={styles.head}>
          <p className="eyebrow">Where you sleep</p>
          <h2 className="display">The cottages</h2>
          <hr className="rule" />
          <p className="lead">
            Every room is private and en-suite, spaced far enough apart that
            you won&rsquo;t hear your neighbours. Included in the Farm Stay and
            Retreat packages.
          </p>
        </Reveal>

        <div className={styles.rows}>
          {cottages.map((c, i) => (
            <Reveal key={c.name} as="article" className={styles.row} delay={80}>
              <div className={styles.frame}>
                <img src={c.image} alt={c.name} loading="lazy" decoding="async" />
              </div>
              <div className={styles.copy}>
                <span className={styles.index}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.name}>{c.name}</h3>
                <p>{c.blurb}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
