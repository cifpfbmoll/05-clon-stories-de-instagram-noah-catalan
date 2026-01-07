/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ig-gradient-start': '#833ab4',
        'ig-gradient-mid': '#fd1d1d',
        'ig-gradient-end': '#fcb045',
      },
    },
  },
  plugins: [],
}
