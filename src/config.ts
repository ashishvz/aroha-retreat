/**
 * Everything editable lives here — copy, prices, inclusions.
 * Photos live in /public.
 */

export const resort = {
  name: "Aroha Retreat",
  nameKannada: "ಆರೋಹ",
  tagline: "Come as guests, leave as family",
  taglineKannada: "ಅತಿಥಿಯಾಗಿ ಬನ್ನಿ, ಕುಟುಂಬವಾಗಿ ಹೋಗಿ",
  pillars: "Nature · Meditation · Farm Life",

  /** House rule the whole property runs on — called out on the page, not buried. */
  houseRule: "Strictly vegetarian. No alcohol on the property.",

  phone: "919380571810",
  phoneDisplay: "+91 93805 71810",
  whatsapp: "919380571810",
  email: "shamit0785@gmail.com",
  address: "Hrudhi Farms, Keralalusandra, Kanakapura, Karnataka 562117",
  mapsUrl: "https://maps.app.goo.gl/yRdXJ6NBr9bmFVWn6",
  mapEmbedSrc:
    "https://www.google.com/maps?q=Hrudhi+Farms,+Keralalusandra,+Karnataka+562117&output=embed",

  socials: {
    instagram: "#",
    facebook: "#",
  },
} as const;

/* ---------------------------------------------------------------- packages */

export type Package = {
  id: "day" | "farm" | "retreat";
  name: string;
  duration: string;
  from: string;
  fromUnit: string;
  blurb: string;
  /** three at-a-glance facts, each one straight out of the inclusions table */
  specs: string[];
  image: string;
  featured?: boolean;
};

export const packages: Package[] = [
  {
    id: "day",
    name: "Day Visit",
    duration: "Day use",
    from: "₹1,500",
    fromUnit: "per person",
    blurb:
      "Arrive after breakfast, leave after the evening chai. Lunch, the pool, the meditation hall and a walk through the farm — all of it in a single unhurried day.",
    specs: ["No overnight stay", "Lunch, hi tea & snacks", "Pool + meditation hall"],
    image: "/pkg-day.webp",
  },
  {
    id: "farm",
    name: "Farm Stay",
    duration: "2 Days / 1 Night",
    from: "₹3,500",
    fromUnit: "per person, per night",
    blurb:
      "A private room, every meal from the farm and a campfire under an open sky. Let the morning\u2019s melody be your alarm.",
    specs: ["Private room", "All meals included", "Campfire included"],
    image: "/pkg-farm.webp",
    featured: true,
  },
  {
    id: "retreat",
    name: "Meditation & Wellness Retreat",
    duration: "2 Days / 1 Night",
    from: "₹4,500",
    fromUnit: "per person, per night",
    blurb:
      "Everything in the farm stay, plus guided meditation, wellness sessions and a quiet sit on the mountain as dawn breaks.",
    specs: ["Private room", "Guided meditation", "Mountain visit + sit"],
    image: "/pkg-retreat.webp",
  },
];

/* -------------------------------------------------------------- inclusions */

/** "yes" / "no" render as a tick or cross; anything else prints as-is. */
export type Inclusion = "yes" | "no" | (string & {});

export type InclusionRow = {
  label: string;
  day: Inclusion;
  farm: Inclusion;
  retreat: Inclusion;
};

