# Mukoko News - Brand Guidelines

This document defines the visual identity, color system, typography, and design patterns for Mukoko News. All UI elements must adhere to these guidelines to maintain brand consistency.

---

## Brand Identity

**Mission**: Celebrate Zimbabwe journalism and provide a modern, mobile-first news aggregation platform that connects readers with quality local journalism.

**Voice**: Professional yet accessible, celebrating Zimbabwe's heritage while embracing modern technology.

**Visual Theme**: Sophisticated purple-gray and warm terracotta palette with a light, glassmorphic interface. Clean typography and mobile-first design patterns. Zimbabwe flag colors are reserved for the flag strip brand element only.

---

## Color System

### Mukoko Brand Palette (January 2025)

The application uses a sophisticated purple-gray and terracotta color system designed for WCAG AA accessibility compliance.

```css
:root {
  /* Primary Brand Colors */
  --primary: #5e5772;           /* Sophisticated purple-gray */
  --primary-hover: #6f6885;     /* Hover state */
  --primary-active: #4d475f;    /* Active/pressed state */
  --primary-container: #e8e6ec; /* Light purple background */

  /* Accent Color */
  --accent: #d4634a;            /* Warm terracotta/coral */
  --accent-container: #fce8e4;  /* Light terracotta background */

  /* Semantic Colors */
  --success: #779b63;           /* Green for success states */
  --warning: #e5a84d;           /* Amber for warnings */
  --error: #d4634a;             /* Uses accent color for errors */

  /* Surface Colors */
  --surface: #FFFFFF;           /* White card backgrounds */
  --surface-variant: #f9f8f4;   /* Warm off-white backgrounds */
  --background: #f7f6f8;        /* Light purple-tinted page background */

  /* Text Colors (WCAG AA Compliant) */
  --on-surface: #1f1f1f;        /* Primary text - high contrast */
  --on-surface-variant: #4a4a4a; /* Secondary text - WCAG AA compliant */
  --on-surface-disabled: rgba(26, 26, 26, 0.55); /* Disabled text */
}
```

### Zimbabwe Flag Colors (Flag Strip Only)

These colors are **only used for the Zimbabwe flag strip** brand element.

```css
:root {
  --zw-green: #00A651;   /* Flag strip only */
  --zw-yellow: #FDD116;  /* Flag strip only */
  --zw-red: #EF3340;     /* Flag strip only */
  --zw-black: #000000;   /* Flag strip only */
  --zw-white: #FFFFFF;   /* Flag strip only */
}
```

### Color Usage Guidelines

#### Primary (#5e5772)
**Primary Action Color**
- Primary buttons and CTAs
- Links and interactive elements
- Active/selected states
- Focus rings and borders
- Navigation highlights

**Examples** (React Native Paper):
```javascript
// Primary button
<Button mode="contained" buttonColor="#5e5772">Action</Button>

// Text link
<Text style={{ color: '#5e5772' }}>Link Text</Text>

// Focus/active state
activeOutlineColor={mukokoTheme.colors.primary}
selectionColor={mukokoTheme.colors.primary}
```

#### Accent (#d4634a)
**Accent and Error Color**
- Error states and messages
- Destructive actions (delete, remove)
- Warning highlights
- Accent elements
- Error input borders

**Examples**:
```javascript
// Error message
<Text style={{ color: '#d4634a' }}>Error message</Text>

// Error banner background
backgroundColor: '#d4634a15' // 15% opacity
borderColor: '#d4634a30'     // 30% opacity
```

#### Success (#779b63)
**Success and Positive States**
- Success confirmations
- Positive indicators and metrics
- Growth visualizations
- Valid input states

**Examples**:
```javascript
// Success message
<Text style={{ color: '#779b63' }}>Success!</Text>

// Success icon
<Icon color="#779b63" />
```

