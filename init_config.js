const RSS_SOURCES = [
  {
    id: 'herald',
    name: 'Herald Zimbabwe',
    url: 'https://www.herald.co.zw/feed/',
    category: 'general',
    enabled: true,
    priority: 5
  },
  {
    id: 'newsday',
    name: 'NewsDay Zimbabwe',
    url: 'https://www.newsday.co.zw/feed/',
    category: 'general',
    enabled: true,
    priority: 5
  },
  {
    id: 'chronicle',
    name: 'Chronicle Zimbabwe',
    url: 'https://www.chronicle.co.zw/feed/',
    category: 'general',
    enabled: true,
    priority: 4
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All News', emoji: '📰', priority: 10 },
  { id: 'politics', name: 'Politics', emoji: '🏛️', priority: 9 },
  { id: 'economy', name: 'Economy', emoji: '💰', priority: 8 },
  { id: 'business', name: 'Business', emoji: '💼', priority: 7 },
  { id: 'sports', name: 'Sports', emoji: '⚽', priority: 6 },
  { id: 'technology', name: 'Technology', emoji: '💻', priority: 5 }
];

console.log('Initializing RSS sources...');
console.log(JSON.stringify(RSS_SOURCES, null, 2));
console.log('\nInitializing categories...');
console.log(JSON.stringify(CATEGORIES, null, 2));
console.log('\n✅ Configuration ready for KV storage');
