# Component Architecture Audit Report
**Date:** December 2025
**Project:** Mukoko News Mobile App
**Purpose:** Identify common UI patterns to extract into reusable components

---

## Executive Summary

**Total Screens Audited:** 14 (9 user + 5 admin)
**Common Patterns Identified:** 8 major categories
**Current State:** Repeated code across all screens, inconsistent implementations
**Recommendation:** Create centralized component library

---

## 1. LOADING STATES (14/14 screens = 100%)

### Current Usage
All screens implement loading states with `ActivityIndicator`

### Current Implementation Variations
```javascript
// Variation 1 (most common)
<View style={styles.loadingContainer}>
  <ActivityIndicator size="large" color={paperTheme.colors.primary} />
</View>

// Variation 2 (with text)
<View style={styles.loadingContainer}>
  <ActivityIndicator size="large" color={colors.accent} />
  <Text style={styles.loadingText}>Loading NewsBytes...</Text>
</View>

// Variation 3 (inline)
{loading && <ActivityIndicator />}
```

### Style Variations
- `loadingContainer` - Full screen centered
- `gridLoading` - Inline loading for grids
- Different padding values
- Different gap spacing

### Recommended Component
**`LoadingState.js`**
```javascript
<LoadingState
  message="Loading articles..."  // optional
  variant="fullscreen|inline"
/>
```

---

## 2. ERROR STATES (13/14 screens = 93%)

### Current Usage
Error states with icon, message, and retry button

### Current Implementation Pattern
```javascript
<View style={styles.errorContainer}>
  <MaterialCommunityIcons
    name="alert-circle-outline"
    size={48}
    color={paperTheme.colors.error}
  />
  <Text style={styles.errorTitle}>Something went wrong</Text>
  <Text style={styles.errorMessage}>{error}</Text>
  <TouchableOpacity style={styles.retryButton} onPress={retry}>
    <MaterialCommunityIcons name="refresh" size={16} />
    <Text>Try Again</Text>
  </TouchableOpacity>
</View>
```

### Variations
- Different icon sizes (48, 64)
- Different icon names
- With/without icon in retry button
- Different button styles

### Recommended Component
**`ErrorState.js`**
```javascript
<ErrorState
  title="Something went wrong"
  message={error}
  onRetry={handleRetry}
  icon="alert-circle-outline"  // optional, default provided
/>
```

---

## 3. EMPTY STATES (7/14 screens = 50%)

### Current Usage
Empty states with emoji/icon, title, subtitle, optional CTA button

### Current Implementation Pattern
```javascript
<View style={styles.emptyState}>
  <Text style={styles.emptyEmoji}>📰</Text>
  <Text style={styles.emptyTitle}>No articles found</Text>
  <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
  <Button onPress={action}>Explore Articles</Button>
</View>
```

### Variations
- Emoji vs Icon
- Different emoji sizes (48, 64)
- With/without action button
- Different spacing

### Recommended Component
**`EmptyState.js`**
```javascript
<EmptyState
  emoji="📰"  // or icon="newspaper"
  title="No articles found"
  subtitle="Pull down to refresh"
  actionLabel="Explore Articles"  // optional
  onAction={handleAction}        // optional
/>
```

---

## 4. RETRY BUTTONS (9/14 screens = 64%)

### Current Usage
Buttons for retrying failed operations

### Current Implementation Variations
```javascript
// Variation 1: With icon
<TouchableOpacity style={styles.retryButton}>
  <MaterialCommunityIcons name="refresh" size={16} />
  <Text>Try Again</Text>
</TouchableOpacity>

// Variation 2: Text only
<TouchableOpacity style={styles.retryButton}>
  <Text>Try Again</Text>
</TouchableOpacity>
```

### Recommended Component
**`RetryButton.js`** (or part of ErrorState)
```javascript
<RetryButton
  onPress={handleRetry}
  showIcon={true}  // optional
/>
```

---

## 5. STATS DISPLAYS (3/14 screens = 21%)

### Current Usage
InsightsScreen, SearchScreen, AdminDashboardScreen

