# NativeWind Migration Status

**Last Updated**: December 2025
**Branch**: `claude/fix-ui-overlapping-f3VNa`

## Progress Overview

**Completed**: 6/15 items (40%)
**Partially Migrated**: 4 screens (ProfileSettings, Search, Onboarding, AdminSources)
**Status**: 🟡 Active Migration - 67% of screens touched

---

## ✅ Completed (6/15) + 4 Partial

### Infrastructure & Components
1. **✅ NativeWind Setup**
   - Installed NativeWind + Tailwind CSS
   - Created `tailwind.config.js` with Mukoko brand tokens
   - Added NativeWind babel plugin
   - Created `global.css` and imported in `App.js`

2. **✅ Component Library** (40+ components)
   - **Buttons** (2): Button, IconButton
   - **Cards** (6): Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
   - **Loading** (2): LoadingState, LoadingSpinner
   - **Error** (2): ErrorState, ErrorBanner
   - **Empty** (1): EmptyState
   - **Inputs** (2): Input, SearchBar
   - **Badges** (2): Badge, CountBadge
   - **Avatar** (2): Avatar, AvatarGroup
   - **Stats** (3): StatCard, StatsRow, StatBadge
   - **Sections** (2): SectionLabel, SectionDivider
   - **Forms** (9): Form, FormField, FormLabel, FormDescription, FormMessage, TextInput, Select, Checkbox
   - **Profile** (3): ProfileHeader, MenuItem, MenuSection

3. **✅ Icon System**
   - Created `constants/icons.js` with Lucide-only mapping
   - All MaterialCommunityIcons mapped to Lucide equivalents
   - Icon wrapper component with themed colors

### Navigation
4. **✅ AppNavigator.js**
   - Replaced MaterialCommunityIcons with Lucide
   - Tab icons: Zap/ZapOff, Globe, Search, Compass, User, ShieldCheck
   - Removed 23 lines of icon code

### Screens
5. **✅ UserProfileScreen** (271 → 219 lines, -19%)
   - Migrated to NativeWind + Lucide (Bookmark, Clock, LineChart, Settings, HelpCircle, Info)
   - Uses LoadingState, ErrorState components
   - Uses ProfileHeader, MenuItem, MenuSection components
   - Removed 52 lines of StyleSheet code

6. **✅ InsightsScreen** (424 → 250 lines, -41%)
   - Migrated to NativeWind + Lucide (TrendingUp, ChevronRight)
   - Showcases StatsRow component
   - Uses LoadingState, EmptyState components
   - Removed 174 lines of StyleSheet code

7. **✅ DiscoverScreen** (550 → 390 lines, -29%)
   - Migrated to NativeWind + Lucide icons
   - Uses LoadingState, EmptyState components
   - Converted all section headers and buttons to NativeWind
   - Removed 160 lines of StyleSheet code

8. **✅ NewsBytesScreen** (705 → 613 lines, -13%)
   - Migrated to NativeWind + Lucide (Heart, MessageCircle, Share2, Bookmark, Loader2, AlertCircle, RefreshCw)
   - Converted immersive dark UI to NativeWind
   - Updated ActionButton component with Lucide icons + fill support
   - Kept textShadow styles inline (NativeWind limitation)
   - Removed 92 lines of StyleSheet code

### Partially Migrated (4 screens)
9. **⚠️ ProfileSettingsScreen** (719 → 722 lines, +0.4%)
   - Replaced all MaterialCommunityIcons with Lucide icons
   - Converted error state, header, toast, buttons to NativeWind
   - Kept StyleSheet for React Native Paper TextInput (not yet migrated)
   - Icons: User, Mail, AtSign, Moon, Sun, Vibrate, LogOut, Bell, ShieldCheck, Link2, Info, AlertCircle, CheckCircle2

10. **⚠️ SearchScreen** (803 → 804 lines, ~0%)
   - Replaced ActivityIndicator with Loader2
   - Migrated SearchResultCard component to NativeWind
   - Converted empty state to NativeWind
   - Still has 31 StyleSheet styles remaining for insights sections

11. **⚠️ OnboardingScreen** (880 → 893 lines, +1.5%)
   - Migrated ProgressIndicator to NativeWind
   - Converted bottom action buttons to Pressable + NativeWind
   - Added Loader2 loading state with animate-spin
   - Converted handle bar and close button
   - Still has StyleSheet for modal, forms, and step content

12. **⚠️ AdminSourcesScreen** (338 → 334 lines, -1%)
   - Replaced ActivityIndicator with LoadingState and Loader2
   - Converted error/access denied states to NativeWind
   - Migrated header section with stats
   - Added Plus icon from Lucide for Add button
   - Still has StyleSheet for source cards

---

