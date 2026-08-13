/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kadwa: ["Kadwa", "serif"],
      },
    },
  },
  plugins: [],
};