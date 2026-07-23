import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lavender / violet crypto-editorial palette
        "hero-violet": "#beaaff",
        "card-lilac": "#e2d9ff",
        "bitcoin-orange": "#f97316",
        "warm-cream": "#fff7ed",
        "lavender-mist": "#f7f2ff",
        "off-white": "#f9fafb",
        "ink-plum": "#2c232e",
        graphite: "#4b5563",
        slate: "#6b7280",
        steel: "#374151",
        mist: "#e2e8f0",
        fog: "#d1d5db",
      },
      fontFamily: {
        display: ["var(--font-halyard)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        subheading: ["18px", { lineHeight: "1" }],
        "heading-sm": ["24px", { lineHeight: "1.09" }],
        body: ["29px", { lineHeight: "1.26" }],
        heading: ["41px", { lineHeight: "0.9" }],
        display: ["51px", { lineHeight: "0.9" }],
      },
      borderRadius: {
        cards: "12px",
        pill: "36px",
        ghost: "22.5px",
      },
      spacing: {
        18: "18px",
        31: "31px",
        41: "41px",
        45: "45px",
        68: "68px",
      },
    },
  },
  plugins: [],
};

export default config;
