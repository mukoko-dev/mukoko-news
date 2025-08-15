# Icon Components Guide

## 🎯 Components Created

### 1. IconButton
**Purpose**: Consistent icon button with tooltips
```jsx
import { IconButton } from '@/components/ui/icon-button'

<IconButton tooltip="Like article" variant="ghost" size="icon">
  <HeartIcon className="h-4 w-4" />
</IconButton>
```

### 2. IconGroup  
**Purpose**: Group related icon buttons
```jsx
import { IconGroup } from '@/components/ui/icon-group'

<IconGroup spacing="gap-2" orientation="horizontal">
  <IconButton>...</IconButton>
  <IconButton>...</IconButton>
</IconGroup>
```

### 3. IconWrapper
**Purpose**: Consistent icon sizing
```jsx
import { IconWrapper } from '@/components/ui/icon-wrapper'

<IconWrapper size="sm">
  <HeartIcon />
</IconWrapper>
```

### 4. Icon Utilities
**Purpose**: Pre-built common patterns
```jsx
import { ActionButton, ThemeToggleGroup, ArticleActions } from '@/components/ui/icon-utils'

<ActionButton icon={HeartIcon} label="Like" onClick={handleLike} />
<ThemeToggleGroup theme={theme} onThemeChange={setTheme} />
<ArticleActions onLike={handleLike} onShare={handleShare} />
```

## 🚀 Benefits for Scaling

### Consistency
- ✅ All icons use the same sizing system
- ✅ Consistent tooltips and interactions  
- ✅ Unified button variants and states

### Maintainability
- ✅ Change tooltip behavior in one place
- ✅ Update button styles globally
- ✅ Easy to add new icon patterns

### Performance
- ✅ Minimal dependencies (only uses Button and cn)
- ✅ No complex animations or heavy libraries
- ✅ Tree-shakeable components

### Developer Experience
- ✅ IntelliSense support with TypeScript
- ✅ Pre-built common patterns
- ✅ Easy to use and extend

## 📝 Usage Patterns

### Single Icon Button
```jsx
<IconButton tooltip="Search" onClick={handleSearch}>
  <MagnifyingGlassIcon className="h-4 w-4" />
</IconButton>
```

### Grouped Actions
```jsx
<IconGroup className="bg-card border rounded-lg p-1">
  <IconButton variant="ghost" tooltip="Like">
    <HeartIcon className="h-4 w-4" />
  </IconButton>
  <IconButton variant="ghost" tooltip="Share">
    <ShareIcon className="h-4 w-4" />
  </IconButton>
</IconGroup>
```

### Theme Toggle (Common Pattern)
```jsx
<ThemeToggleGroup 
  theme={currentTheme} 
  onThemeChange={changeTheme}
  className="ml-auto"
/>
```

### Article Actions (Common Pattern)
```jsx
<ArticleActions
  onLike={() => toggleLike(article.id)}
  onShare={() => shareArticle(article)}
  onBookmark={() => toggleBookmark(article.id)}
  isLiked={likedArticles.includes(article.id)}
  isBookmarked={bookmarkedArticles.includes(article.id)}
/>
```

## 🎨 Customization

### Extend with New Patterns
```jsx
// Add to icon-utils.jsx
export const CustomPattern = ({ ...props }) => (
  <IconGroup>
    {/* Your custom pattern */}
  </IconGroup>
)
```

### Override Defaults
```jsx
<IconButton 
  variant="outline" 
  size="lg"
  className="border-red-500 text-red-500"
  tooltip="Custom styling"
>
  <YourIcon className="h-5 w-5" />
</IconButton>
```

## 🔧 Migration Guide

### Replace existing patterns:
```jsx
// OLD
<button className="p-2 rounded-lg hover:bg-gray-100">
  <HeartIcon className="h-5 w-5" />
</button>

// NEW  
<IconButton tooltip="Like">
  <HeartIcon className="h-4 w-4" />
</IconButton>
```

This provides a scalable foundation for all your icon usage!
