/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF385C',
        'primary-dark': '#E31C5F',
        'primary-light': '#FF5A5F',
      },
    },
  },
  plugins: [],
}
