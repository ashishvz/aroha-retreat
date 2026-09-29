import Reveal from "./Reveal";
import { resort } from "../config";
import styles from "./Intro.module.css";

const pillars = [
  {
    n: "01",
    title: "Nature",
    body: "Coconut groves, orchards and boulder hills. The loudest thing here is the birds.",
  },
  {
    n: "02",
    title: "Meditation",
    body: "A dedicated hall, guided sits morning and evening and silence on the mountain at dawn.",
  },
  {
    n: "03",
    title: "Farm Life",
    body: "Working land, not a set. Meet the oxen, walk the fields, eat what was picked that morning.",
  },
];

export default function Intro() {
  return (
    <section id="intro" className="section">
      <div className="container">
        <div className={styles.top}>
          <Reveal className={styles.copy}>
            <p className="eyebrow">{resort.address}</p>
            <h2 className={styles.heading}>
              A working farm that happens to be the calmest place
              <em> you&rsquo;ll ever sleep</em>
            </h2>
          </Reveal>

          <Reveal className={styles.side} delay={140}>
            <p className="lead">
              There is no reception desk and no schedule you have to keep. An easy
              drive from Bengaluru — close enough for a day out, far enough that
              the city stops following you.
            </p>
            <p className={styles.body}>
              Come for lunch and a swim or stay the night and let the place do
              its work.
            </p>
            <p className={styles.rule}>
              <span>Strictly vegetarian</span>
              <span>No alcohol</span>
            </p>
          </Reveal>
        </div>

        <Reveal className={styles.media} delay={120}>
          <img
            className={styles.wide}
            src="/about.webp"
            alt="Cottages among the palms"
            loading="lazy"
            decoding="async"
          />
        </Reveal>

        <ol className={styles.pillars}>
          {pillars.map((p, i) => (
            <Reveal key={p.title} as="li" delay={i * 120}>
              <span className={styles.num}>{p.n}</span>
              <h3 className={styles.pillarTitle}>{p.title}</h3>
              <p>{p.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
