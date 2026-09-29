/**
 * Build a wa.me deep link that opens WhatsApp with a pre-filled enquiry.
 * No backend needed — the enquiry lands in the owner's WhatsApp on submit.
 * (Alternative delivery: a `mailto:` link, or a form service like Web3Forms.)
 */

export type Enquiry = {
  name: string;
  phone: string;
  pkg: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  message: string;
};

/**
 * Blank fields are dropped rather than printed as "—", so the short enquiry
 * from the hero bar (package + date + guests) reads as cleanly as the full form.
 */
export function buildWhatsAppUrl(to: string, e: Enquiry): string {
  const number = to.replace(/\D/g, ""); // digits only, no "+"
  const lines: [string, string][] = [
    ["Name", e.name],
    ["Phone", e.phone],
    ["Package", e.pkg],
    ["Check-in", e.checkIn],
    ["Check-out", e.checkOut],
    ["Guests", e.guests],
    ["Message", e.message],
  ];
  const text = [
    "New enquiry from the website 🌿",
    ...lines.filter(([, v]) => v.trim()).map(([k, v]) => `${k}: ${v}`),
  ].join("\n");
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

// --- self-check: `npm run check:whatsapp` (node --experimental-strip-types) ---
// `typeof process` guard so this never runs (or throws) in the browser bundle.
if (typeof process !== "undefined" && import.meta.url === `file://${process.argv[1]}`) {
  const check = (cond: unknown, msg: string) => {
    if (!cond) throw new Error("FAILED: " + msg);
  };
  const url = buildWhatsAppUrl("+91 99999 99999", {
    name: "Asha & co",
    phone: "080-123",
    pkg: "Farm Stay",
    checkIn: "2026-08-01",
    checkOut: "2026-08-03",
    guests: "2 adults",
    message: "Any cottages with a deck?",
  });
  check(url.startsWith("https://wa.me/919999999999?text="), "number stripped to digits");
  const text = decodeURIComponent(url.split("text=")[1]);
  check(text.includes("Asha & co"), "name round-trips through encoding");
  check(text.includes("Package: Farm Stay"), "package included");
  check(text.includes("Check-in: 2026-08-01"), "dates included");
  check(!url.includes(" "), "no raw spaces in the url");

  // the hero bar sends no name/phone — those lines must vanish, not print blank
  const quick = decodeURIComponent(
    buildWhatsAppUrl("919999999999", {
      name: "",
      phone: "  ",
      pkg: "Day Visit",
      checkIn: "2026-09-12",
      checkOut: "",
      guests: "4",
      message: "",
    })
  );
  check(!quick.includes("Name:"), "blank name line is dropped");
  check(!quick.includes("Phone:"), "whitespace-only phone line is dropped");
  check(!quick.includes("Check-out:"), "blank check-out line is dropped");
  check(quick.includes("Package: Day Visit"), "filled lines survive");
  check(quick.includes("Guests: 4"), "guests survive");
  console.log("ok: buildWhatsAppUrl");
}
