# Enhanced Analytics Implementation Guide

This document describes the enhanced analytics system implemented for Harare Metro.

## Features Implemented

### 1. Enhanced Analytics Component
- **Multi-view interface**: Overview, Sources, Trends, Activity
- **Interactive time range selector**: 24h, 7d, 30d
- **Rich visualizations**: Charts, trends, keyword clouds
- **Advanced metrics**: Source diversity, growth rates, peak activity

### 2. Cloudflare Analytics Engine Integration
- **Real-time tracking**: Article views, searches, category clicks
- **Geographic data**: User location tracking
- **Device detection**: Mobile, tablet, desktop classification
- **Keyword analysis**: Automatic extraction and trending

### 3. Analytics Hook
- **useAnalytics**: React hook for easy tracking integration
- **Automatic error handling**: Graceful fallbacks for failed requests
- **Performance optimized**: Non-blocking analytics calls

## Usage

### In React Components
```javascript
import { useAnalytics } from '../hooks/useAnalytics'

function NewsCard({ article }) {
  const { trackArticleView } = useAnalytics()
  
  const handleClick = () => {
    trackArticleView(article)
    // ... your existing click handler
  }
  
  return (
    <div onClick={handleClick}>
      {/* your content */}
    </div>
  )
}
```

### In SearchPage
The enhanced analytics is already integrated into SearchPage.jsx. Toggle between search and analytics views using the Analytics button in the header.

### Worker Analytics
Analytics data is automatically written to Cloudflare Analytics Engine when users interact with the site. No additional configuration required.

## Data Structure

### Article Views
- **Event Type**: 'article_view'
- **Dimensions**: source, category, country, device, referer
- **Metrics**: view count, timestamp
- **Index**: article ID

### Search Queries
- **Event Type**: 'search_query'
- **Dimensions**: query term, category filter, source filter, country, device
- **Metrics**: search count, query length
- **Index**: unique search session ID

### Category Clicks
- **Event Type**: 'category_click'
- **Dimensions**: category, source filter, country, device
- **Metrics**: click count
- **Index**: category name

## Querying Analytics Data

Use the Cloudflare Analytics Engine SQL API to query your data:

```bash
curl "https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics_engine/sql" \
  --header "Authorization: Bearer <API_TOKEN>" \
  --data "SELECT blob1 as source, SUM(double1) as views FROM news_interactions WHERE blob1 = 'article_view' GROUP BY source ORDER BY views DESC"
```

## Configuration Files Modified

1. **wrangler.toml**: Added Analytics Engine dataset bindings
2. **src/components/SearchPage.jsx**: Added analytics toggle and import
3. **src/components/EnhancedAnalyticsSection.jsx**: New analytics component
4. **src/hooks/useAnalytics.js**: New analytics tracking hook
5. **worker/index.js**: Added analytics tracking endpoints

## Next Steps

1. **Create API Token**: Create a Cloudflare API token with Analytics read permissions
2. **Deploy**: Run `npm run deploy` to deploy the updated worker
3. **Test**: Verify analytics tracking is working in browser dev tools
4. **Monitor**: Use Cloudflare dashboard to monitor analytics data collection

## Troubleshooting

- **Analytics not tracking**: Check browser console for errors
- **Worker deployment issues**: Verify wrangler.toml configuration
- **Data not appearing**: Analytics data may take a few minutes to appear in Cloudflare
