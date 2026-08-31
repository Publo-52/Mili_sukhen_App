import { AppConfig } from '@/types';

export const APP_CONFIG: AppConfig = {
  appName: "Mili ❤️",
  recipientName: "Mili",
  creatorName: "Sukhen",
  anniversaryDate: "2023-11-18",
  contactVisibility: 'PRIVATE',
  adminPasscode: "mili143",
  surprisePasscode: "forever",
  contactPasscode: "143",
  socials: {
    creatorPhone: "+91 98326 95291",
    creatorEmail: "sukhen@lovemili.space",
    creatorWhatsapp: "919832695291",
    recipientPhone: "+91 97329 34032",
    recipientEmail: "mili@lovemili.space",
    recipientWhatsapp: "919732934032",
  },
};

// ─── Login & Session Config ────────────────────────────────────────────────────
export const AUTH_USERS = {
  mili: {
    id: "mili",
    name: "Mili",
    role: "mili" as const,
    title: "Mili's Sanctuary",
    phone: "9732934032",
    formattedPhone: "+91 97329 34032",
    emails: ["mili@lovemili.space", "mili@gmail.com", "mili", "9732934032", "+919732934032", "09732934032"],
    defaultEmail: "mili@lovemili.space",
    passwords: ["mili143", "143", "forever", "love143", "9732934032"],
    defaultPassword: "mili143",
    avatar: "M",
    greeting: "Welcome back, my love! Your universe is ready.",
    themeColor: "from-rose-500 to-pink-600",
    glowColor: "rgba(244, 63, 94, 0.4)",
  },
  sukhen: {
    id: "sukhen",
    name: "Sukhen",
    role: "sukhen" as const,
    title: "Creator & Admin",
    phone: "9832695291",
    formattedPhone: "+91 98326 95291",
    emails: ["sukhen@lovemili.space", "sukhen@gmail.com", "sukhen", "admin@lovemili.space", "9832695291", "+919832695291", "09832695291"],
    defaultEmail: "sukhen@lovemili.space",
    passwords: ["sukhen", "mili143", "admin143", "sukhen143", "9832695291"],
    defaultPassword: "sukhen",
    avatar: "S",
    greeting: "Welcome back, Sukhen! Creator Studio & Admin active.",
    themeColor: "from-purple-600 to-indigo-600",
    glowColor: "rgba(147, 51, 234, 0.4)",
  },
};

export const AUTH_CONFIG = {
  /** Default fallback password */
  password: "mili143",
  /** Maximum simultaneous device logins allowed (default 5) */
  maxDevices: 5,
  /** Session expiry — 30 days in milliseconds */
  sessionExpiryMs: 30 * 24 * 60 * 60 * 1000,
};


export const ROMANTIC_QUOTES = [
  "“Everything I created, I created with you in mind.”",
  "“In a universe full of endless stars, my code always points to you.”",
  "“You are the most beautiful poetry written into my reality.”",
  "“A million lines of code could never capture how special you are.”",
  "“Every pixel here was designed to make you smile.”",
];

export const AUDIO_TRACKS = [
  {
    id: "ambient-piano",
    title: "Starlight & Soft Rain",
    subtitle: "Calming ambient piano & warm chords",
    frequency: 432,
  },
  {
    id: "warm-lofi",
    title: "Midnight Moonbeam",
    subtitle: "Gentle romantic harmonic synth",
    frequency: 528,
  },
];
