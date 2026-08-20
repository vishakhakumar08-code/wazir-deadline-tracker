import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wazir: {
          50: "#f4f7fb",
          100: "#e9f0f7",
          200: "#d3e0ef",
          300: "#acc8e3",
          400: "#7faad3",
          500: "#5c8dc2",
          600: "#4471a8",
          700: "#375b8a",
          800: "#2f4d73",
          900: "#1b2d46",
          950: "#0c1726",
          navy: "#0a1128",
          midnight: "#050914",
          surface: "#0f172a",
          card: "#1e293b",
          cardHover: "#24324a",
          border: "#334155",
          gold: "#f59e0b",
          goldLight: "#fbbf24",
          accent: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
