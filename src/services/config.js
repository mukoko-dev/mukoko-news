export const config = {
  API_URL: '',
  SITE_NAME: 'Harare Metro',
  SITE_DESCRIPTION: 'Zimbabwe\'s Capital News Aggregator',
  DEFAULT_CATEGORY: 'all',
  REFRESH_INTERVAL: 300000, // 5 minutes
  CATEGORIES: [
    { id: 'all', name: 'All News' },
    { id: 'harare', name: 'Harare' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'sports', name: 'Sports' },
    { id: 'entertainment', name: 'Entertainment' }
  ]
};

export default config;