## 🟡 Remaining (5/15)

### User Screens (1)
- ⏳ **ArticleDetailScreen** (977 lines - LARGEST)
  - Full article view with reader
  - Comments, related articles
  - 43 hardcoded values to replace

### Admin Screens (4)
- ⏳ **AdminDashboardScreen** (442 lines)
  - Admin overview with stats
  - Estimated 19 hardcoded values

- ⏳ **AdminUsersScreen** (703 lines)
  - User management table
  - Estimated 39 hardcoded values

- ⏳ **AdminAnalyticsScreen** (444 lines)
  - Analytics charts
  - Estimated 13 hardcoded values

- ⏳ **AdminSystemScreen** (524 lines)
  - System settings
  - Estimated 12 hardcoded values

---

## 📊 Statistics

### Code Reduction
- **UserProfileScreen**: -52 lines (-19%)
- **InsightsScreen**: -174 lines (-41%)
- **HomeScreen**: -157 lines (-29%)
- **DiscoverScreen**: -160 lines (-29%)
- **NewsBytesScreen**: -92 lines (-13%)
- **AppNavigator**: -23 lines (icon code)
- **Total Saved**: 658 lines removed

### Hardcoded Values Remaining
- **User Screens**: 154 values across 7 screens
- **Admin Screens**: 95 values across 5 screens
- **Total**: 249 hardcoded values to eliminate

### Components Created
- **40+ shadcn-style components** ready for use
- **All icons mapped** to Lucide React Native
- **Tailwind config** with complete Mukoko brand tokens

---

## 📝 Migration Pattern

Each screen migration follows this pattern:

1. **Replace imports**
   - Remove React Native Paper (Text, ActivityIndicator, Button, useTheme)
   - Remove MaterialCommunityIcons
   - Add Lucide icon imports
   - Add `{ LoadingState, ErrorState, EmptyState, Button }` from `components/ui`

2. **Replace loading states**
   ```javascript
   // Before
   {loading && (
     <View style={styles.loadingContainer}>
       <ActivityIndicator size="large" color={paperTheme.colors.primary} />
     </View>
   )}

   // After
   {loading && <LoadingState />}
   ```

3. **Replace error states**
   ```javascript
   // Before
   {error && (
     <View style={styles.errorContainer}>
       <MaterialCommunityIcons name="alert-circle-outline" size={48} />
       <Text>{error}</Text>
       <TouchableOpacity onPress={retry}>...</TouchableOpacity>
     </View>
   )}

   // After
   {error && (
     <ErrorState
       title="Something went wrong"
       message={error}
       onRetry={retry}
     />
   )}
   ```

4. **Replace empty states**
   ```javascript
   // Before
   <View style={styles.emptyContainer}>
     <Text style={styles.emptyEmoji}>📰</Text>
     <Text style={styles.emptyTitle}>No articles</Text>
   </View>

   // After
   <EmptyState
     emoji="📰"
     title="No articles"
     subtitle="Pull to refresh"
   />
   ```

5. **Convert StyleSheet to NativeWind**
   ```javascript
   // Before
   <View style={[styles.container, { backgroundColor: paperTheme.colors.background }]}>

   // After
   <View className="flex-1 bg-background">
   ```

6. **Remove StyleSheet.create()**
   - Delete entire StyleSheet section
   - Replace with NativeWind classes

---

## 🎯 Next Steps

1. **Complete remaining 12 screens** (in progress)
2. **Update shared components** that use MaterialCommunityIcons:
   - ArticleCard
   - CategoryChips
   - LoginPromo
   - AppHeader
   - etc.

3. **Remove dependencies** after migration:
   ```bash
   npm uninstall react-native-paper
   npm uninstall @expo/vector-icons
   ```

4. **Test on all platforms**:
   - iOS simulator
   - Android emulator
   - Web browser

---

## 📚 Resources

- **Migration Guide**: `mobile/MIGRATION_GUIDE.md`
- **Component Library**: `mobile/components/ui/`
- **Icon Constants**: `mobile/constants/icons.js`
- **Tailwind Config**: `mobile/tailwind.config.js`
- **Example Screens**: `UserProfileScreen.js`, `InsightsScreen.js`

---

## 🔧 Troubleshooting

### Common Issues

**Icons not rendering**
- Solution: Import Lucide icons directly, don't use string names

**Fonts not applying**
- Solution: Use correct font family class names (`font-sans-bold` not `font-bold`)

**Colors not matching**
- Solution: Use Mukoko brand classes (`bg-tanzanite` not `bg-purple-500`)

---

**Migration Progress**: 67% of screens touched (6 complete + 4 partial)
**Fully Complete**: 40% (6/15 screens)
**Remaining**: 5 screens (1 user + 4 admin)
