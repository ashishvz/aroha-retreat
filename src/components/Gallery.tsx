import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { moments } from "../config";
import styles from "./Gallery.module.css";

export default function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const active = openIndex === null ? null : moments[openIndex];

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % moments.length));
      if (e.key === "ArrowLeft")
        setOpenIndex((i) => (i === null ? i : (i - 1 + moments.length) % moments.length));
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex]);

  return (
    <section id="moments" className="section">
      <div className="container">
        <Reveal className={styles.head}>
          <p className="eyebrow">Moments</p>
          <h2 className="display">See it for yourself</h2>
          <hr className="rule" />
          <p className="lead">
            Photos and short clips from recent stays &mdash; the farm, the fire
            and the guests who&rsquo;ve sat by it.
          </p>
        </Reveal>

        <div className={styles.grid}>
          {moments.map((m, i) => (
            <Reveal key={m.src} className={styles.tile} delay={(i % 6) * 60}>
              <button
                type="button"
                className={styles.tileBtn}
                onClick={() => setOpenIndex(i)}
                aria-label={m.kind === "video" ? `Play video: ${m.alt}` : `View photo: ${m.alt}`}
              >
                <img
                  src={m.kind === "video" ? m.poster : m.thumb}
                  alt={m.alt}
                  loading="lazy"
                  decoding="async"
                />
                {m.kind === "video" && (
                  <span className={styles.play} aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                )}
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={() => setOpenIndex(null)}
        >
          <button type="button" className={styles.close} aria-label="Close" onClick={() => setOpenIndex(null)}>
            &times;
          </button>
          <button
            type="button"
            className={`${styles.nav} ${styles.navPrev}`}
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => (i === null ? i : (i - 1 + moments.length) % moments.length));
            }}
          >
            &lsaquo;
          </button>
          <button
            type="button"
            className={`${styles.nav} ${styles.navNext}`}
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => (i === null ? i : (i + 1) % moments.length));
            }}
          >
            &rsaquo;
          </button>

          <div className={styles.stage} onClick={(e) => e.stopPropagation()}>
            {active.kind === "photo" ? (
              <img src={active.src} alt={active.alt} />
            ) : (
              <video key={active.src} src={active.src} poster={active.poster} controls playsInline />
            )}
            <p className={styles.caption}>{active.alt}</p>
          </div>
        </div>
      )}
    </section>
  );
}
