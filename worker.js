import { XMLParser } from 'fast-xml-parser';

// RSS feed sources configuration
const RSS_SOURCES = [
  {
    name: 'Herald Zimbabwe',
    url: 'https://www.herald.co.zw/feed/',
    categories: ['general', 'news', 'politics']
  },
  {
    name: 'NewsDay Zimbabwe',
    url: 'https://www.newsday.co.zw/feed/',
    categories: ['general', 'news']
  },
  {
    name: 'Chronicle Zimbabwe',
    url: 'https://www.chronicle.co.zw/feed/',
    categories: ['general', 'news', 'bulawayo']
  },
  {
    name: 'ZBC News',
    url: 'https://www.zbc.co.zw/feed/',
    categories: ['general', 'news', 'broadcast']
  },
  {
    name: 'Business Weekly',
    url: 'https://businessweekly.co.zw/feed/',
    categories: ['business', 'economy', 'finance']
  },
  {
    name: 'Zimbabwe Mail',
    url: 'https://www.thezimbabwemail.com/feed/',
    categories: ['general', 'news', 'diaspora']
  },
  {
    name: 'Zimbabwe Situation',
    url: 'https://www.zimbabwesituation.com/feed/',
    categories: ['general', 'news', 'analysis']
  },
  {
    name: 'TechZim',
    url: 'https://www.techzim.co.zw/feed/',
    categories: ['technology', 'business', 'innovation']
  }
];

// CORS headers for API responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Router setup
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      switch (url.pathname) {
        case '/api/news':
          return await handleGetNews(env);
        case '/api/update':
          return await handleUpdateNews(env);
        default:
          return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleUpdateNews(env));
  }
};

// Handle GET /api/news
async function handleGetNews(env) {
  const news = await env.NEWS_STORAGE.get('latest_news');
  return new Response(news || '[]', {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// Handle GET /api/update
async function handleUpdateNews(env) {
  const startTime = Date.now();
  const results = [];
  let totalArticles = 0;
  const errors = [];

  for (const source of RSS_SOURCES) {
    try {
      const articles = await fetchRSSFeed(source);
      results.push({
        name: source.name,
        articlesCount: articles.length,
        status: 'success'
      });
      totalArticles += articles.length;
    } catch (error) {
      results.push({
        name: source.name,
        articlesCount: 0,
        status: 'error'
      });
      errors.push({
        source: source.name,
        error: error.message
      });
    }
  }

  const response = {
    timestamp: new Date().toISOString(),
    sources: results,
    totalArticles,
    errors: errors.length > 0 ? errors : undefined
  };

  return new Response(JSON.stringify(response), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  });
}

// Fetch and parse RSS feed
async function fetchRSSFeed(source) {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'HarareMetro/1.0 (+https://www.hararemetro.co.zw)'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });

  const xmlText = await response.text();
  const parsed = parser.parse(xmlText);
  const items = parsed.rss?.channel?.item || parsed.feed?.entry || [];

  return Array.isArray(items) ? items : [items].filter(Boolean);
}