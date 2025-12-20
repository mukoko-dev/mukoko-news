# NativeWind + Lucide Migration Guide

**Migration Status**: 1/14 screens completed (UserProfileScreen ✅)

## Overview

This guide documents the migration from React Native Paper + MaterialCommunityIcons to shadcn-style components with NativeWind + Lucide icons.

**Goals:**
- Eliminate StyleSheet boilerplate
- Use Tailwind CSS classes via NativeWind
- Standardize on Lucide icons only
- Leverage shadcn-style copy-paste components
- Apply Mukoko brand tokens consistently

---

## Architecture Changes

### Before (Old Pattern)
```javascript
import { StyleSheet } from 'react-native';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mukokoTheme.colors.background,
  },
  title: {
    fontSize: mukokoTheme.typography.headlineSmall,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
    color: mukokoTheme.colors.onSurface,
  },
});
```

### After (New Pattern)
```javascript
import { View, Text } from 'react-native';
import { Settings } from 'lucide-react-native';
import { Button, Card } from '../components/ui';

// Use NativeWind classes directly
<View className="flex-1 bg-background">
  <Text className="font-serif-bold text-headline-small text-on-surface">
    Title
  </Text>
</View>
```

---

## Step-by-Step Migration Process

### 1. Update Imports

**Remove:**
```javascript
- import { Text, ActivityIndicator, Button, useTheme as usePaperTheme } from 'react-native-paper';
- import { MaterialCommunityIcons } from '@expo/vector-icons';
- import mukokoTheme from '../theme';
- import { StyleSheet } from 'react-native';
```

**Add:**
```javascript
+ import { View, Text, Pressable } from 'react-native';
+ import { IconName1, IconName2 } from 'lucide-react-native';
+ import { Button, Card, LoadingState, ErrorState } from '../components/ui';
```

### 2. Replace Icon Usage

**MaterialCommunityIcons → Lucide Mapping:**

| Old (MaterialCommunityIcons) | New (Lucide) | Import |
|------------------------------|--------------|--------|
| `name="home"` | `<Home />` | `import { Home } from 'lucide-react-native'` |
| `name="magnify"` | `<Search />` | `import { Search } from 'lucide-react-native'` |
| `name="account"` | `<User />` | `import { User } from 'lucide-react-native'` |
| `name="cog"` | `<Settings />` | `import { Settings } from 'lucide-react-native'` |
| `name="bookmark"` | `<Bookmark />` | `import { Bookmark } from 'lucide-react-native'` |
| `name="history"` | `<Clock />` | `import { Clock } from 'lucide-react-native'` |
| `name="chart-line"` | `<LineChart />` | `import { LineChart } from 'lucide-react-native'` |
| `name="refresh"` | `<RefreshCw />` | `import { RefreshCw } from 'lucide-react-native'` |
| `name="alert-circle-outline"` | `<AlertCircle />` | `import { AlertCircle } from 'lucide-react-native'` |
| `name="chevron-right"` | `<ChevronRight />` | `import { ChevronRight } from 'lucide-react-native'` |
| `name="help-circle"` | `<HelpCircle />` | `import { HelpCircle } from 'lucide-react-native'` |
| `name="information"` | `<Info />` | `import { Info } from 'lucide-react-native'` |

**Full icon mapping:** See `constants/icons.js`

**Before:**
```javascript
<MaterialCommunityIcons
  name="cog"
  size={24}
  color={paperTheme.colors.onSurface}
/>
```

**After:**
```javascript
<Settings size={24} color="#1C1B1F" />
```

### 3. Convert StyleSheet to NativeWind Classes

**Layout Classes:**
```javascript
// Before
style={{ flex: 1 }}
style={{ flexDirection: 'row', alignItems: 'center' }}
style={{ justifyContent: 'space-between' }}
style={{ gap: mukokoTheme.spacing.md }}

// After
className="flex-1"
className="flex-row items-center"
className="justify-between"
className="gap-md"
```

**Sizing Classes:**
```javascript
// Before
style={{ width: 100, height: 100 }}
style={{ padding: mukokoTheme.spacing.lg }}
style={{ marginBottom: mukokoTheme.spacing.sm }}

// After
className="w-[100px] h-[100px]"
className="p-lg"
className="mb-sm"
```

