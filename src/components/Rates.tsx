import Reveal from "./Reveal";
import { rates, ratesNote, groupRates, inclusions, type Inclusion } from "../config";
import styles from "./Rates.module.css";

function Cell({ value }: { value: Inclusion }) {
  if (value === "yes")
    return (
      <>
        <span className={styles.yes} aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === "no")
    return (
      <>
        <span className={styles.no} aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className={styles.note}>{value}</span>;
}

export default function Rates() {
  return (
    <section id="rates" className="section">
      <div className="container">
        <Reveal className={styles.head}>
          <p className="eyebrow">Rates</p>
          <h2 className="display">Tariffs</h2>
          <hr className="rule" />
          <p className="lead">
            Clear, upfront pricing — no packages hidden behind an enquiry form.
          </p>
        </Reveal>

        <Reveal>
          <p className={styles.hint}>Swipe to see more &rarr;</p>
          <div className={styles.wrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Booking type</th>
                  <th scope="col">Day Visit</th>
                  <th scope="col">
                    Farm Stay <span className={styles.per}>per night</span>
                  </th>
                  <th scope="col">
                    Meditation &amp; Wellness <span className={styles.per}>per night</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td className={styles.num}>{r.day}</td>
                    <td className={styles.num}>{r.farm}</td>
                    <td className={styles.num}>{r.retreat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.foot}>*{ratesNote}</p>
        </Reveal>

        <div className={styles.split}>
          <Reveal className={styles.panel}>
            <h3 className={styles.panelTitle}>Group Package &middot; 10 Guests</h3>
            <ul className={styles.groups}>
              {groupRates.map((g) => (
                <li key={g.name}>
                  <span className={styles.gName}>{g.name}</span>
                  <span className={styles.gPrice}>{g.ten}</span>
                  <span className={styles.gExtra}>then {g.extra}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className={styles.panel} delay={130}>
            <h3 className={styles.panelTitle}>Have something specific in mind?</h3>
            <p className={styles.enquireCopy}>
              Special requests, private celebrations or a custom itinerary — tell us
              what you have in mind and we&rsquo;ll tailor a plan for you.
            </p>
            <a href="#enquire" className="btn btn-line">
              Enquire
            </a>
          </Reveal>
        </div>

        <Reveal className={styles.inclusionsBlock}>
          <h3 className={styles.inclusionsTitle}>What each package includes</h3>
          <p className={styles.hint}>Swipe to see more &rarr;</p>
          <div className={styles.wrap}>
            <table className={`${styles.table} ${styles.compare}`}>
              <thead>
                <tr>
                  <th scope="col">Offering</th>
                  <th scope="col">Day Visit</th>
                  <th scope="col">Farm Stay</th>
                  <th scope="col">Meditation &amp; Wellness</th>
                </tr>
              </thead>
              <tbody>
                {inclusions.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>
                      <Cell value={row.day} />
                    </td>
                    <td>
                      <Cell value={row.farm} />
                    </td>
                    <td>
                      <Cell value={row.retreat} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