### Current Implementation Pattern
```javascript
<View style={styles.statsRow}>
  <View style={styles.stat}>
    <Text style={styles.statValue}>{count}</Text>
    <Text style={styles.statLabel}>Label</Text>
  </View>
  <View style={styles.statDivider} />
  {/* More stats... */}
</View>
```

### Variations
- Horizontal row vs vertical stack
- With/without dividers
- With/without emoji/icons
- Different sizes

### Recommended Components
**`StatCard.js`** - Single stat display
**`StatsRow.js`** - Multiple stats in a row
```javascript
<StatsRow>
  <StatCard value={123} label="Articles" />
  <StatCard value={456} label="Sources" />
</StatsRow>
```

---

## 6. MODAL USAGE (2/14 screens = 14%)

### Current Usage
ArticleDetailScreen (ShareModal), OnboardingScreen

### Recommendation
Already have standardized modals:
- `ShareModal.js` ✅
- `CountryPickerButton.js` ✅
- Modal behavior standardized in theme constants ✅

**Action:** Use existing modal patterns for new modals

---

## 7. LIST/GRID LAYOUTS (14/14 screens = 100%)

### Current Usage
All screens use FlatList or ScrollView

### Current Patterns
- Article grids (3 columns)
- List items with dividers
- Horizontal scrolling
- Pull to refresh
- Infinite scroll

### Recommendation
Keep as-is (too varied to componentize)
Use existing `ArticleCard` component ✅

---

## 8. NAVIGATION HEADERS (2/14 screens = 14%)

### Current Usage
ArticleDetailScreen (collapsible), ProfileSettingsScreen

### Current Pattern
```javascript
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <MaterialCommunityIcons name="arrow-left" size={24} />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>Title</Text>
  <TouchableOpacity>  {/* Right action */}
    <MaterialCommunityIcons name="cog" size={24} />
  </TouchableOpacity>
</View>
```

### Recommended Component
**`ScreenHeader.js`**
```javascript
<ScreenHeader
  title="Settings"
  onBack={() => navigation.goBack()}
  rightAction={{icon: "cog", onPress: handleSettings}}
  variant="default|collapsible"
/>
```

---

## 9. BUTTONS (11/14 screens = 79%)

### Current Usage
Primary, secondary, outline, and icon buttons throughout app

### Current Implementation Variations
```javascript
// Variation 1: React Native Paper Button
<Button
  mode="contained"
  onPress={action}
  style={styles.button}
>
  Label
</Button>

// Variation 2: TouchableOpacity custom
<TouchableOpacity
  style={[styles.button, { backgroundColor: paperTheme.colors.primary }]}
  onPress={action}
>
  <Text style={styles.buttonText}>Label</Text>
</TouchableOpacity>

// Variation 3: With icon
<TouchableOpacity style={styles.iconButton}>
  <MaterialCommunityIcons name="icon" size={24} />
</TouchableOpacity>
```

### Style Variations
- Different border radius (8, 12, 20)
- Different padding values
- Different font sizes and weights
- Inconsistent hover/press states

### Recommended Components
**`Button.js`** - Primary/Secondary/Outline variants
**`IconButton.js`** - Icon-only button
```javascript
<Button
  variant="primary|secondary|outline|text"
  onPress={action}
  icon="icon-name"  // optional
  disabled={false}
>
  Label
</Button>

<IconButton
  icon="cog"
  onPress={action}
  size="small|medium|large"
/>
```

---

## 10. TEXT INPUTS & SEARCH BARS (6/14 screens = 43%)

### Current Usage
Text inputs in forms, search bars in discovery screens

### Current Implementation Variations
```javascript
// Text Input
<TextInput
  style={styles.input}
  placeholder="Enter text..."
  value={value}
  onChangeText={setValue}
/>

// Search Bar (SearchScreen has EnhancedSearchBar component)
<EnhancedSearchBar
  value={searchQuery}
  onChangeText={handleSearch}
  placeholder="Search African news..."
/>
```

### Variations
- Different border styles
- Different padding/heights
- With/without icons
- With/without clear button

