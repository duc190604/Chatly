/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      ccolors: {
        abc: "var(--color-background-gray)",
      },
      fontFamily: {
        pomp: ["var(--font-pompiere)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