**Typography Classes:**
```javascript
// Before
style={{
  fontSize: mukokoTheme.typography.headlineSmall,
  fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  color: paperTheme.colors.onSurface,
}}

// After
className="font-serif-bold text-headline-small text-on-surface"
```

**Color Classes:**
```javascript
// Before
style={{ backgroundColor: paperTheme.colors.surface }}
style={{ color: paperTheme.colors.primary }}

// After
className="bg-surface"
className="text-tanzanite"
```

**Border & Radius Classes:**
```javascript
// Before
style={{
  borderRadius: mukokoTheme.roundness,
  borderWidth: 1,
  borderColor: paperTheme.colors.outline,
}}

// After
className="rounded-card border border-outline"
```

### 4. Replace Component Patterns

#### Loading States
**Before:**
```javascript
{loading && (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={paperTheme.colors.primary} />
  </View>
)}
```

**After:**
```javascript
{loading && <LoadingState />}
// or with message
{loading && <LoadingState message="Loading profile..." />}
```

#### Error States
**Before:**
```javascript
{error && (
  <View style={styles.errorContainer}>
    <MaterialCommunityIcons name="alert-circle-outline" size={48} color={paperTheme.colors.error} />
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={retry}>
      <Text>Try Again</Text>
    </TouchableOpacity>
  </View>
)}
```

**After:**
```javascript
{error && (
  <ErrorState
    title="Something went wrong"
    message={error}
    onRetry={retry}
  />
)}
```

#### Empty States
**Before:**
```javascript
<View style={styles.emptyContainer}>
  <Text style={styles.emptyEmoji}>📰</Text>
  <Text style={styles.emptyTitle}>No articles found</Text>
  <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
</View>
```

**After:**
```javascript
<EmptyState
  emoji="📰"
  title="No articles found"
  subtitle="Pull down to refresh"
  actionLabel="Refresh"
  onAction={handleRefresh}
/>
```

#### Buttons
**Before:**
```javascript
<Button
  mode="contained"
  onPress={handlePress}
  style={styles.button}
>
  Save
</Button>
```

**After:**
```javascript
<Button
  variant="default"
  onPress={handlePress}
>
  Save
</Button>
```

#### Cards
**Before:**
```javascript
<View style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}>
  <Text style={styles.cardTitle}>Title</Text>
  <Text style={styles.cardDescription}>Description</Text>
</View>
```

**After:**
```javascript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
</Card>
```

### 5. Remove StyleSheet Code