### Recommended Components
**`TextInput.js`** - Standard text input
**`SearchBar.js`** - Search with icon and clear button
```javascript
<TextInput
  label="Email"
  placeholder="Enter email..."
  value={email}
  onChangeText={setEmail}
  error={errors.email}  // optional
  leftIcon="email"      // optional
/>

<SearchBar
  value={query}
  onChangeText={setQuery}
  onSubmit={handleSearch}
  placeholder="Search..."
  showAI={true}  // optional AI indicator
/>
```

---

## 11. BADGES & CHIPS (11/14 screens = 79%)

### Current Usage
Category chips, status badges, count indicators

### Current Implementation Pattern
```javascript
// React Native Paper Chip
<Chip
  mode="outlined"
  style={styles.chip}
  onPress={action}
>
  Label
</Chip>

// Custom Badge
<View style={styles.badge}>
  <Text style={styles.badgeText}>5</Text>
</View>
```

### Variations
- Different border radius (full round vs semi-round)
- Different sizes (small, medium, large)
- Different colors (primary, accent, neutral)
- Outlined vs filled

### Recommended Components
**`Badge.js`** - Small count/status indicator
**`Chip.js`** - Larger selectable tag
```javascript
<Badge
  count={5}
  variant="primary|accent|neutral"
  size="small|medium"
/>

<Chip
  label="Politics"
  selected={isSelected}
  onPress={handlePress}
  variant="filled|outlined"
  icon="icon-name"  // optional
/>
```

---

## 12. SECTION LABELS (6/14 screens = 43%)

### Current Usage
Uppercase section headers throughout app

### Current Implementation Pattern
```javascript
<Text style={styles.sectionLabel}>TRENDING SEARCHES</Text>

// Styles
sectionLabel: {
  fontSize: 12,
  fontFamily: mukokoTheme.fonts.bold.fontFamily,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}
```

### Variations
- Different font sizes (11, 12, 13)
- With/without margin/padding
- Different colors

### Recommended Component
**`SectionLabel.js`**
```javascript
<SectionLabel>Trending Searches</SectionLabel>

// Or with icon
<SectionLabel icon="trending-up">
  Trending Searches
</SectionLabel>
```

---

## 13. ICONS (14/14 screens = 100%)

### Current Usage
MaterialCommunityIcons everywhere, inconsistent sizes and colors

### Current Implementation
```javascript
<MaterialCommunityIcons
  name="icon-name"
  size={24}
  color={paperTheme.colors.onSurface}
/>
```

### Issues
- Hardcoded sizes (16, 20, 24, 28, 32, 48, 64)
- Inconsistent color management
- Repeated imports
- No centralized icon mapping

### Recommended Solution
**`constants/icons.js`** - Icon name constants
**`Icon.js`** - Wrapped icon component
```javascript
// constants/icons.js
export const ICONS = {
  home: 'home',
  search: 'magnify',
  profile: 'account',
  settings: 'cog',
  // ... all app icons
};

// Usage
<Icon
  name={ICONS.home}
  size="small|medium|large|xl"
  color="primary|onSurface|error"  // theme-aware
/>
```

---

## 14. AVATARS (4/14 screens = 29%)

### Current Usage
User avatars with fallback initials

### Current Implementation Pattern
```javascript
{avatarUrl ? (
  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
) : (
  <View style={styles.avatarPlaceholder}>
    <Text style={styles.avatarInitials}>
      {getInitials(name)}
    </Text>
  </View>
)}
```

### Variations
- Different sizes (40, 48, 64, 100)
- Different border styles
- Different placeholder colors
- Repeated getInitials logic

### Recommended Component
**`Avatar.js`**
```javascript
<Avatar
  source={avatarUrl}
  name="Bryan Fawcett"  // for fallback initials
  size="small|medium|large|xl"
  showBorder={true}
/>
```

---

## 15. DIVIDERS (8/14 screens = 57%)

### Current Usage
Separating list items and sections

### Current Implementation
```javascript
<Divider style={styles.divider} />

// Or custom
<View style={[styles.divider, { backgroundColor: paperTheme.colors.outline }]} />
```

