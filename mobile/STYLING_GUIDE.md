# Mobile App Styling Guide

## Architecture: shadcn/ui + NativeWind + React Native

This app uses the shadcn/ui philosophy for React Native with NativeWind (Tailwind CSS).

## ⚠️ CRITICAL RULE: NO HARDCODED VALUES

**NEVER hardcode colors, spacing, or design values in components.**

### ❌ WRONG:
```javascript
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4B0082',  // WRONG! Hardcoded color
    padding: 12,                 // WRONG! Hardcoded spacing
    borderRadius: 24,            // WRONG! Hardcoded radius
    color: '#FFFFFF',            // WRONG! Hardcoded color
  }
});
```

### ✅ CORRECT:
```javascript
import { useTheme } from '../contexts/ThemeContext';
import { spacing, radius } from '../constants/design-tokens';

function MyComponent() {
  const { colors } = useTheme();

  // Option 1: NativeWind classes (PREFERRED)
  return (
    <View className="bg-tanzanite p-md rounded-button">
      <Text className="text-on-primary">Hello</Text>
    </View>
  );

  // Option 2: Dynamic inline styles (when calculations needed)
  return (
    <View style={{
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: radius.button,
    }}>
      <Text style={{ color: colors.onPrimary }}>Hello</Text>
    </View>
  );

  // Option 3: StyleSheet with design-tokens (for static values only)
  const styles = StyleSheet.create({
    container: {
      padding: spacing.md,
      borderRadius: radius.button,
    }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={{ color: colors.onPrimary }}>Hello</Text>
    </View>
  );
}
```

## Styling Priority (Use in this order)

### 1. NativeWind Classes (PREFERRED)
Use Tailwind utility classes whenever possible:

```javascript
<View className="bg-tanzanite p-md rounded-button border border-outline">
  <Text className="text-on-primary font-sans-bold text-title-large">
    Title
  </Text>
</View>
```

**Available NativeWind color classes:**
- `bg-tanzanite`, `text-on-primary` - Primary colors
- `bg-cobalt`, `text-on-secondary` - Secondary colors
- `bg-malachite`, `bg-gold`, `bg-terracotta` - Accent colors
- `bg-surface`, `bg-surface-variant`, `text-on-surface`
- `bg-error`, `bg-success`, `bg-warning`
- `border-outline`, `border-outline-variant`

**Available spacing classes:**
- `p-xs`, `p-sm`, `p-md`, `p-lg`, `p-xl`, `p-xxl`
- `m-xs`, `m-sm`, `m-md`, `m-lg`, `m-xl`, `m-xxl`
- `gap-xs`, `gap-sm`, `gap-md`, `gap-lg`, `gap-xl`

**Available radius classes:**
- `rounded-button` (24px)
- `rounded-card` (16px)
- `rounded-modal` (20px)

### 2. Theme Hook Colors (for dynamic values)
When you need dynamic colors in JavaScript:

```javascript
const { colors } = useTheme();

<Icon color={colors.primary} />
<View style={{ backgroundColor: colors.surface }} />
```

**Available theme colors:**
```javascript
colors.primary          // Tanzanite #4B0082
colors.secondary        // Cobalt #0047AB
colors.accent           // Gold #5D4037
colors.tertiary         // Terracotta #d4634a

colors.surface          // Surface background
colors.surfaceVariant   // Subtle background
colors.background       // Main background

colors.text             // Primary text color
colors.textSecondary    // Secondary text color
colors.onPrimary        // Text on primary color
colors.onSecondary      // Text on secondary color
colors.onSurface        // Text on surface

colors.error            // Error red
colors.success          // Success green (Malachite)
colors.warning          // Warning orange

colors.outline          // Border color
colors.outlineVariant   // Subtle border
```

### 3. Design Tokens (for calculations)
Import design tokens for calculations in StyleSheet or JavaScript:

```javascript
import { spacing, radius, layout, touchTargets, shadows } from '../constants/design-tokens';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,              // 12
    borderRadius: radius.button,       // 24
    minHeight: touchTargets.minimum,   // 44
    ...shadows.medium,
  },
  calculated: {
    paddingTop: spacing.lg + spacing.sm, // 16 + 8 = 24
  }
});
```

**Available design tokens:**
```javascript
// Spacing (pixels)
spacing.xs    // 4
spacing.sm    // 8
spacing.md    // 12
spacing.lg    // 16
spacing.xl    // 20
spacing.xxl   // 24

// Radius (pixels)
radius.button // 24
radius.card   // 16
radius.modal  // 20

// Layout constants
layout.touchTarget          // 44
layout.touchTargetCompact   // 40
layout.touchTargetLarge     // 48
layout.maxContentWidth      // 1200
layout.cardImageWidth       // 80
layout.cardImageHeight      // 80
layout.progressDotSize      // 6
layout.progressDotActive    // 18

// Touch targets (WCAG AAA)
touchTargets.minimum  // 44
touchTargets.compact  // 40
touchTargets.large    // 56

// Shadows
shadows.small
shadows.medium
shadows.large

// Animation durations (ms)
animation.fast    // 150
animation.medium  // 250
animation.slow    // 350

// Scroll behavior
scroll.headerThreshold  // 100
scroll.headerHeight     // 60
```

## Font Families

**NEVER hardcode font family strings!** Use NativeWind classes:

