import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { XMLParser } from 'fast-xml-parser'

// RSS feed sources
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
    category: {'general', 'Zimbabwe'}
  },
  {
    name: 'ZBC News',
    url: 'https://www.zbc.co.zw/feed/',
    category: {'general', 'Zimbabwe', 'news', 'current affairs', 'politics'}
  },
  {
    name: 'Business Weekly',
    url: 'https://businessweekly.co.zw/feed/',
    category: {'business', 'Zimbabwe', 'economy', 'finance'}
  }
  { name: 'Techzim',
    url: 'https://www.techzim.co.zw/feed/',
    category: {'technology', 'Zimbabwe', 'innovation'}
  },
  {
    name: 'The Standard',
    url: 'https://www.thestandard.co.zw/feed/',
    category: {'general', 'Zimbabwe', 'news'}
  },
  {
    name: 'ZimLive',
    url: 'https://www.zimlive.com/feed/',
    category: {'general', 'Zimbabwe', 'news'}
  }
  // ...more sources...
]

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    try {
      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        return await handleApiRequest(request, env, ctx)
      }

      // Serve static assets
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx)
        },
        {
          ASSET_NAMESPACE: env.ASSETS
        }
      )
    } catch (error) {
      return new Response('Error: ' + error.message, { status: 500 })
    }
  },

  // Scheduled task to update feeds
  async scheduled(event, env, ctx) {
    ctx.waitUntil(updateFeeds(env))
  }
}