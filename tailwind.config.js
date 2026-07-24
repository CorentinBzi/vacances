/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // "Grand ciel" palette — summer sky: azure, coral, warm gold, navy ink.
      colors: {
        paper: "#f4f9ff",
        card: "#ffffff",
        linen: "#d8e5f2",
        ink: {
          DEFAULT: "#14395c",
          soft: "#58748e",
        },
        azure: {
          DEFAULT: "#0d7cc7",
          deep: "#0a5f99",
        },
        coral: {
          DEFAULT: "#c74a20",
          soft: "#e0693a",
        },
        gold: "#f2a541",
        sand: "#fdf4e7",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "'Segoe UI'", "system-ui", "sans-serif"],
        sans: ["'Instrument Sans'", "'Segoe UI'", "system-ui", "sans-serif"],
        serif: ["'Instrument Serif'", "Georgia", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 18px 44px -12px rgba(13, 58, 92, 0.22)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(var(--tw-rotate))" },
          "50%": { transform: "translateY(-12px) rotate(var(--tw-rotate))" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(22px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
        "fade-up": "fadeUp 0.8s cubic-bezier(0.22, 0.7, 0.25, 1) forwards",
      },
    },
  },
  plugins: [],
};