```javascript
// ✅ CORRECT
<Text className="font-sans">Regular text</Text>
<Text className="font-sans-medium">Medium text</Text>
<Text className="font-sans-bold">Bold text</Text>
<Text className="font-serif">Serif text</Text>
<Text className="font-serif-bold">Bold serif</Text>

// ❌ WRONG
<Text style={{ fontFamily: 'PlusJakartaSans-Regular' }}>Text</Text>
```

If you must use StyleSheet, use the font family names directly but this is discouraged:
```javascript
// Only if absolutely necessary
fontFamily: 'PlusJakartaSans-Regular'
fontFamily: 'PlusJakartaSans-Medium'
fontFamily: 'PlusJakartaSans-Bold'
fontFamily: 'NotoSerif-Regular'
fontFamily: 'NotoSerif-Bold'
```

## Typography Scale

Use NativeWind text size classes:

```javascript
<Text className="text-display-large">Display</Text>
<Text className="text-headline-large">Headline</Text>
<Text className="text-title-large">Title</Text>
<Text className="text-body-large">Body</Text>
<Text className="text-label-large">Label</Text>
```

## Exceptions: When Hardcoding is OK

### 1. Centralized Color Objects for Immersive UIs
When a screen has an intentionally fixed immersive design (like a dark modal), define colors ONCE at the top:

```javascript
export default function OnboardingScreen() {
  const { colors } = useTheme();

  // Centralized immersive dark modal colors
  // All colors defined ONCE here, referenced throughout component
  const modalColors = {
    background: '#1a1a2e',  // Dark immersive background
    text: '#FFFFFF',         // White text on dark
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    border: 'rgba(255, 255, 255, 0.3)',
    primary: colors.primary,      // Still use theme colors!
    error: colors.error,
  };

  return (
    <View style={{ backgroundColor: modalColors.background }}>
      <Text style={{ color: modalColors.text }}>Title</Text>
      <Text style={{ color: modalColors.textSecondary }}>Subtitle</Text>
    </View>
  );
}
```

**Rule**: Colors defined ONCE at the top, then referenced. Never scattered throughout.

### 2. National Symbols (Zimbabwe Flag)
Static national colors that never change:

```javascript
// Zimbabwe flag colors - these are national symbols, not theme colors
const ZW_COLORS = {
  green: '#009739',   // Growth, agriculture
  yellow: '#FCD116',  // Mineral wealth
  red: '#CE1126',     // Heritage
  black: '#000000',   // African heritage
  white: '#FFFFFF',   // Peace, unity
};
```

### 3. Pure Black/White for Maximum Contrast

Use `staticColors` from design-tokens for guaranteed pure black/white:

```javascript
import { staticColors } from '../constants/design-tokens';

// ✅ CORRECT: Pure white text on colored background
<Text style={{ color: staticColors.white }}>Text on primary color</Text>

// ✅ CORRECT: Pure black for shadows
shadowColor: staticColors.black

// ✅ CORRECT: Backdrop overlays with transparency
backgroundColor: 'rgba(0, 0, 0, 0.6)'  // OK - transparency calculations

// ❌ WRONG: Hardcoding white/black
<Text style={{ color: '#FFFFFF' }}>Wrong</Text>  // Should use staticColors.white
```

**Note**: Only use `staticColors.white/black` when you need GUARANTEED pure white/black (like text on primary color). For most cases, use `colors.onPrimary`, `colors.text`, etc. from the theme.

## Common Patterns

### Glass Morphism Effect
```javascript
const { colors } = useTheme();

<View style={{
  backgroundColor: colors.surfaceVariant,
  borderWidth: 1,
  borderColor: colors.outline,
}}>
```

### Selected State
```javascript
const { colors } = useTheme();

<View style={{
  backgroundColor: selected ? colors.primary : colors.surface,
  borderColor: selected ? colors.primary : colors.outline,
}}>
  <Text style={{ color: selected ? colors.onPrimary : colors.text }}>
    {label}
  </Text>
</View>
```

### Icon Colors
```javascript
const { colors } = useTheme();

<Icon
  size={20}
  color={active ? colors.primary : colors.textSecondary}
/>
```

## Migration Checklist

When migrating from mukokoTheme:

- [ ] Remove `import mukokoTheme from '../theme'`
- [ ] Add `import { useTheme } from '../contexts/ThemeContext'`
- [ ] Add `import { spacing, radius, ... } from '../constants/design-tokens'`
- [ ] Add `const { colors } = useTheme()` in component
- [ ] Replace all hardcoded colors with `colors.*`
- [ ] Replace all `mukokoTheme.spacing.*` with `spacing.*`
- [ ] Replace all `mukokoTheme.fonts.*` with NativeWind classes or direct font names
- [ ] Use NativeWind classes where possible instead of StyleSheet

## Why This Matters

1. **Theme switching**: Users can switch between light/dark mode
2. **Consistency**: All components use the same color system
3. **Maintainability**: Change colors once in theme, not in 100 files
4. **Accessibility**: Theme handles WCAG contrast ratios
5. **Brand updates**: Rebrand by updating theme, not every component

## Resources

- Theme Context: `mobile/contexts/ThemeContext.js`
- Design Tokens: `mobile/constants/design-tokens.js`
- Tailwind Config: `mobile/tailwind.config.js`
- Global Styles: `mobile/global.css`