export const inclusions: InclusionRow[] = [
  { label: "Duration", day: "Day use", farm: "2D / 1N", retreat: "2D / 1N" },
  { label: "Private room", day: "no", farm: "yes", retreat: "yes" },
  { label: "Meditation hall", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Swimming pool", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Breakfast", day: "no", farm: "yes", retreat: "yes" },
  { label: "Lunch", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Evening hi tea & snacks", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Dinner", day: "no", farm: "yes", retreat: "yes" },
  { label: "Seasonal farm fruits", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Nature / farm walk", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Ox & sheep experience", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Mountain visit", day: "no", farm: "Optional / extra", retreat: "yes" },
  { label: "Mountain meditation", day: "no", farm: "no", retreat: "yes" },
  { label: "Campfire", day: "Optional / extra", farm: "yes", retreat: "yes" },
  { label: "Farm hosts / assistance", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Organic farm-based food", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Electricity / water", day: "—", farm: "yes", retreat: "yes" },
  { label: "Housekeeping", day: "Basic", farm: "yes", retreat: "yes" },
  { label: "Guided meditation", day: "no", farm: "no", retreat: "yes" },
  { label: "Wellness activities", day: "no", farm: "no", retreat: "yes" },
];

/* ------------------------------------------------------------------- rates */

export type RateRow = {
  label: string;
  day: string;
  farm: string;
  retreat: string;
};

export const rates: RateRow[] = [
  { label: "Single person", day: "₹1,500", farm: "₹3,500", retreat: "₹4,500" },
  { label: "Couple", day: "₹3,000", farm: "₹7,000", retreat: "₹9,000" },
  { label: "3 guests", day: "₹4,500", farm: "₹9,000", retreat: "₹12,000" },
  { label: "Child 5–10 yrs", day: "₹500", farm: "₹1,500", retreat: "₹1,500" },
  { label: "Child below 5 yrs", day: "Free*", farm: "Free*", retreat: "Free*" },
];

/** Farm-stay and retreat rates above are per night; the day visit is a flat fee. */
export const ratesNote =
  "Farm Stay and Retreat rates are per night. Children below 5 stay free when sharing with parents.";

export type GroupRate = { name: string; ten: string; extra: string };

export const groupRates: GroupRate[] = [
  { name: "Day Visit", ten: "₹12,000", extra: "₹1,500 per person" },
  { name: "Farm Stay — 1N / 2D", ten: "₹30,000", extra: "₹2,500 per person" },
  { name: "Meditation Retreat — 1N / 2D", ten: "₹40,000", extra: "₹3,200 per person" },
];

export const notIncluded: { item: string; note: string }[] = [
  { item: "Transportation to / from the farm", note: "Guest's responsibility" },
  { item: "Pickup / drop from Bangalore", note: "Not included" },
  { item: "Alcohol", note: "Not permitted on the property" },
  { item: "Special food requests", note: "Extra, if applicable" },
  { item: "Personal purchases", note: "Not included" },
  { item: "Medical / emergency expenses", note: "Guest's responsibility" },
  { item: "Personal guide / dedicated staff", note: "Extra, if requested" },
  { item: "Special events / private celebrations", note: "Quoted separately" },
  { item: "Mountain transport, if a vehicle is required", note: "Extra, if applicable" },
];

/* ----------------------------------------------------------------- cottages */

/** `type` must match a key in server/rooms.json — that is what the booking form books. */
export type Cottage = { type: string; name: string; blurb: string; image: string };

export const cottages: Cottage[] = [
  {
    type: "aframe",
    name: "A-Frame Cottages",
    blurb:
      "Steep red roofs tucked between the coconut palms. En-suite and quiet enough to hear the leaves.",
    image: "/cottage-1.webp",
  },
  {
    type: "verandah",
    name: "Verandah Cottage",
    blurb:
      "A wide private deck facing the palms — the best seat on the farm for morning coffee.",
    image: "/cottage-2.webp",
  },
  {
    type: "garden",
    name: "Garden Row",
    blurb:
      "Ground-level rooms opening onto the lawn and the walking path, easy for families and elders.",
    image: "/cottage-3.webp",
  },
];

/* -------------------------------------------------------------- experiences */

export type Experience = { title: string; blurb: string; image?: string };

export const experiences: Experience[] = [
  {
    title: "Guided meditation",
    blurb:
      "Morning and evening sits in the meditation hall and a sunrise session on the mountain for retreat guests.",
  },
  {
    title: "Ox & sheep experience",
    blurb: "Meet the animals the farm runs on — feeding, grazing and the odd stubborn ox.",
    image: "/farm.webp",
  },
  {
    title: "Nature & farm walk",
    blurb: "Walk the orchards with a host and pick whatever is in season that week.",
  },
  {
    title: "Swimming pool",
    blurb: "Open through the day to every guest, day visitors included.",
  },
  {
    title: "Campfire evenings",
    blurb: "Fire, stories and a sky with no city in the way of it.",
  },
  {
    title: "Mountain visit",
    blurb: "A short climb to the boulders behind the farm for the long view across the valley.",
  },
];
