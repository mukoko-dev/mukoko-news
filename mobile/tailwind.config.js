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
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Colors reference CSS variables from global.css
      colors: {
        tanzanite: {
          DEFAULT: 'rgb(var(--color-tanzanite) / <alpha-value>)',
          light: 'rgb(var(--color-tanzanite-light) / <alpha-value>)',
          hover: 'rgb(var(--color-tanzanite-hover) / <alpha-value>)',
          active: 'rgb(var(--color-tanzanite-active) / <alpha-value>)',
          container: 'rgb(var(--color-tanzanite-container) / <alpha-value>)',
          'on-container': 'rgb(var(--color-tanzanite-on-container) / <alpha-value>)',
        },
        cobalt: {
          DEFAULT: 'rgb(var(--color-cobalt) / <alpha-value>)',
          light: 'rgb(var(--color-cobalt-light) / <alpha-value>)',
          container: 'rgb(var(--color-cobalt-container) / <alpha-value>)',
          'on-container': 'rgb(var(--color-cobalt-on-container) / <alpha-value>)',
        },
        malachite: {
          DEFAULT: 'rgb(var(--color-malachite) / <alpha-value>)',
          light: 'rgb(var(--color-malachite-light) / <alpha-value>)',
          container: 'rgb(var(--color-malachite-container) / <alpha-value>)',
          'on-container': 'rgb(var(--color-malachite-on-container) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--color-gold) / <alpha-value>)',
          light: 'rgb(var(--color-gold-light) / <alpha-value>)',
          container: 'rgb(var(--color-gold-container) / <alpha-value>)',
          'on-container': 'rgb(var(--color-gold-on-container) / <alpha-value>)',
        },
        terracotta: {
          DEFAULT: 'rgb(var(--color-terracotta) / <alpha-value>)',
          light: 'rgb(var(--color-terracotta-light) / <alpha-value>)',
          container: 'rgb(var(--color-terracotta-container) / <alpha-value>)',
          'on-container': 'rgb(var(--color-terracotta-on-container) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          variant: 'rgb(var(--color-surface-variant) / <alpha-value>)',
          subtle: 'rgb(var(--color-surface-subtle) / <alpha-value>)',
          dim: 'rgb(var(--color-surface-dim) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
          container: 'rgb(var(--color-error-container) / <alpha-value>)',
          'on-container': 'rgb(var(--color-error-on-container) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          container: 'rgb(var(--color-success-container) / <alpha-value>)',
          'on-container': 'rgb(var(--color-success-on-container) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          container: 'rgb(var(--color-warning-container) / <alpha-value>)',
          'on-container': 'rgb(var(--color-warning-on-container) / <alpha-value>)',
        },
        'brand-twitter': 'rgb(var(--color-brand-twitter) / <alpha-value>)',
        'brand-whatsapp': 'rgb(var(--color-brand-whatsapp) / <alpha-value>)',
        'brand-facebook': 'rgb(var(--color-brand-facebook) / <alpha-value>)',
        'brand-linkedin': 'rgb(var(--color-brand-linkedin) / <alpha-value>)',
        'on-surface': 'rgb(var(--color-on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-on-surface-variant) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        'on-secondary': 'rgb(var(--color-on-secondary) / <alpha-value>)',
        'on-accent': 'rgb(var(--color-on-accent) / <alpha-value>)',
        outline: 'rgb(var(--color-outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--color-outline-variant) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        'on-background': 'rgb(var(--color-on-background) / <alpha-value>)',
      },

      // Spacing references CSS variables
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        xxl: 'var(--spacing-xxl)',
      },

      // Border radius references CSS variables
      borderRadius: {
        button: 'var(--radius-button)',
        card: 'var(--radius-card)',
        modal: 'var(--radius-modal)',
      },

      // Shadows reference CSS variables
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },

      // Animation timings reference CSS variables
      transitionDuration: {
        fast: 'var(--duration-fast)',
        DEFAULT: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },

      // Touch targets reference CSS variables
      minHeight: {
        touch: 'var(--touch-target)',
        'touch-compact': 'var(--touch-target-compact)',
        'touch-large': 'var(--touch-target-large)',
      },
      minWidth: {
        touch: 'var(--touch-target)',
        'touch-compact': 'var(--touch-target-compact)',
        'touch-large': 'var(--touch-target-large)',
      },

      // Typography sizes reference CSS variables
      fontSize: {
        'display-large': 'var(--font-size-display-large)',
        'display-medium': 'var(--font-size-display-medium)',
        'display-small': 'var(--font-size-display-small)',
        'headline-large': 'var(--font-size-headline-large)',
        'headline-medium': 'var(--font-size-headline-medium)',
        'headline-small': 'var(--font-size-headline-small)',
        'title-large': 'var(--font-size-title-large)',
        'title-medium': 'var(--font-size-title-medium)',
        'title-small': 'var(--font-size-title-small)',
        'body-large': 'var(--font-size-body-large)',
        'body-medium': 'var(--font-size-body-medium)',
        'body-small': 'var(--font-size-body-small)',
        'label-large': 'var(--font-size-label-large)',
        'label-medium': 'var(--font-size-label-medium)',
        'label-small': 'var(--font-size-label-small)',
        stats: 'var(--font-size-stats)',
        caption: 'var(--font-size-caption)',
      },

      // Font families reference CSS variables
      fontFamily: {
        sans: 'var(--font-sans)',
        'sans-medium': 'var(--font-sans-medium)',
        'sans-bold': 'var(--font-sans-bold)',
        serif: 'var(--font-serif)',
        'serif-bold': 'var(--font-serif-bold)',
      },
    },
  },
  plugins: [],
};
