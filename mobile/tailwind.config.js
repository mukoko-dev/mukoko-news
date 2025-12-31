/** @type {import('tailwindcss').Config} */
/**
 * Mukoko News Tailwind Configuration
 * References Nyuchi Brand System from global.css
 */

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './navigation/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Colors - Direct values for React Native (NativeWind doesn't support CSS variables)
      // These match the values in global.css
      colors: {
        tanzanite: {
          DEFAULT: '#4B0082',
          light: '#B388FF',
          hover: '#3D0066',
          active: '#2E004D',
          container: '#EDE7F6',
          'on-container': '#4B0082',
        },
        cobalt: {
          DEFAULT: '#0047AB',
          light: '#64B5F6',
          container: '#E3F2FD',
          'on-container': '#0047AB',
        },
        malachite: {
          DEFAULT: '#004D40',
          light: '#4DB6AC',
          container: '#E0F2F1',
          'on-container': '#004D40',
        },
        gold: {
          DEFAULT: '#5D4037',
          light: '#A1887F',
          container: '#EFEBE9',
          'on-container': '#5D4037',
        },
        terracotta: {
          DEFAULT: '#D4634A',
          light: '#FFAB91',
          container: '#FBE9E7',
          'on-container': '#D4634A',
        },
        surface: {
          DEFAULT: '#FAF9F5',
          variant: '#F5F5F0',
          subtle: '#FEFEFE',
          dim: '#E8E7E3',
        },
        error: {
          DEFAULT: '#B3261E',
          container: '#F9DEDC',
          'on-container': '#410E0B',
        },
        success: {
          DEFAULT: '#00C853',
          container: '#C8E6C9',
          'on-container': '#1B5E20',
        },
        warning: {
          DEFAULT: '#F57C00',
          container: '#FFE0B2',
          'on-container': '#E65100',
        },
        'brand-twitter': '#1DA1F2',
        'brand-whatsapp': '#25D366',
        'brand-facebook': '#1877F2',
        'brand-linkedin': '#0A66C2',
        'on-surface': '#1C1B1F',
        'on-surface-variant': '#49454F',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        'on-accent': '#FFFFFF',
        outline: '#79747E',
        'outline-variant': '#CAC4D0',
        background: '#FAF9F5',
        'on-background': '#1C1B1F',
      },

      // Spacing - Direct pixel values for React Native
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        xxl: '24px',
      },

      // Border radius - Direct pixel values
      borderRadius: {
        button: '24px',
        card: '16px',
        modal: '20px',
      },

      // Shadows - React Native compatible (minimal - RN uses elevation)
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        lg: '0 4px 8px 0 rgba(0, 0, 0, 0.12)',
      },

      // Animation timings - Direct millisecond values
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '250ms',
        slow: '350ms',
      },

      // Touch targets - Direct pixel values
      minHeight: {
        touch: '44px',
        'touch-compact': '40px',
        'touch-large': '56px',
      },
      minWidth: {
        touch: '44px',
        'touch-compact': '40px',
        'touch-large': '56px',
      },

      // Typography sizes - Direct pixel values
      fontSize: {
        'display-large': '57px',
        'display-medium': '45px',
        'display-small': '36px',
        'headline-large': '32px',
        'headline-medium': '28px',
        'headline-small': '24px',
        'title-large': '22px',
        'title-medium': '16px',
        'title-small': '14px',
        'body-large': '16px',
        'body-medium': '14px',
        'body-small': '12px',
        'label-large': '14px',
        'label-medium': '12px',
        'label-small': '11px',
        stats: '28px',
        caption: '10px',
      },

      // Font families - Direct font names for React Native
      fontFamily: {
        sans: ['PlusJakartaSans-Regular', 'system-ui', 'sans-serif'],
        'sans-medium': ['PlusJakartaSans-Medium', 'system-ui', 'sans-serif'],
        'sans-bold': ['PlusJakartaSans-Bold', 'system-ui', 'sans-serif'],
        serif: ['NotoSerif-Regular', 'Georgia', 'serif'],
        'serif-bold': ['NotoSerif-Bold', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
