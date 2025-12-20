/** @type {import('tailwindcss').Config} */
/**
 * Mukoko News Tailwind Configuration
 * Nyuchi Brand System v6 - Five African Minerals Color Palette
 *
 * WCAG AAA Accessibility:
 * - 7:1+ contrast ratios for all text
 * - 44px minimum touch targets
 * - Clear visual hierarchy
 */

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './navigation/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Mukoko Brand Colors - Five African Minerals
      colors: {
        // Tanzanite - Premium, creativity, social connection
        tanzanite: {
          DEFAULT: '#4B0082',
          light: '#B388FF',
          hover: '#5C109A',
          active: '#3A0066',
          container: '#E8D5F9',
          'on-container': '#1A0033',
        },

        // Cobalt - Digital future, knowledge, education
        cobalt: {
          DEFAULT: '#0047AB',
          light: '#00B0FF',
          container: '#D6E4F9',
          'on-container': '#001A40',
        },

        // Malachite - Success, growth, nature, wellness
        malachite: {
          DEFAULT: '#004D40',
          light: '#64FFDA',
          container: '#C8E6C9',
          'on-container': '#0D3311',
        },

        // Gold - Honey, rewards, achievement, warmth
        gold: {
          DEFAULT: '#5D4037',
          light: '#FFD740',
          container: '#F5E6D3',
          'on-container': '#2D1F1A',
        },

        // Terracotta - Community, Ubuntu, earth connection
        terracotta: {
          DEFAULT: '#8B4513',
          light: '#D4A574',
          container: '#F4E8DC',
          'on-container': '#3A1D0A',
        },

        // Surface colors
        surface: {
          DEFAULT: '#FFFFFF',
          variant: '#F3F2EE',
          subtle: '#FAF9F5',
          dim: '#F3F2EE',
        },

        // Semantic colors
        error: {
          DEFAULT: '#B3261E',
          container: '#F9DEDC',
          'on-container': '#410E0B',
        },

        success: {
          DEFAULT: '#1B5E20',
          container: '#E8F5E9',
          'on-container': '#0D3311',
        },

        warning: {
          DEFAULT: '#E65100',
          container: '#FFF3E0',
          'on-container': '#331200',
        },

        // Text colors
        'on-surface': '#1C1B1F',
        'on-surface-variant': '#4a4a4a',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        'on-accent': '#FFFFFF',

        // Borders
        outline: '#e0dfdc',
        'outline-variant': '#f0efec',

        // Background
        background: '#FAF9F5',
        'on-background': '#1C1B1F',
      },

      // Typography - Mukoko brand fonts
      fontFamily: {
        sans: ['PlusJakartaSans-Regular', 'system-ui', 'sans-serif'],
        'sans-medium': ['PlusJakartaSans-Medium', 'system-ui', 'sans-serif'],
        'sans-bold': ['PlusJakartaSans-Bold', 'system-ui', 'sans-serif'],
        serif: ['NotoSerif-Regular', 'Georgia', 'serif'],
        'serif-bold': ['NotoSerif-Bold', 'Georgia', 'serif'],
      },

      // Spacing system (4px base, mobile-first)
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        'xxl': '32px',
      },

      // Border radius
      borderRadius: {
        'button': '12px',
        'card': '16px',
        'modal': '20px',
      },

      // Shadows (subtle, brand-appropriate)
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'lg': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },

      // Animation timings
      transitionDuration: {
        'fast': '150ms',
        'DEFAULT': '250ms',
        'slow': '350ms',
      },

      // Touch targets (WCAG AAA)
      minHeight: {
        'touch': '44px',
        'touch-compact': '40px',
        'touch-large': '56px',
      },
      minWidth: {
        'touch': '44px',
        'touch-compact': '40px',
        'touch-large': '56px',
      },

      // Typography sizes
      fontSize: {
        // Display sizes
        'display-large': '48px',
        'display-medium': '36px',
        'display-small': '32px',

        // Headlines
        'headline-large': '26px',
        'headline-medium': '22px',
        'headline-small': '20px',

        // Titles
        'title-large': '18px',
        'title-medium': '16px',
        'title-small': '14px',

        // Body
        'body-large': '16px',
        'body-medium': '14px',
        'body-small': '12px',

        // Labels
        'label-large': '13px',
        'label-medium': '12px',
        'label-small': '11px',

        // Special
        'stats': '28px',
        'caption': '10px',
      },
    },
  },
  plugins: [],
};