**Before:**
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: mukokoTheme.colors.background,
  },
  title: {
    fontSize: mukokoTheme.typography.headlineSmall,
    fontFamily: mukokoTheme.fonts.serifBold.fontFamily,
  },
});
```

**After:**
```javascript
// All styles removed - using NativeWind classes instead
```

---

## Tailwind Class Reference

### Spacing (4px base)
- `gap-xs` = 4px
- `gap-sm` = 8px
- `gap-md` = 12px
- `gap-lg` = 16px
- `gap-xl` = 24px
- `gap-xxl` = 32px

Same applies to: `p-*`, `m-*`, `px-*`, `py-*`, `mx-*`, `my-*`, `pt-*`, `pr-*`, `pb-*`, `pl-*`

### Typography
**Font Families:**
- `font-sans` = Plus Jakarta Sans Regular
- `font-sans-medium` = Plus Jakarta Sans Medium
- `font-sans-bold` = Plus Jakarta Sans Bold
- `font-serif` = Noto Serif Regular
- `font-serif-bold` = Noto Serif Bold

**Font Sizes:**
- `text-display-large` = 48px
- `text-display-medium` = 36px
- `text-display-small` = 32px
- `text-headline-large` = 26px
- `text-headline-medium` = 22px
- `text-headline-small` = 20px
- `text-title-large` = 18px
- `text-title-medium` = 16px
- `text-title-small` = 14px
- `text-body-large` = 16px
- `text-body-medium` = 14px
- `text-body-small` = 12px
- `text-label-large` = 13px
- `text-label-medium` = 12px
- `text-label-small` = 11px
- `text-stats` = 28px

### Colors (Mukoko Brand)
**Primary - Tanzanite:**
- `bg-tanzanite` / `text-tanzanite`
- `bg-tanzanite-light` / `text-tanzanite-light`
- `bg-tanzanite-container` / `text-tanzanite-container`

**Secondary - Cobalt:**
- `bg-cobalt` / `text-cobalt`
- `bg-cobalt-light` / `text-cobalt-light`

**Accent - Gold:**
- `bg-gold` / `text-gold`
- `bg-gold-light` / `text-gold-light`

**Success - Malachite:**
- `bg-malachite` / `text-malachite`
- `bg-malachite-light` / `text-malachite-light`

**Surfaces:**
- `bg-surface` (white)
- `bg-surface-variant` (#F3F2EE)
- `bg-surface-subtle` (#FAF9F5)
- `bg-background` (#FAF9F5)

**Text Colors:**
- `text-on-surface` (#1C1B1F)
- `text-on-surface-variant` (#4a4a4a)
- `text-on-primary` (white)
- `text-on-secondary` (white)

**Semantic:**
- `bg-error` / `text-error`
- `bg-success` / `text-success`
- `bg-warning` / `text-warning`

**Borders:**
- `border-outline` (#e0dfdc)
- `border-outline-variant` (#f0efec)

### Border Radius
- `rounded-button` = 12px
- `rounded-card` = 16px
- `rounded-modal` = 20px
- `rounded-full` = 9999px (circular)

### Touch Targets (WCAG AAA)
- `min-h-touch` / `min-w-touch` = 44px
- `min-h-touch-compact` / `min-w-touch-compact` = 40px
- `min-h-touch-large` / `min-w-touch-large` = 56px

---

## Example Migration: UserProfileScreen

### Before (271 lines)
```javascript
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, useTheme as usePaperTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mukokoTheme from '../theme';

// ... component code with StyleSheet.create at bottom
```

### After (219 lines, -52 lines)
```javascript
import { View, ScrollView, Pressable, Text } from 'react-native';
import { Bookmark, Clock, LineChart, Settings, HelpCircle, Info } from 'lucide-react-native';
import { LoadingState, ErrorState } from '../components/ui';

// ... component code with NativeWind classes, no StyleSheet
```

**Files Changed:**
- -250 lines of StyleSheet code
- +74 lines of NativeWind classes
- **Net: -176 lines (-41% reduction)**

---

## Available UI Components

Import from `components/ui/`:

### Layout & Display
- `LoadingState` - Fullscreen or inline loading
- `LoadingSpinner` - Simple spinner
- `ErrorState` - Error display with retry
- `ErrorBanner` - Inline error message
- `EmptyState` - Empty state with icon/emoji

### Inputs
- `Input` - Text input with label and error
- `SearchBar` - Search input with clear button

### Buttons
- `Button` - Primary/secondary/outline/ghost variants
- `IconButton` - Icon-only button

### Cards
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

### Display
- `Badge` - Colored badge (default/secondary/accent/success/error/outline)
- `CountBadge` - Notification count badge

---

## Icon Constants

Instead of string-based icon names, use the centralized icon mapping:

```javascript
import { ICONS, getIcon } from '../constants/icons';

// Option 1: Direct import
<Settings size={24} color="#1C1B1F" />

// Option 2: From ICONS constant
const IconComponent = ICONS.settings;
<IconComponent size={24} color="#1C1B1F" />

