import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/**/*.css",
    "./src/app/**/*.css",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#06040a",
          900: "#0b0813",
          850: "#100c1c",
          800: "#171226",
          700: "#221b38",
          600: "#322852",
        },
        roseGlow: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
        },
        starlight: {
          gold: "#fde047",
          amber: "#f59e0b",
          champagne: "#fef3c7",
          purple: "#c084fc",
          cyan: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        stylish: ["var(--font-stylish)", "'Great Vibes'", "'Alex Brush'", "cursive"],
        luxury: ["var(--font-luxury)", "'Cinzel Decorative'", "'Playfair Display'", "Georgia", "serif"],
        display: ["var(--font-display)", "'Playfair Display'", "Georgia", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 35px -5px rgba(244, 63, 94, 0.35)",
        "glow-lg": "0 0 60px -10px rgba(244, 63, 94, 0.45)",
        "glow-gold": "0 0 35px -5px rgba(253, 224, 71, 0.3)",
        "glow-violet": "0 0 35px -5px rgba(192, 132, 252, 0.35)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "romantic-gradient": "radial-gradient(circle at 50% 20%, rgba(244,63,94,0.15) 0%, rgba(139,92,246,0.08) 40%, rgba(6,4,10,0.95) 100%)",
        "card-glass": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite linear",
        "twinkle": "twinkle 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