### Variations
- Different heights (1px, hairline)
- Different colors
- Different margins/insets
- Full width vs inset

### Recommended Component
**`Divider.js`** (or use React Native Paper's Divider consistently)
```javascript
<Divider
  inset={48}  // optional left margin
  color="outline|custom"
/>
```

---

## 16. FORMS (13/14 screens = 93%)

### Current Usage
Form handling logic scattered across screens

### Current Issues
- No centralized form validation
- Repeated error handling
- Inconsistent input styling
- No form state management

### Recommended Solution
**`Form.js`** - Form container with validation
**`FormField.js`** - Individual form field
```javascript
<Form onSubmit={handleSubmit} validationSchema={schema}>
  <FormField
    name="email"
    label="Email"
    type="email"
    required
  />
  <FormField
    name="password"
    label="Password"
    type="password"
    required
  />
  <Button type="submit">Sign In</Button>
</Form>
```

---

## Summary: Components to Create

### Priority 1 (High Usage - 50%+)
1. **LoadingState.js** - Used in 14/14 screens (100%)
2. **ErrorState.js** - Used in 13/14 screens (93%)
3. **RetryButton.js** - Used in 9/14 screens (64%)
4. **EmptyState.js** - Used in 7/14 screens (50%)

### Priority 2 (Medium Usage - 20-50%)
5. **StatCard.js** - Used in 3/14 screens (21%)
6. **StatsRow.js** - Used in 3/14 screens (21%)

### Priority 3 (Low Usage but Good to Have)
7. **ScreenHeader.js** - Used in 2/14 screens (14%)

### Already Completed ✅
- **ProfileHeader.js** ✅
- **MenuItem.js** ✅
- **MenuSection.js** ✅
- **ShareModal.js** ✅
- **CountryPickerButton.js** ✅
- **ArticleCard.js** ✅

---

## Component Directory Structure

```
mobile/components/
├── common/
│   ├── LoadingState.js        [NEW]
│   ├── ErrorState.js          [NEW]
│   ├── EmptyState.js          [NEW]
│   ├── RetryButton.js         [NEW]
├── stats/
│   ├── StatCard.js            [NEW]
│   ├── StatsRow.js            [NEW]
├── navigation/
│   ├── ScreenHeader.js        [NEW]
├── profile/
│   ├── ProfileHeader.js       [EXISTS]
│   ├── MenuItem.js            [EXISTS]
│   ├── MenuSection.js         [EXISTS]
├── cards/
│   ├── ArticleCard.js         [EXISTS]
├── modals/
│   ├── ShareModal.js          [EXISTS]
│   ├── CountryPickerButton.js [EXISTS]
```

---

## Impact Analysis

### Before Componentization
- **209 hardcoded values** across 9 screens
- **Repeated loading state code** in 14 files
- **Repeated error state code** in 13 files
- **Inconsistent styling** across screens
- **Difficult to maintain** and update

### After Componentization
- **Zero hardcoded values** in components
- **Single source of truth** for common patterns
- **Consistent UX** across entire app
- **Easy to update** - change once, applies everywhere
- **Smaller screen files** - just composition

---

## Next Steps

### Step 2: Create Component Library
1. Create `mobile/components/common/` directory
2. Build LoadingState, ErrorState, EmptyState, RetryButton
3. Create `mobile/components/stats/` directory
4. Build StatCard, StatsRow
5. Create `mobile/components/navigation/` directory
6. Build ScreenHeader

### Step 3: Refactor Screens
1. Replace inline loading states with `<LoadingState />`
2. Replace error handling with `<ErrorState />`
3. Replace empty states with `<EmptyState />`
4. Replace stats with `<StatCard />` and `<StatsRow />`
5. Update headers to use `<ScreenHeader />`
6. Remove all hardcoded values in the process

---

## Success Metrics

- [ ] 7 new reusable components created
- [ ] 14 screens refactored to use component library
- [ ] 209 hardcoded values eliminated
- [ ] Screen files reduced by 30-50% in size
- [ ] 100% theme constant usage
- [ ] Zero duplicate UI code
