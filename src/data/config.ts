import { AppConfig } from '@/types';

export const APP_CONFIG: AppConfig = {
  appName: "Suksharmi ❤️",
  recipientName: "Mili",
  creatorName: "Sukhen",
  anniversaryDate: "2025-10-14T00:00:00+05:30",
  contactVisibility: 'PRIVATE',
  adminPasscode: '',
  surprisePasscode: "forever",
  socials: {
    creatorPhone: "+91 98326 95291",
    creatorEmail: "dassukhen@gmail.com",
    creatorWhatsapp: "919832695291",
    recipientPhone: "+91 97329 34032",
    recipientEmail: "mandalsharmili06@gmail.com",
    recipientWhatsapp: "919732934032",
  },
};

// Public Session Configuration (Safe for client components)
export const AUTH_CONFIG = {
  /** Maximum simultaneous device logins allowed (strictly 3) */
  maxDevices: 3,
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
