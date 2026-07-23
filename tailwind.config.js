/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      scale: {
        200: "2",
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "Georgia", "serif"],
      },
      colors: {
        sand: "#f7f0e6",
        lagoon: {
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        sunset: {
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(var(--tw-rotate))" },
          "50%": { transform: "translateY(-12px) rotate(var(--tw-rotate))" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
        shimmer: "shimmer 18s ease infinite",
      },
    },
  },
  plugins: [],
};
