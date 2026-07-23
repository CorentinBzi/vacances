// Decorative destination polaroids for the login / onboarding screens.
// URLs are stable Unsplash CDN photos; the Polaroid component degrades to an
// emoji tile if any image fails to load.

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=420&q=80`;

export interface PolaroidData {
  src: string;
  caption: string;
  emoji: string;
  rotate: string;
}

export const LOGIN_POLAROIDS: PolaroidData[] = [
  {
    src: U("photo-1502602898657-3e91760cbb34"),
    caption: "Paris, France",
    emoji: "🗼",
    rotate: "-rotate-6",
  },
  {
    src: U("photo-1533105079780-92b9be482077"),
    caption: "Santorin, Grèce",
    emoji: "🇬🇷",
    rotate: "rotate-3",
  },
  {
    src: U("photo-1537996194471-e657df975ab4"),
    caption: "Bali, Indonésie",
    emoji: "🌴",
    rotate: "rotate-6",
  },
  {
    src: U("photo-1523906834658-6e24ef2386f9"),
    caption: "Venise, Italie",
    emoji: "🚤",
    rotate: "-rotate-3",
  },
  {
    src: U("photo-1506905925346-21bda4d32df4"),
    caption: "Grand large",
    emoji: "🏔️",
    rotate: "rotate-2",
  },
  {
    src: U("photo-1501785888041-af3ef285b470"),
    caption: "Évasion",
    emoji: "🌄",
    rotate: "-rotate-2",
  },
];
