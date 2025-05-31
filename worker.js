// worker.js - Cloudflare Worker for RSS feed aggregation
// Harare Metro - Mobile-first news aggregation for Zimbabwe's capital
// Developed by Bryan Fawcett (@bryanfawcett) in collaboration with Claude AI
// Created by Nyuchi Web Services - https://nyuchi.com

import { XMLParser } from 'fast-xml-parser';

// Zimbabwe RSS feed sources
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
  },
  {
    name: 'Soccer24',
    url: 'https://www.soccer24.co.zw/feed/',
    categories: ['sports', 'football']
  },
  {
    name: 'Health Times',
    url: 'https://www.healthtimes.co.zw/feed/',
    categories: ['health', 'wellness']
  }
];

// Keywords to prioritize for Zimbabwe/Harare relevance
const PRIORITY_KEYWORDS = [
  'harare', 'zimbabwe', 'zim', 'bulawayo', 'mutare', 'gweru', 'kwekwe',
  'parliament', 'government', 'mnangagwa', 'zanu-pf', 'mdc', 'chamisa',
  'economy', 'inflation', 'currency', 'bond', 'rtgs', 'usd',
  'mining', 'tobacco', 'agriculture', 'maize', 'cotton',
  'warriors', 'dynamos', 'caps united', 'highlanders'
];

// Update category keywords with more comprehensive mapping
const CATEGORY_KEYWORDS = {
  politics: [
    'parliament', 'government', 'election', 'party', 'minister', 
    'president', 'policy', 'zanu', 'mdc', 'opposition', 'cabinet', 
    'council', 'diplomatic', 'sanctions'
  ],
  economy: [
    'economy', 'economic', 'inflation', 'currency', 'budget', 'finance',
    'bank', 'investment', 'gdp', 'trade', 'forex', 'auction', 'rtgs',
    'zimdollar', 'exchange rate'
  ],
  business: [
    'business', 'company', 'entrepreneur', 'startup', 'market', 'industry',
    'corporate', 'commerce', 'profit', 'revenue', 'stock market', 'zse',
    'mining', 'agriculture'
  ],
  sports: [
    'sport', 'football', 'soccer', 'cricket', 'rugby', 'warriors',
    'dynamos', 'caps united', 'highlanders', 'afcon', 'premier league',
    'psl', 'athletics', 'chevrons'
  ],
  harare: [
    'harare', 'capital', 'city council', 'mayor', 'cbd', 'avondale',
    'borrowdale', 'chitungwiza', 'mbare', 'Glen View', 'Highfield',
    'Mount Pleasant', 'Eastlea', 'Westgate'
  ],
  education: [
    'education', 'school', 'university', 'college', 'student', 'teacher',
    'classroom', 'zimsec', 'curriculum', 'exam', 'campus', 'degree',
    'academic', 'research'
  ],
  technology: [
    'technology', 'tech', 'innovation', 'internet', 'software', 'hardware',
    'gadget', 'digital', 'mobile', 'app', 'startup', 'fintech', 'telecom',
    'cyber', 'blockchain'
  ],
  health: [
    'health', 'hospital', 'clinic', 'doctor', 'nurse', 'disease',
    'epidemic', 'vaccine', 'covid', 'medical', 'healthcare', 'medicine',
    'wellness', 'pharmacy'
  ],
  environment: [
    'environment', 'climate', 'pollution', 'conservation', 'wildlife',
    'nature', 'zoo', 'green', 'renewable', 'sustainable', 'energy',
    'water', 'agriculture', 'weather'
  ],
  diaspora: [
    'diaspora', 'immigration', 'visa', 'passport', 'embassy', 'abroad',
    'international', 'migration', 'remittance', 'foreign'
  ]
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (url.pathname === '/api/news') {
        const articles = await getStoredArticles(env);
        return new Response(JSON.stringify(articles), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      if (url.pathname === '/api/update') {
        const result = await updateFeeds(env);
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      return new Response('Harare Metro API - Available endpoints: /api/news, /api/update', {
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  },

  // Scheduled trigger for hourly updates
  async scheduled(controller, env, ctx) {
    console.log('Starting scheduled RSS update...');
    try {
      await updateFeeds(env);
      console.log('Scheduled update completed successfully');
    } catch (error) {
      console.error('Scheduled update failed:', error);
    }
  }
};

async function updateFeeds(env) {
  const allArticles = [];
  const updateResults = {
    timestamp: new Date().toISOString(),
    sources: [],
    totalArticles: 0,
    errors: []
  };

  for (const source of RSS_SOURCES) {
    try {
      console.log(`Fetching RSS from ${source.name}...`);
      const articles = await fetchRSSFeed(source);
      
      if (articles && articles.length > 0) {
        allArticles.push(...articles);
        updateResults.sources.push({
          name: source.name,
          articlesCount: articles.length,
          status: 'success'
        });
      }
    } catch (error) {
      console.error(`Error fetching ${source.name}:`, error);
      updateResults.errors.push({
        source: source.name,
        error: error.message
      });
      updateResults.sources.push({
        name: source.name,
        articlesCount: 0,
        status: 'error'
      });
    }
  }

  // Process and rank articles
  const processedArticles = processArticles(allArticles);
  
  // Store in KV
  await env.NEWS_STORAGE.put('articles', JSON.stringify(processedArticles));
  await env.NEWS_STORAGE.put('last_update', JSON.stringify(updateResults));

  updateResults.totalArticles = processedArticles.length;
  return updateResults;
}

async function verifyFeedUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'HarareMetro/1.0 (+https://www.hararemetro.co.zw)'
      }
    });
    return response.ok;
  } catch (error) {
    console.error(`Feed verification failed for ${url}:`, error);
    return false;
  }
}

