import Reveal from "./Reveal";
import { experiences } from "../config";
import styles from "./Experiences.module.css";

export default function Experiences() {
  return (
    <section id="experiences" className={`section section-dark ${styles.section}`}>
      <div className="container">
        <Reveal className={styles.head}>
          <p className="eyebrow">Things to do</p>
          <h2 className="display">The day is yours to fill</h2>
          <hr className={`rule ${styles.ruleLight}`} />
          <p className="lead">
            Nothing here is compulsory. Join what you like, skip what you
            don&rsquo;t and the hosts will point you at the rest.
          </p>
        </Reveal>

        <ol className={styles.list}>
          {experiences.map((e, i) => (
            <Reveal key={e.title} as="li" className={styles.item} delay={i * 90}>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className={styles.title}>{e.title}</h3>
                <p>{e.blurb}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