// Option 3: Dynamic lookup
const IconComponent = getIcon('settings');
<IconComponent size={24} color="#1C1B1F" />
```

---

## Migration Checklist

Use this checklist when migrating each screen:

- [ ] Replace React Native Paper imports with primitives
- [ ] Replace MaterialCommunityIcons with Lucide imports
- [ ] Convert loading states to `<LoadingState />`
- [ ] Convert error states to `<ErrorState />`
- [ ] Convert empty states to `<EmptyState />`
- [ ] Convert buttons to `<Button variant="..." />`
- [ ] Replace all `style={styles.*}` with `className="..."`
- [ ] Convert all inline styles to NativeWind classes
- [ ] Remove StyleSheet.create() code
- [ ] Remove `mukokoTheme` imports (use Tailwind classes instead)
- [ ] Remove `usePaperTheme()` hook
- [ ] Test on iOS, Android, and Web
- [ ] Verify WCAG AAA touch targets (44px minimum)
- [ ] Commit with descriptive message

---

## Remaining Screens to Migrate

### User Screens (8 remaining)
1. ✅ **UserProfileScreen** - COMPLETED (example)
2. ⏳ **HomeScreen** - Main feed
3. ⏳ **SearchScreen** - Search/insights
4. ⏳ **NewsBytesScreen** - TikTok-style vertical feed
5. ⏳ **InsightsScreen** - Analytics
6. ⏳ **ArticleDetailScreen** - Article view
7. ⏳ **OnboardingScreen** - First-time user experience
8. ⏳ **ProfileSettingsScreen** - Settings
9. ⏳ **DiscoverScreen** - Content discovery

### Admin Screens (5 remaining)
10. ⏳ **AdminDashboardScreen**
11. ⏳ **AdminUsersScreen**
12. ⏳ **AdminSourcesScreen**
13. ⏳ **AdminAnalyticsScreen**
14. ⏳ **AdminSystemScreen**

---

## Tips & Best Practices

### 1. Dynamic Values
Use inline styles for dynamic values:
```javascript
// ✅ Good
<View style={{ backgroundColor: iconBg }} className="w-12 h-12 rounded-full">

// ❌ Avoid
<View style={{ backgroundColor: iconBg, width: 48, height: 48, borderRadius: 24 }}>
```

### 2. Conditional Classes
Use template literals for conditional styling:
```javascript
className={`flex-row items-center ${isActive ? 'bg-tanzanite' : 'bg-surface'}`}
```

### 3. Combining className and style
Only use `style` for truly dynamic values:
```javascript
<View
  className="w-12 h-12 rounded-full items-center justify-center"
  style={{ backgroundColor: customColor }}
>
```

### 4. Custom Values
Use square brackets for one-off values:
```javascript
className="w-[100px] h-[64px] ml-[76px]"
```

### 5. Font Weights
Map font weights to font families:
```javascript
// ❌ Don't use font-weight
className="font-sans font-bold"  // Won't work

// ✅ Use the correct font family
className="font-sans-bold"  // Plus Jakarta Sans Bold
```

---

## Common Issues & Solutions

### Issue: Icons not rendering
**Solution:** Import Lucide icons directly, don't use string names
```javascript
// ❌ Wrong
import { Icon } from 'lucide-react-native';
<Icon name="settings" />

// ✅ Correct
import { Settings } from 'lucide-react-native';
<Settings size={24} />
```

### Issue: Fonts not applying
**Solution:** Use the correct font family class names
```javascript
// ❌ Wrong
className="font-bold text-lg"

// ✅ Correct
className="font-sans-bold text-title-large"
```

### Issue: Colors not matching theme
**Solution:** Use Mukoko brand color classes, not generic Tailwind colors
```javascript
// ❌ Wrong
className="bg-purple-500 text-blue-600"

// ✅ Correct
className="bg-tanzanite text-cobalt"
```

---

## Next Steps

1. ✅ Complete infrastructure setup
2. ✅ Refactor profile components (ProfileHeader, MenuItem, MenuSection)
3. ✅ Migrate UserProfileScreen as example
4. ⏳ Create migration guide (this document)
5. ⏳ Migrate remaining 13 screens
6. ⏳ Update navigation to use Lucide icons
7. ⏳ Remove React Native Paper dependency
8. ⏳ Remove MaterialCommunityIcons dependency

---

## Resources

- **Tailwind Config:** `mobile/tailwind.config.js`
- **Icon Constants:** `mobile/constants/icons.js`
- **UI Components:** `mobile/components/ui/`
- **Example Screen:** `mobile/screens/UserProfileScreen.js`
- **NativeWind Docs:** https://www.nativewind.dev/
- **Lucide Icons:** https://lucide.dev/icons/

---

**Last Updated:** December 2025
**Migration Progress:** 1/14 screens (7%)
