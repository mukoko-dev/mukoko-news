/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mukoko brand colors
        primary: {
          DEFAULT: '#5e5772',
          hover: '#6f6885',
          active: '#4d475f',
          light: '#e8e6ec',
        },
        accent: {
          DEFAULT: '#d4634a',
          light: '#fce8e4',
        },
        success: {
          DEFAULT: '#779b63',
          light: '#e8f0e4',
        },
        warning: {
          DEFAULT: '#e5a84d',
          light: '#fcf3e4',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          variant: '#f9f8f4',
          subtle: '#fdfcfa',
        },
        // Zimbabwe flag colors (for accents)
        zw: {
          green: '#00A651',
          yellow: '#FDD116',
          red: '#EF3340',
          black: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
