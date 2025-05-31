/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#64748b',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
