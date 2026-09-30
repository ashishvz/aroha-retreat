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
  email: "retreataroha@gmail.com",
  address: "Hrudhi Farms, Keralalusandra, Kanakapura, Karnataka 562117",
  mapsUrl: "https://maps.app.goo.gl/yRdXJ6NBr9bmFVWn6",
  mapEmbedSrc:
    "https://www.google.com/maps?q=Hrudhi+Farms,+Keralalusandra,+Karnataka+562117&output=embed",

  socials: {
    instagram: "https://www.instagram.com/aroharetreat/",
    facebook: "https://www.facebook.com/profile.php?id=61592010947256",
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
      "Arrive after breakfast, leave after the evening chai. Lunch, the swimming pool and a walk through the farm — all of it in a single unhurried day.",
    specs: ["No overnight stay", "Lunch, High Tea & snacks", "Swimming pool"],
    image: "/pkg-day.webp",
  },
  {
    id: "farm",
    name: "Farm Stay",
    duration: "2 Days / 1 Night",
    from: "₹3,500",
    fromUnit: "per person, per night",
    blurb:
      "A private room, the pool to yourself, every meal from the farm and a campfire under an open sky. Let the morning\u2019s melody be your alarm.",
    specs: ["Private room", "Swimming pool", "All meals included"],
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
      "Everything in the farm stay, plus meditation hall access, guided sits morning and evening, and a quiet sit on the mountain as dawn breaks.",
    specs: ["Meditation hall access", "Guided meditation", "Sunrise mountain meditation"],
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
  { label: "Meditation hall", day: "no", farm: "no", retreat: "yes" },
  { label: "Swimming pool", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Breakfast", day: "no", farm: "yes", retreat: "yes" },
  { label: "Lunch", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Evening High Tea & snacks", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Dinner", day: "no", farm: "yes", retreat: "yes" },
  { label: "Organic, seasonal farm fruits", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Nature / farm walk", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Ox & sheep experience", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Mountain visit", day: "no", farm: "Optional / extra", retreat: "yes" },
  { label: "Mountain meditation", day: "no", farm: "no", retreat: "yes" },
  { label: "Campfire", day: "no", farm: "yes", retreat: "yes" },
  { label: "Farm hosts / assistance", day: "yes", farm: "yes", retreat: "yes" },
  { label: "Meals from organic, farm-grown produce", day: "yes", farm: "yes", retreat: "yes" },
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
  { label: "Per person", day: "₹1,500", farm: "₹3,500", retreat: "₹4,500" },
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

/* ----------------------------------------------------------------- cottages */

/** `type` must match a key in server/rooms.json — that is what the booking form books. */
export type Cottage = { type: string; name: string; blurb: string; image: string };

export const cottages: Cottage[] = [
  {
    type: "aframe",
    name: "A-Frame Cottages",
    blurb:
      "Nestled among the coconut palms beneath steep red roofs, each cottage is en-suite and private — quiet enough to hear the leaves.",
    image: "/cottage-1.webp",
  },
  {
    type: "verandah",
    name: "Verandah Cottage",
    blurb:
      "A spacious private deck overlooking the palms — an ideal spot for a quiet morning coffee.",
    image: "/cottage-2.webp",
  },
  {
    type: "garden",
    name: "Garden Row",
    blurb:
      "Ground-floor rooms opening onto the lawn and walking path — a comfortable choice for families and elder guests.",
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
    blurb: "Meet the animals that keep the farm running, with feeding and grazing alongside our hosts.",
    image: "/farm.webp",
  },
  {
    title: "Nature & farm walk",
    blurb: "Walk the orchards with a host and pick whatever organic, seasonal fruit is ripe that week.",
  },
  {
    title: "Swimming pool",
    blurb: "Included with every package — swim any time, day or night.",
  },
  {
    title: "Campfire evenings",
    blurb: "Gather by the fire for stories, under a sky untouched by city lights.",
  },
  {
    title: "Mountain visit",
    blurb: "A short climb to the boulders behind the farm, rewarded with sweeping views across the valley.",
  },
];

/* ------------------------------------------------------------------ moments */

/**
 * Photo/video gallery. Add a new one by dropping the file in public/gallery
 * (photos/ or videos/, plus a thumbs/ or posters/ copy) and adding an entry
 * here — no other code changes needed.
 */
export type Moment =
  | { kind: "photo"; src: string; thumb: string; alt: string }
  | { kind: "video"; src: string; poster: string; alt: string };

export const moments: Moment[] = [
  {
    kind: "video",
    src: "/gallery/videos/moments-campfire.mp4",
    poster: "/gallery/videos/posters/moments-campfire-poster.jpg",
    alt: "Campfire evening on the farm",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-family-1.jpg",
    thumb: "/gallery/photos/thumbs/moments-family-1.jpg",
    alt: "Family time among the palms",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-pavilion-night-1.jpg",
    thumb: "/gallery/photos/thumbs/moments-pavilion-night-1.jpg",
    alt: "The dining pavilion, lit for the evening",
  },
  {
    kind: "video",
    src: "/gallery/videos/moments-pond-and-cottages.mp4",
    poster: "/gallery/videos/posters/moments-pond-and-cottages-poster.jpg",
    alt: "The farm pond and cottages beyond",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-entrance.jpg",
    thumb: "/gallery/photos/thumbs/moments-entrance.jpg",
    alt: "The drive in to the farm",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-farmhouse.jpg",
    thumb: "/gallery/photos/thumbs/moments-farmhouse.jpg",
    alt: "The farmhouse, stone and red tile",
  },
  {
    kind: "video",
    src: "/gallery/videos/moments-farm-tractor.mp4",
    poster: "/gallery/videos/posters/moments-farm-tractor-poster.jpg",
    alt: "Out on the farm",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-pond-cattle.jpg",
    thumb: "/gallery/photos/thumbs/moments-pond-cattle.jpg",
    alt: "The pond, with company",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-celebration.jpg",
    thumb: "/gallery/photos/thumbs/moments-celebration.jpg",
    alt: "A celebration on the lawn",
  },
  {
    kind: "video",
    src: "/gallery/videos/moments-evening-pathway.mp4",
    poster: "/gallery/videos/posters/moments-evening-pathway-poster.jpg",
    alt: "Dusk along the farm pathway",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-pavilion-day.jpg",
    thumb: "/gallery/photos/thumbs/moments-pavilion-day.jpg",
    alt: "The dining pavilion by daylight",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-pond-view.jpg",
    thumb: "/gallery/photos/thumbs/moments-pond-view.jpg",
    alt: "The farm pond at dusk",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-family-2.jpg",
    thumb: "/gallery/photos/thumbs/moments-family-2.jpg",
    alt: "Family time among the palms",
  },
  {
    kind: "video",
    src: "/gallery/videos/moments-entrance.mp4",
    poster: "/gallery/videos/posters/moments-entrance-poster.jpg",
    alt: "The drive in to the farm",
  },
  {
    kind: "photo",
    src: "/gallery/photos/moments-pavilion-night-2.jpg",
    thumb: "/gallery/photos/thumbs/moments-pavilion-night-2.jpg",
    alt: "The dining pavilion, lit for the evening",
  },
];