#### Surface Colors
**Backgrounds and Cards**
- Surface (#FFFFFF): Card backgrounds
- Surface Variant (#f9f8f4): Page backgrounds, warm off-white
- Background (#f7f6f8): Light purple-tinted base

**Examples**:
```javascript
// Card background
backgroundColor: '#FFFFFF'

// Page background
backgroundColor: '#f9f8f4'
```

#### Text Colors (WCAG AA Compliant)
**Typography**
- On Surface (#1f1f1f): Primary text, headings
- On Surface Variant (#4a4a4a): Secondary text, captions
- On Surface Disabled (rgba(26,26,26,0.55)): Disabled states

**Examples**:
```javascript
// Primary text
color: '#1f1f1f'

// Secondary/muted text
color: '#4a4a4a'

// Disabled text
color: 'rgba(26, 26, 26, 0.55)'
```

### Outline Colors

For borders, dividers, and subtle UI elements:

```javascript
outline: '#e0dfdc'        // Default border color
outlineVariant: '#f0efec' // Lighter variant
```

---

## Typography System

### Font Families

The application uses a **dual-font system** for optimal readability and brand consistency.

#### Serif Font - Noto Serif (Headings/Logo)
**Usage**: All headings (h1-h6), titles, logo text, and branded elements

```css
font-family: 'NotoSerif-Regular', 'NotoSerif-Bold', Georgia, serif;
```

**Examples**:
- Page titles
- Article headlines
- Section headers
- Logo text ("Mukoko News")
- Feature titles

#### Sans-Serif Font - Plus Jakarta Sans (Body)
**Usage**: All body text, UI elements, buttons, inputs

```css
font-family: 'PlusJakartaSans-Regular', 'PlusJakartaSans-Medium', 'PlusJakartaSans-Bold', sans-serif;
```

**Examples**:
- Paragraphs
- Button text
- Form inputs
- Navigation items
- UI labels and descriptions

### Font Scale

```css
/* Headings */
text-4xl: 2.25rem (36px)  /* Hero titles */
text-3xl: 1.875rem (30px) /* Page titles */
text-2xl: 1.5rem (24px)   /* Section titles */
text-xl: 1.25rem (20px)   /* Subsection titles */
text-lg: 1.125rem (18px)  /* Large body */

/* Body */
text-base: 1rem (16px)    /* Default body text */
text-sm: 0.875rem (14px)  /* Secondary text */
text-xs: 0.75rem (12px)   /* Captions, labels */
```

### Font Weights

```css
font-normal: 400   /* Body text */
font-medium: 500   /* Emphasis */
font-semibold: 600 /* Headings, buttons */
font-bold: 700     /* Strong emphasis */
```

### Typography Examples

```tsx
{/* Hero Title */}
<h1 className="text-4xl font-serif font-bold text-white">
  Welcome to Harare Metro
</h1>

{/* Section Title */}
<h2 className="text-2xl font-serif font-semibold text-white mb-4">
  Latest News
</h2>

{/* Body Text */}
<p className="text-base font-sans text-gray-300">
  This is body text using Inter font for maximum readability.
</p>

{/* Button Text */}
<button className="font-sans font-semibold">
  Read More
</button>
```

---

## Brand Element: Zimbabwe Flag Strip

The Zimbabwe flag strip is a **core brand element** and must be present on all full-page layouts.

### Implementation

```tsx
{/* Zimbabwe Flag Strip - Always include in full-page layouts */}
<div className="fixed top-0 left-0 w-2 h-screen z-50 bg-gradient-to-b from-[hsl(var(--zw-green))] via-[hsl(var(--zw-yellow))] via-40% via-[hsl(var(--zw-red))] via-60% via-[hsl(var(--zw-black))] to-[hsl(var(--zw-white))]" />
```

### Specifications
- **Position**: Fixed to left edge
- **Width**: 8px (2 in Tailwind units)
- **Height**: Full viewport height
- **Z-index**: 1000 (above most content)
- **Color Stops**:
  - 0-20%: Green
  - 20-40%: Yellow
  - 40-60%: Red
  - 60-80%: Black
  - 80-100%: White

### Usage Guidelines
- **Always present** on full-page views (home, articles, profiles)
- **Optional** on modals and overlays
- **Never hide** or obscure with content
- Consider left padding (`pl-3` or `pl-4`) on main content to prevent overlap

---

## UI Components

### Buttons (React Native Paper)

#### Primary Button
```javascript
<Button
  mode="contained"
  buttonColor="#5e5772"
  textColor="#FFFFFF"
  onPress={handlePress}
>
  Primary Action
</Button>
```

#### Outlined Button
```javascript
<Button
  mode="outlined"
  textColor="#5e5772"
  onPress={handlePress}
>
  Secondary Action
</Button>
```

#### Destructive Button
```javascript
<Button
  mode="contained"
  buttonColor="#d4634a"
  textColor="#FFFFFF"
  onPress={handleDelete}
>
  Delete
</Button>
```

#### Disabled State
```javascript
<Button
  mode="contained"
  buttonColor="#5e5772"
  disabled={true}
>
  Disabled
</Button>
```

### Cards (React Native Paper)

```javascript
<Surface
  style={{
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e0dfdc',
  }}
  elevation={2}
>
  {/* Card content */}
</Surface>
```

**Specifications**:
- Background: `#FFFFFF` (surface)
- Border: `#e0dfdc` (outline)
- Rounded: `24` (borderRadius)
- Padding: `24`
- Elevation: `2`

### Form Inputs (React Native Paper)

```javascript
<TextInput
  mode="outlined"
  label="Input Label"
  value={value}
  onChangeText={setValue}
  style={{ backgroundColor: '#FFFFFF' }}
  outlineColor="#e0dfdc"
  activeOutlineColor="#5e5772"
  selectionColor="#5e5772"
  cursorColor="#5e5772"
/>
```

**Specifications**:
- Background: `#FFFFFF` (surface)
- Border: `#e0dfdc` (outline)
- Focus border: `#5e5772` (primary)
- Selection: `#5e5772` (primary)

### Error Input

```javascript
<TextInput
  mode="outlined"
  label="Input Label"
  value={value}
  error={true}
  outlineColor="#d4634a"
  activeOutlineColor="#d4634a"
/>
<HelperText type="error">
  Error message here
</HelperText>
```

### Success Input

```javascript
<TextInput
  mode="outlined"
  label="Input Label"
  value={value}
  outlineColor="#779b63"
  activeOutlineColor="#779b63"
  right={<TextInput.Icon icon="check" color="#779b63" />}
/>
```

---

## Design Patterns

### Mobile-First Approach

All components must be designed with mobile as the primary experience.

**Responsive Breakpoints**:
```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Touch-Friendly Elements

- **Minimum touch target**: 44px × 44px
- **Button height**: 48px (`py-3`)
- **Spacing between interactive elements**: 8px minimum

### Rounded Corners

**Standard Rounding**:
- Small elements (badges, tags): `rounded-lg` (8px)
- Buttons, inputs: `rounded-xl` (12px)
- Cards, panels: `rounded-2xl` (16px)
- Modals: `rounded-3xl` (24px)
- Avatars, icons: `rounded-full` (circular)

### Loading States

```javascript
// React Native Paper ActivityIndicator
<ActivityIndicator size="large" color="#5e5772" />

// Skeleton placeholder
<View style={{
  width: '100%',
  height: 16,
  backgroundColor: '#e8e6ec',
  borderRadius: 8,
}} />
```

### Transitions

All interactive elements should have smooth transitions:

```css
transition-colors   /* Color changes */
transition-all      /* All properties */
duration-200        /* 200ms (default) */
duration-300        /* 300ms (slower) */
```

---

## Layout Patterns

### Container Widths

```tsx
{/* Full width mobile, constrained desktop */}
<div className="w-full max-w-7xl mx-auto px-4">
  {/* Content */}
</div>

{/* Narrow content (forms, articles) */}
<div className="w-full max-w-2xl mx-auto px-4">
  {/* Content */}
</div>
```

### Spacing Scale

```css
gap-2: 0.5rem (8px)    /* Tight spacing */
gap-3: 0.75rem (12px)  /* Compact spacing */
gap-4: 1rem (16px)     /* Default spacing */
gap-6: 1.5rem (24px)   /* Comfortable spacing */
gap-8: 2rem (32px)     /* Generous spacing */
```

---

## Iconography

### Icon Library

**Primary**: Lucide React
```tsx
import { Heart, Bookmark, Share, ArrowRight } from 'lucide-react';
```

### Icon Sizing

```tsx
{/* Small icons */}
<Icon className="w-4 h-4" />

{/* Default icons */}
<Icon className="w-5 h-5" />

{/* Large icons */}
<Icon className="w-6 h-6" />

{/* Hero icons */}
<Icon className="w-8 h-8" />
```

### Icon Colors

- Default: `#4a4a4a` (onSurfaceVariant)
- Active/Selected: `#5e5772` (primary)
- Success: `#779b63` (success)
- Destructive: `#d4634a` (accent/error)
- On primary: `#FFFFFF` (onPrimary)

---

## Accessibility

### Contrast Ratios

All text must meet WCAG AA standards:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum

### Focus States

All interactive elements must have visible focus states:

```javascript
// React Native Paper components handle focus automatically
// For custom components:
{
  borderColor: focused ? '#5e5772' : '#e0dfdc',
  borderWidth: focused ? 2 : 1,
}
```

### Semantic HTML

- Use proper heading hierarchy (h1 → h2 → h3)
- Use `<button>` for actions, `<a>` for navigation
- Include `aria-label` for icon-only buttons
- Provide alt text for all images

---

## Animation Guidelines

### Timing Functions

```css
ease-in-out  /* Default for most transitions */
ease-out     /* Enter animations */
ease-in      /* Exit animations */
```

### Animation Duration

- **Micro-interactions**: 150-200ms
- **Standard transitions**: 200-300ms
- **Large movements**: 300-500ms

### Common Animations

```tsx
{/* Fade in */}
<div className="animate-in fade-in duration-300">

{/* Slide up */}
<div className="animate-in slide-in-from-bottom duration-500">

{/* Scale */}
<button className="hover:scale-105 transition-transform">
```

---

## Do's and Don'ts

### ✅ Do

- Use Zimbabwe flag colors exclusively
- Apply `font-serif` to all headings
- Include the flag strip on full-page layouts
- Design mobile-first
- Use rounded corners consistently
- Provide loading and error states
- Maintain minimum 44px touch targets
- Use semantic HTML

### ❌ Don't

- Introduce new colors outside the flag palette
- Mix additional font families
- Use sharp corners (no `rounded-none`)
- Remove the Zimbabwe flag strip
- Use small touch targets (<44px)
- Skip focus states
- Use overly bright colors on dark backgrounds
- Ignore mobile experience

---

## Brand Assets

### Logo Usage

The "Mukoko News" logo should always use:
- Font: Noto Serif Bold
- Colors: "Mukoko" in primary (#5e5772), "News" in accent (#d4634a) or vice versa
- Never stretch or distort
- Maintain minimum clear space

```javascript
// React Native
<Text style={{ fontFamily: 'NotoSerif-Bold', fontSize: 24 }}>
  <Text style={{ color: '#5e5772' }}>Mukoko</Text>
  {' '}
  <Text style={{ color: '#d4634a' }}>News</Text>
</Text>
```

---

## Examples

### Article Card (React Native)

```javascript
<Surface style={styles.articleCard} elevation={2}>
  {/* Category Badge */}
  <View style={styles.categoryBadge}>
    <Text style={styles.categoryText}>Politics</Text>
  </View>

  {/* Title */}
  <Text style={styles.title}>
    Article Headline Goes Here
  </Text>

  {/* Excerpt */}
  <Text style={styles.excerpt}>
    Article excerpt for preview...
  </Text>

  {/* Actions */}
  <View style={styles.actions}>
    <TouchableOpacity style={styles.actionButton}>
      <Icon source="heart-outline" size={16} color="#4a4a4a" />
      <Text style={styles.actionText}>24</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton}>
      <Icon source="bookmark-outline" size={16} color="#4a4a4a" />
    </TouchableOpacity>
  </View>
</Surface>

// Styles
const styles = StyleSheet.create({
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  categoryBadge: {
    backgroundColor: '#e8e6ec',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#5e5772',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  title: {
    fontFamily: 'NotoSerif-Bold',
    fontSize: 18,
    color: '#1f1f1f',
    marginBottom: 8,
  },
  excerpt: {
    color: '#4a4a4a',
    fontSize: 14,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#4a4a4a',
    fontSize: 14,
  },
});
```

### Modal (React Native Paper)

```javascript
<Portal>
  <Modal
    visible={visible}
    onDismiss={onDismiss}
    contentContainerStyle={styles.modalContainer}
  >
    {/* Modal content */}
    <Text style={styles.modalTitle}>
      Modal Title
    </Text>
    <Text style={styles.modalText}>
      Modal content goes here...
    </Text>

    {/* Actions */}
    <View style={styles.modalActions}>
      <Button
        mode="outlined"
        onPress={onDismiss}
        style={styles.modalButton}
      >
        Cancel
      </Button>
      <Button
        mode="contained"
        buttonColor="#5e5772"
        onPress={onConfirm}
        style={styles.modalButton}
      >
        Confirm
      </Button>
    </View>
  </Modal>
</Portal>

// Styles
const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    margin: 16,
  },
  modalTitle: {
    fontFamily: 'NotoSerif-Bold',
    fontSize: 24,
    color: '#1f1f1f',
    marginBottom: 16,
  },
  modalText: {
    color: '#4a4a4a',
    fontSize: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
```

---

## Quick Reference

### Color Values (React Native / JavaScript)

```javascript
// Primary Brand
primary: '#5e5772'
primaryHover: '#6f6885'
primaryActive: '#4d475f'
primaryContainer: '#e8e6ec'

// Accent
accent: '#d4634a'
accentContainer: '#fce8e4'

// Semantic
success: '#779b63'
warning: '#e5a84d'
error: '#d4634a'

// Surfaces
surface: '#FFFFFF'
surfaceVariant: '#f9f8f4'
background: '#f7f6f8'

// Text (WCAG AA)
onSurface: '#1f1f1f'
onSurfaceVariant: '#4a4a4a'
onSurfaceDisabled: 'rgba(26, 26, 26, 0.55)'

// Borders
outline: '#e0dfdc'
outlineVariant: '#f0efec'
```

### Typography (React Native)

```javascript
// Headings/Logo
fontFamily: 'NotoSerif-Regular' // or 'NotoSerif-Bold'

// Body text
fontFamily: 'PlusJakartaSans-Regular' // or Medium, Bold
```

### Common Component Patterns

```javascript
// Primary Button
<Button
  mode="contained"
  buttonColor={mukokoTheme.colors.primary}
/>

// Outlined Input
<TextInput
  mode="outlined"
  outlineColor={mukokoTheme.colors.outline}
  activeOutlineColor={mukokoTheme.colors.primary}
  selectionColor={mukokoTheme.colors.primary}
/>

// Card Surface
<Surface
  style={{ backgroundColor: mukokoTheme.colors.surface }}
  elevation={2}
/>
```

---

## Version History

- **v2.0** (2025-01-15): Updated to Mukoko brand colors, WCAG AA contrast compliance
- **v1.0** (2025-10-31): Initial brand guidelines documentation (Harare Metro)

---

## Questions?

For questions about brand guidelines or design decisions, refer to:
- [CLAUDE.md](/CLAUDE.md) - Development guide
- [mobile/theme.js](/mobile/theme.js) - Theme implementation
- [README.md](/README.md) - Project overview
