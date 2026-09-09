/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0b1f3a",
          800: "#10274d",
          700: "#17356b",
          600: "#1e4483",
        },
        amber: {
          500: "#d98e04",
          400: "#f2b23a",
          100: "#fdf1d8",
        },
      },
      fontFamily: {
        display: ["Manrope", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
