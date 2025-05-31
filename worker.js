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
    category: 'general'
  },
  {
    name: 'NewsDay Zimbabwe',
    url: 'https://www.newsday.co.zw/feed/',
    category: 'general'
  },
  {
    name: 'Chronicle Zimbabwe',
    url: 'https://www.chronicle.co.zw/feed/',
    category: 'general'
  },
  {
    name: 'ZBC News',
    url: 'https://www.zbc.co.zw/feed/',
    category: 'general'
  },
  {
    name: 'Business Weekly',
    url: 'https://businessweekly.co.zw/feed/',
    category: 'business'
  },
  {
    name: 'Zimbabwe Independent',
    url: 'https://www.theindependent.co.zw/feed/',
    category: 'general'
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

// Category mapping based on keywords
const CATEGORY_KEYWORDS = {
  politics: ['parliament', 'government', 'election', 'party', 'minister', 'president', 'policy', 'zanu', 'mdc', 'opposition'],
  economy: ['economy', 'economic', 'inflation', 'currency', 'budget', 'finance', 'bank', 'investment', 'gdp', 'trade'],
  business: ['business', 'company', 'entrepreneur', 'startup', 'market', 'industry', 'corporate', 'commerce'],
  sports: ['sport', 'football', 'soccer', 'cricket', 'rugby', 'warriors', 'dynamos', 'caps united', 'highlanders', 'afcon'],
  harare: ['harare', 'capital', 'city council', 'mayor', 'cbd', 'avondale', 'borrowdale', 'chitungwiza'],
  education: ['education', 'school', 'university', 'college', 'student', 'teacher', 'classroom'],
  technology: ['technology', 'tech', 'innovation', 'internet', 'software', 'hardware', 'gadget'],
  health: ['health', 'hospital', 'clinic', 'doctor', 'nurse', 'disease', 'epidemic', 'vaccine'],
  environment: ['environment', 'climate', 'pollution', 'conservation', 'wildlife', 'nature', 'zoo']
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

async function fetchRSSFeed(source) {
    try {
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
        const items = parsed.rss?.channel?.item || parsed.feed?.entry || [];
        
        if (!Array.isArray(items)) {
            return [items].filter(Boolean);
        }

        return items.map(item => ({
            id: generateId(item.title || item.link),
            title: cleanText(item.title),
            summary: cleanText(item.description || item.summary || '').substring(0, 300),
            url: item.link || item.id,
            publishedAt: parseDate(item.pubDate || item.published || item.updated),
            source: source.name,
            category: determineCategory(item.title + ' ' + (item.description || '')),
            keywords: extractKeywords(item.title + ' ' + (item.description || '')),
            relevanceScore: calculateRelevance(item.title + ' ' + (item.description || '')),
            // Extract image from media:content, enclosure, or from description HTML
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

  // Limit to most recent 100 articles
  return uniqueArticles.slice(0, 100);
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

function determineCategory(text) {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}

function extractKeywords(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return PRIORITY_KEYWORDS.filter(keyword => 
    words.some(word => word.includes(keyword) || keyword.includes(word))
  );
}

function calculateRelevance(text) {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  // Higher score for Zimbabwe/Harare mentions
  if (lowerText.includes('zimbabwe') || lowerText.includes('zim ')) score += 10;
  if (lowerText.includes('harare')) score += 8;
  
  // Score for priority keywords
  PRIORITY_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      score += 2;
    }
  });
  
  // Bonus for recent articles
  const hoursOld = (Date.now() - Date.parse(text)) / (1000 * 60 * 60);
  if (hoursOld < 24) score += 5;
  if (hoursOld < 6) score += 3;
  
  return score;
}

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function parseDate(dateString) {
  if (!dateString) return new Date().toISOString();
  
  try {
    return new Date(dateString).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function generateId(text) {
  if (!text) return Date.now().toString();
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
}

async function getStoredArticles(env) {
  try {
    const stored = await env.NEWS_STORAGE.get('articles');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // If no stored articles, fetch fresh ones
    console.log('No stored articles found, fetching fresh...');
    await updateFeeds(env);
    const fresh = await env.NEWS_STORAGE.get('articles');
    return fresh ? JSON.parse(fresh) : [];
    
  } catch (error) {
    console.error('Error getting stored articles:', error);
    return [];
  }
}