async function fetchRSSFeed(source) {
    try {
        // Verify feed URL first
        const isValid = await verifyFeedUrl(source.url);
        if (!isValid) {
            throw new Error(`Feed URL not accessible: ${source.url}`);
        }

        const response = await fetch(source.url, {
            headers: {
                'User-Agent': 'HarareMetro/1.0 (+https://www.hararemetro.co.zw)'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const xmlText = await response.text();
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });

        const parsed = parser.parse(xmlText);
        let items = parsed.rss?.channel?.item || parsed.feed?.entry || [];
        
        // Ensure items is always an array
        if (!Array.isArray(items)) {
            items = [items].filter(Boolean);
        }

        // Map all items without limitation
        return items.map(item => ({
            id: generateId(item.title || item.link),
            title: cleanText(item.title),
            summary: cleanText(item.description || item.summary || '').substring(0, 300),
            url: item.link || item.id,
            publishedAt: parseDate(item.pubDate || item.published || item.updated),
            source: source.name,
            categories: determineCategory(
                item.title + ' ' + (item.description || ''),
                source.categories
            ),
            keywords: extractKeywords(item.title + ' ' + (item.description || '')),
            relevanceScore: calculateRelevance(item.title + ' ' + (item.description || '')),
            image: item['media:content']?.['@_url'] || 
                  item.enclosure?.['@_url'] ||
                  extractImageFromHTML(item.description || '')
        }));

    } catch (error) {
        console.error(`RSS fetch error for ${source.name}:`, error);
        throw error;
    }
}

// Add this helper function to extract images from HTML content
function extractImageFromHTML(html) {
    try {
        const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
        return imgMatch ? imgMatch[1] : null;
    } catch {
        return null;
    }
}

function processArticles(articles) {
  // Remove duplicates based on title similarity
  const uniqueArticles = removeDuplicates(articles);
  
  // Sort by relevance score and date
  uniqueArticles.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return new Date(b.publishedAt) - new Date(a.publishedAt);
  });

  // Return all unique articles without limiting
  return uniqueArticles;
}

function removeDuplicates(articles) {
  const seen = new Set();
  return articles.filter(article => {
    const normalized = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}

function determineCategory(text, sourceCategories = []) {
  const lowerText = text.toLowerCase();
  const matchedCategories = new Set(sourceCategories);
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      matchedCategories.add(category);
    }
  }
  
  // If no categories matched, return general
  if (matchedCategories.size === 0) {
    return ['general'];
  }
  
  return Array.from(matchedCategories);
}

function extractKeywords(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return [...new Set(words)];
}

function cleanText(text) {
  return text.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

function parseDate(dateString) {
  const options = {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    timeZoneName: 'short'
  };
  return new Date(dateString).toLocaleString('en-US', options);
}

function generateId(input) {
  return 'id-' + input.split('').reduce((acc, char) => {
    acc = ((acc << 5) - acc) + char.charCodeAt(0);
    return acc & acc;
  }, 0);
}

function calculateRelevance(text) {
  const baseScore = 10;
  const keywordBonus = 5;
  const dateBonus = 2;
  
  let score = baseScore;
  const lowerText = text.toLowerCase();
  
  // Keyword relevance
  for (const keyword of PRIORITY_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      score += keywordBonus;
    }
  }
  
  // Recency bonus (for articles published within the last 24 hours)
  const now = new Date();
  const publishedDate = new Date(text.publishedAt);
  const hoursDiff = (now - publishedDate) / (1000 * 60 * 60);
  if (hoursDiff <= 24) {
    score += dateBonus;
  }
  
  return score;
}

async function getStoredArticles(env) {
  try {
    const data = await env.NEWS_STORAGE.get('articles');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error retrieving stored articles:', error);
    return [];
  }
}
