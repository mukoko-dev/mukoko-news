/**
 * Simple RSS Feed Service
 *
 * A clean, minimal implementation that focuses on:
 * 1. Fetching RSS feeds reliably
 * 2. Extracting images from feeds
 * 3. Database-driven category assignment
 * 4. Database-driven keyword extraction
 *
 * All configuration is loaded from D1 database - no hardcoded values.
 */

import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// Common ad/tracking domains to filter out (these are universally blocked)
const AD_DOMAINS = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'facebook.com/tr',
  'amazon-adsystem.com',
  'adnxs.com',
  'outbrain.com',
  'taboola.com',
  'criteo.com',
  'adsrvr.org',
  'rubiconproject.com',
  'pubmatic.com',
  'advertising.com',
  'adroll.com',
  'mathtag.com',
  'bidswitch.net',
  'sharethis.com',
  'addthis.com',
];

// Configure turndown to filter ad links but keep image links
turndownService.addRule('filterAdLinks', {
  filter: (node) => {
    if (node.nodeName !== 'A') return false;
    const href = node.getAttribute('href') || '';
    return AD_DOMAINS.some(domain => href.includes(domain));
  },
  replacement: () => '',
});

// Keep image links and render them as markdown images
turndownService.addRule('imageLinkToImage', {
  filter: (node) => {
    if (node.nodeName !== 'A') return false;
    const href = node.getAttribute('href') || '';
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(href);
  },
  replacement: (content, node) => {
    const href = (node as HTMLAnchorElement).getAttribute('href') || '';
    const alt = content || 'Image';
    return `![${alt}](${href})`;
  },
});

// Database configuration types
interface CategoryConfig {
  id: string;
  name: string;
  keywords: string[];
}

interface CountryKeywords {
  countryId: string;
  keywords: string[];
}

interface RSSSource {
  id: string;
  name: string;
  url: string;
  enabled: number;
  country_id?: string;  // Pan-African support
}

interface Article {
  title: string;
  description?: string;
  content?: string;
  author?: string;
  source: string;
  source_id: string;
  category_id: string;
  country_id?: string;  // Pan-African support
  published_at: string;
  image_url?: string;
  original_url: string;
  rss_guid?: string;
}

export class SimpleRSSService {
  private db: D1Database;
  private parser: XMLParser;

  // Cached configuration from database
  private trustedDomains: Set<string> = new Set();
  private categoryKeywords: Map<string, string[]> = new Map();
  private extractionKeywords: string[] = [];
  private configLoaded = false;

  constructor(db: D1Database) {
    this.db = db;

    // Configure XML parser with simple settings
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text'
    });
  }

  /**
   * Load configuration from database (trusted domains, keywords, categories)
   * Called once at the start of feed refresh
   */
  private async loadConfiguration(): Promise<void> {
    if (this.configLoaded) return;

    console.log('[SIMPLE-RSS] Loading configuration from database...');

    try {
      // Load trusted image domains
      const domainsResult = await this.db
        .prepare('SELECT domain FROM trusted_domains WHERE type = ? AND enabled = 1')
        .bind('image')
        .all();

      if (domainsResult.results) {
        this.trustedDomains = new Set(
          domainsResult.results.map((r: any) => r.domain.toLowerCase())
        );
        console.log(`[SIMPLE-RSS] Loaded ${this.trustedDomains.size} trusted image domains`);
      }

      // Load category keywords for assignment
      const categoriesResult = await this.db
        .prepare('SELECT id, keywords FROM categories WHERE enabled = 1')
        .all();

      if (categoriesResult.results) {
        for (const cat of categoriesResult.results as any[]) {
          if (cat.keywords) {
            try {
              const keywords = typeof cat.keywords === 'string'
                ? JSON.parse(cat.keywords)
                : cat.keywords;
              if (Array.isArray(keywords)) {
                this.categoryKeywords.set(cat.id, keywords.map((k: string) => k.toLowerCase()));
              }
            } catch {
              // If keywords is a comma-separated string
              this.categoryKeywords.set(cat.id, cat.keywords.split(',').map((k: string) => k.trim().toLowerCase()));
            }
          }
        }
        console.log(`[SIMPLE-RSS] Loaded keywords for ${this.categoryKeywords.size} categories`);
      }

      // Load extraction keywords from countries
      const countriesResult = await this.db
        .prepare('SELECT keywords FROM countries WHERE enabled = 1')
        .all();

      const allKeywords = new Set<string>();
      if (countriesResult.results) {
        for (const country of countriesResult.results as any[]) {
          if (country.keywords) {
            try {
              const keywords = typeof country.keywords === 'string'
                ? JSON.parse(country.keywords)
                : country.keywords;
              if (Array.isArray(keywords)) {
                keywords.forEach((k: string) => allKeywords.add(k.toLowerCase()));
              }
            } catch {
              // If keywords is a comma-separated string
              country.keywords.split(',').forEach((k: string) => allKeywords.add(k.trim().toLowerCase()));
            }
          }
        }
      }

      // Also load from keywords table
      const keywordsResult = await this.db
        .prepare('SELECT name FROM keywords WHERE enabled = 1 ORDER BY usage_count DESC LIMIT 200')
        .all();

      if (keywordsResult.results) {
        for (const kw of keywordsResult.results as any[]) {
          allKeywords.add(kw.name.toLowerCase());
        }
      }

      this.extractionKeywords = Array.from(allKeywords);
      console.log(`[SIMPLE-RSS] Loaded ${this.extractionKeywords.length} extraction keywords`);

      this.configLoaded = true;
    } catch (error: any) {
      console.error('[SIMPLE-RSS] Error loading configuration:', error.message);
      // Continue with empty config - will use fallbacks
    }
  }

  /**
   * Main entry point - refresh RSS feeds with batching support
   *
   * @param options.batch - Which batch to process (0-indexed). If not specified, processes batch 0.
   * @param options.batchSize - Number of sources per batch. Default 40 to stay under 50 subrequest limit.
   * @returns Results including which batch was processed and total batches available
   */
  async refreshAllFeeds(options: {
    batch?: number;
    batchSize?: number;
  } = {}): Promise<{
    success: boolean;
    newArticles: number;
    errors: number;
    details: string[];
    batch: number;
    totalBatches: number;
    totalSources: number;
  }> {
    const { batch = 0, batchSize = 40 } = options;

    console.log(`[SIMPLE-RSS] Starting RSS refresh (batch ${batch}, size ${batchSize})`);

    // Load configuration from database
    await this.loadConfiguration();

    const results = {
      success: true,
      newArticles: 0,
      errors: 0,
      details: [] as string[],
      batch,
      totalBatches: 1,
      totalSources: 0
    };

    try {
      // Get all enabled RSS sources
      const sources = await this.db
        .prepare('SELECT id, name, url, enabled, country_id FROM rss_sources WHERE enabled = 1 ORDER BY priority DESC, id ASC')
        .all<RSSSource>();

      if (!sources.results || sources.results.length === 0) {
        results.details.push('No enabled RSS sources found');
        return results;
      }

      results.totalSources = sources.results.length;
      results.totalBatches = Math.ceil(sources.results.length / batchSize);

      console.log(`[SIMPLE-RSS] Found ${sources.results.length} enabled sources (${results.totalBatches} batches of ${batchSize})`);

      // Calculate batch boundaries
      const startIndex = batch * batchSize;
      const endIndex = Math.min(startIndex + batchSize, sources.results.length);

      if (startIndex >= sources.results.length) {
        results.details.push(`Batch ${batch} is out of range (only ${results.totalBatches} batches available)`);
        return results;
      }

      const batchSources = sources.results.slice(startIndex, endIndex);
      console.log(`[SIMPLE-RSS] Processing batch ${batch}: sources ${startIndex + 1}-${endIndex} of ${sources.results.length}`);

      // Process each source in this batch
      for (const source of batchSources) {
        try {
          console.log(`[SIMPLE-RSS] Fetching ${source.name} (${source.url})`);
          const articles = await this.fetchAndParseFeed(source);

          console.log(`[SIMPLE-RSS] Parsed ${articles.length} articles from ${source.name}`);

          const stored = await this.storeArticles(articles);
          results.newArticles += stored;

          results.details.push(`${source.name}: ${stored} new articles`);
        } catch (error: any) {
          console.error(`[SIMPLE-RSS] Error processing ${source.name}:`, error.message);
          results.errors++;
          results.details.push(`${source.name}: ERROR - ${error.message}`);
        }
      }

      console.log(`[SIMPLE-RSS] Batch ${batch} complete. New articles: ${results.newArticles}, Errors: ${results.errors}`);

    } catch (error: any) {
      console.error('[SIMPLE-RSS] Fatal error during RSS refresh:', error);
      results.success = false;
      results.details.push(`Fatal error: ${error.message}`);
    }

    return results;
  }

  /**
   * Fetch and parse a single RSS feed
   */
  private async fetchAndParseFeed(source: RSSSource): Promise<Article[]> {
    // Fetch RSS feed with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal,
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const contentType = response.headers.get('content-type') || 'unknown';
      console.log(`[SIMPLE-RSS] ${source.name}: Content-Type: ${contentType}, Length: ${xmlText.length}`);

      if (!xmlText || xmlText.trim().length === 0) {
        throw new Error('Empty response from RSS feed');
      }

      // Check if response is HTML instead of XML (common issue with redirects)
      if (xmlText.trim().startsWith('<!DOCTYPE') || xmlText.trim().startsWith('<html')) {
        console.warn(`[SIMPLE-RSS] ${source.name}: Received HTML instead of RSS feed`);
        throw new Error('Received HTML page instead of RSS feed');
      }

      // Parse XML
      const feed = this.parser.parse(xmlText);

      // Debug: Log parsed feed structure
      console.log(`[SIMPLE-RSS] ${source.name}: Feed structure keys:`, Object.keys(feed));
      if (feed.rss) {
        console.log(`[SIMPLE-RSS] ${source.name}: rss.channel keys:`, feed.rss.channel ? Object.keys(feed.rss.channel) : 'no channel');
      }

      // Extract items from RSS 2.0 or Atom feed
      let items = [];

      if (feed.rss?.channel?.item) {
        items = Array.isArray(feed.rss.channel.item)
          ? feed.rss.channel.item
          : [feed.rss.channel.item];
        console.log(`[SIMPLE-RSS] ${source.name}: Found ${items.length} items in rss.channel.item`);
      } else if (feed.feed?.entry) {
        items = Array.isArray(feed.feed.entry)
          ? feed.feed.entry
          : [feed.feed.entry];
        console.log(`[SIMPLE-RSS] ${source.name}: Found ${items.length} items in feed.entry`);
      } else {
        console.warn(`[SIMPLE-RSS] ${source.name}: No items found in feed structure`);
        return [];
      }

      // Convert items to articles (limit to 20 most recent)
      const articles = items.slice(0, 20).map(item => this.parseItem(item, source));
      const validArticles = articles.filter(a => a !== null) as Article[];

      console.log(`[SIMPLE-RSS] ${source.name}: Parsed ${validArticles.length} valid articles from ${items.length} items`);

      return validArticles;

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout (15s)');
      }
      throw error;
    }
  }

  /**
   * Parse a single RSS item into an Article
   */
  private parseItem(item: any, source: RSSSource): Article | null {
    try {
      // Extract title (required)
      const title = this.extractText(item.title);
      if (!title) {
        console.warn('[SIMPLE-RSS] Skipping item with no title');
        return null;
      }

      // Extract link (required)
      const link = this.extractText(item.link || item.guid);
      if (!link) {
        console.warn('[SIMPLE-RSS] Skipping item with no link');
        return null;
      }

      // Extract description (summary)
      const description = this.extractText(
        item.description ||
        item.summary
      );

      // Extract full content (priority to content:encoded for WordPress feeds)
      const content = this.extractText(
        item['content:encoded'] ||
        item.content ||
        item.description
      );

      // Extract published date
      const pubDate = this.parseDate(
        item.pubDate ||
        item.published ||
        item.updated ||
        item['dc:date']
      );

      // Extract author
      const author = this.extractText(
        item.author ||
        item['dc:creator'] ||
        item.creator
      );

      // Extract image - check multiple sources
      const imageUrl = this.extractImage(item);

      // Generate RSS GUID for deduplication
      const guid = this.extractText(item.guid) || link;

      // Assign category based on title and description
      const category = this.assignCategory(title, description || '');

      // Generate slug from title
      const slug = this.generateSlug(title);

      return {
        title: this.cleanText(title),
        description: description ? this.cleanText(description.substring(0, 500)) : undefined,
        content: content ? this.htmlToMarkdown(content) : undefined,
        author: author ? this.cleanText(author) : undefined,
        source: source.name,
        source_id: source.id,
        category_id: category,
        country_id: source.country_id,  // Pan-African: inherit country from source
        published_at: pubDate,
        image_url: imageUrl,
        original_url: link,
        rss_guid: guid
      };
    } catch (error) {
      console.error('[SIMPLE-RSS] Error parsing item:', error);
      return null;
    }
  }

  /**
   * Extract text from XML element (handles nested objects)
   */
  private extractText(element: any): string | null {
    if (!element) return null;

    if (typeof element === 'string') {
      return element;
    }

    if (element['#text']) {
      return element['#text'];
    }

    if (element['@_href']) {
      return element['@_href'];
    }

    return null;
  }

  /**
   * Extract image URL from RSS item
   * Checks multiple common RSS image fields and validates against trusted domains
   */
  private extractImage(item: any): string | null {
    try {
      const imageCandidates: string[] = [];

      // 1. RSS Media tags (highest priority)
      if (item['media:content']?.['@_url']) {
        imageCandidates.push(item['media:content']['@_url']);
      }

      // 2. media:thumbnail
      if (item['media:thumbnail']?.['@_url']) {
        imageCandidates.push(item['media:thumbnail']['@_url']);
      }

      // 3. enclosure (if type is image)
      if (item.enclosure?.['@_url'] && item.enclosure?.['@_type']?.includes('image')) {
        imageCandidates.push(item.enclosure['@_url']);
      }

      // 4. RSS image tag
      if (item.image) {
        const imgUrl = typeof item.image === 'string' ? item.image : (item.image.url || item.image['@_url']);
        if (imgUrl) imageCandidates.push(imgUrl);
      }

      // 5. WordPress specific fields
      if (item['wp:featured_image']) {
        imageCandidates.push(item['wp:featured_image']);
      }

      if (item['wp:attachment_url']) {
        imageCandidates.push(item['wp:attachment_url']);
      }

      // 6. Extract from description HTML
      const description = this.extractText(item.description);
      if (description) {
        const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) imageCandidates.push(imgMatch[1]);

        // Look for og:image meta tags
        const ogMatch = description.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        if (ogMatch) imageCandidates.push(ogMatch[1]);
      }

      // 7. Extract from content:encoded HTML
      const contentEncoded = item['content:encoded'];
      if (contentEncoded) {
        const htmlContent = typeof contentEncoded === 'string'
          ? contentEncoded
          : (contentEncoded['#text'] || contentEncoded.toString());

        // Extract img src
        const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) imageCandidates.push(imgMatch[1]);

        // Extract og:image
        const ogMatch = htmlContent.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        if (ogMatch) imageCandidates.push(ogMatch[1]);

        // Extract direct image URLs from content
        const urlRegex = /https?:\/\/[^\s<>"']+\.(?:jpe?g|png|gif|webp|svg|bmp|avif)(?:\?[^\s<>"']*)?/gi;
        const urlMatches = htmlContent.match(urlRegex);
        if (urlMatches) imageCandidates.push(...urlMatches);
      }

      // 8. Validate and filter candidates
      for (const candidate of imageCandidates) {
        if (!candidate || typeof candidate !== 'string') continue;

        // Clean URL - decode HTML entities safely
        let cleanUrl = this.decodeHtmlEntities(candidate.trim());

        // Handle protocol-relative URLs
        if (cleanUrl.startsWith('//')) {
          cleanUrl = `https:${cleanUrl}`;
        }

        // Validate URL format and check if it's an image
        if (!this.isValidImageUrl(cleanUrl)) continue;

        // Check if domain is trusted
        if (this.isTrustedImageDomain(cleanUrl)) {
          console.log('[SIMPLE-RSS] ✅ Found trusted image:', cleanUrl);
          return cleanUrl;
        }
      }

      // No valid image found
      return null;
    } catch (error) {
      console.error('[SIMPLE-RSS] Error extracting image:', error);
      return null;
    }
  }

  /**
   * Check if image URL is from a trusted domain (loaded from database)
   */
  private isTrustedImageDomain(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Check against database-loaded trusted domains
      for (const domain of this.trustedDomains) {
        if (hostname.includes(domain) || hostname.endsWith(domain)) {
          return true;
        }
      }

      // Fallback: allow common CDN/CMS domains that are always safe
      const alwaysTrusted = [
        'wp.com', 'wordpress.com', 'cloudinary.com', 'cloudfront.net',
        'amazonaws.com', 'googleusercontent.com', 'fbcdn.net',
        'twimg.com', 'imgur.com', 'unsplash.com', 'pexels.com',
        'wikimedia.org', 'gravatar.com'
      ];

      return alwaysTrusted.some(d => hostname.includes(d));
    } catch {
      return false;
    }
  }

  /**
   * Validate image URL
   */
  private isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    // Must be http/https
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false;

    // Check for image extensions or image in path
    const imageExtensions = /\.(jpe?g|png|gif|webp|svg|bmp|avif)(\?.*)?$/i;
    return imageExtensions.test(url) || url.includes('/image/') || url.includes('/img/');
  }

  /**
   * Assign category based on database-loaded category keywords
   * Falls back to 'general' if no match found
   */
  private assignCategory(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();

    // Use database-loaded category keywords
    if (this.categoryKeywords.size > 0) {
      let bestMatch: { categoryId: string; score: number } | null = null;

      for (const [categoryId, keywords] of this.categoryKeywords) {
        let score = 0;
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            score++;
          }
        }
        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { categoryId, score };
        }
      }

      if (bestMatch) {
        return bestMatch.categoryId;
      }
    }

    // Default to general if no category keywords loaded or no match
    return 'general';
  }

  /**
   * Parse date string to ISO format
   */
  private parseDate(dateStr: any): string {
    try {
      const text = this.extractText(dateStr);
      if (!text) return new Date().toISOString();

      const date = new Date(text);
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }

      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Decode HTML entities safely (prevents double-unescaping)
   */
  private decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      'amp': '&',
      'lt': '<',
      'gt': '>',
      'quot': '"',
      'apos': "'",
      'nbsp': ' '
    };

    return text
      // Decode named entities
      .replace(/&([a-z]+);/gi, (match, entity) => entities[entity.toLowerCase()] || match)
      // Decode numeric entities (decimal)
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
      // Decode hex entities
      .replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  /**
   * Clean text - remove HTML, decode entities, trim, normalize whitespace
   * Uses loop-based removal to ensure complete sanitization
   */
  private cleanText(text: string): string {
    // Remove all HTML tags using loop until no more changes
    let cleaned = text;
    let previousLength;
    do {
      previousLength = cleaned.length;
      cleaned = cleaned.replace(/<[^>]*>/g, '');
    } while (cleaned.length !== previousLength);

    // Remove any remaining < or > characters that might cause issues
    cleaned = cleaned.replace(/[<>]/g, '');

    // Third pass: decode HTML entities and normalize
    return cleaned
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .replace(/&#8230;/g, '...') // Replace common typographic entities
      .replace(/&#8211;/g, '-')
      .replace(/&#8212;/g, '-')
      .replace(/&#8216;/g, "'")
      .replace(/&#8217;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#038;/g, '&')
      .trim();
  }

  /**
   * Convert HTML to Markdown, preserving formatting
   * Filters out ad links but keeps image links
   *
   * Note: Turndown handles HTML entity decoding internally, so we don't
   * need additional entity replacement which could cause double-unescaping
   */
  private htmlToMarkdown(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    try {
      // Convert HTML to Markdown using turndown
      // Turndown handles entity decoding internally
      let markdown = turndownService.turndown(html);

      // Clean up excessive whitespace while preserving paragraph breaks
      markdown = markdown
        .replace(/\n{3,}/g, '\n\n')  // Max 2 newlines (paragraph break)
        .replace(/[ \t]+/g, ' ')      // Normalize spaces
        .trim();

      return markdown;
    } catch (error) {
      console.error('[SIMPLE-RSS] Error converting HTML to markdown:', error);
      // Fallback to clean text if markdown conversion fails
      return this.cleanText(html);
    }
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    // Add timestamp for uniqueness
    const timestamp = Date.now().toString().slice(-6);
    return `${baseSlug}-${timestamp}`;
  }

  /**
   * Store articles in database (skip duplicates)
   */
  private async storeArticles(articles: Article[]): Promise<number> {
    let newCount = 0;

    for (const article of articles) {
      try {
        // Check if article already exists
        const existing = await this.db
          .prepare('SELECT id FROM articles WHERE original_url = ? OR rss_guid = ?')
          .bind(article.original_url, article.rss_guid)
          .first();

        if (existing) {
          console.log(`[SIMPLE-RSS] Skipping duplicate: ${article.title.substring(0, 50)}...`);
          continue;
        }

        // Generate slug
        const slug = this.generateSlug(article.title);

        // Insert article
        const insertResult = await this.db
          .prepare(`
            INSERT INTO articles (
              title, slug, description, content, author, source, source_id, source_url,
              category_id, country_id, published_at, image_url, original_url, rss_guid,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `)
          .bind(
            article.title,
            slug,
            article.description,
            article.content,
            article.author,
            article.source,
            article.source_id,
            article.source_id, // source_url same as source_id for now
            article.category_id,
            article.country_id || 'ZW', // Default to Zimbabwe if not specified
            article.published_at,
            article.image_url,
            article.original_url,
            article.rss_guid
          )
          .run();

        const articleId = insertResult.meta.last_row_id;

        // Extract and store keywords
        const keywords = this.extractKeywords(article.title, article.description || '');
        if (keywords.length > 0) {
          await this.storeKeywords(articleId, keywords);
        }

        // Create/update author profile
        if (article.author && article.author.trim()) {
          await this.createOrUpdateAuthor(article.author, article.source);
        }

        console.log(`[SIMPLE-RSS] ✅ Stored: ${article.title.substring(0, 50)}... [${article.category_id}]${article.image_url ? ' 🖼️' : ''}${keywords.length > 0 ? ` [${keywords.length} keywords]` : ''}${article.author ? ` by ${article.author}` : ''}`);
        newCount++;

      } catch (error: any) {
        console.error(`[SIMPLE-RSS] Error storing article "${article.title}":`, error.message);
      }
    }

    return newCount;
  }

  /**
   * Extract keywords from article using database-loaded keywords (top 8)
   */
  extractKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const found: string[] = [];

    // Use database-loaded keywords from countries and keywords tables
    for (const keyword of this.extractionKeywords) {
      if (text.includes(keyword)) {
        found.push(keyword);
        if (found.length >= 8) break;
      }
    }

    return found;
  }

  /**
   * Store keywords and link them to article
   * Creates keyword records if they don't exist, and links them to the article
   */
  private async storeKeywords(articleId: number, keywords: string[]): Promise<void> {
    for (const keyword of keywords) {
      try {
        // Generate keyword ID and slug
        const keywordId = keyword.toLowerCase().replace(/\s+/g, '-');
        const keywordSlug = keywordId;
        const keywordName = keyword.charAt(0).toUpperCase() + keyword.slice(1);

        // Check if keyword exists in master table
        const existingKeyword = await this.db
          .prepare('SELECT id FROM keywords WHERE id = ?')
          .bind(keywordId)
          .first();

        if (!existingKeyword) {
          // Create keyword in master table
          await this.db
            .prepare(`
              INSERT INTO keywords (id, name, slug, type, enabled, created_at, updated_at)
              VALUES (?, ?, ?, 'general', 1, datetime('now'), datetime('now'))
            `)
            .bind(keywordId, keywordName, keywordSlug)
            .run();
        }

        // Link keyword to article
        await this.db
          .prepare(`
            INSERT INTO article_keyword_links (article_id, keyword_id, relevance_score, source, created_at)
            VALUES (?, ?, 1.0, 'auto', datetime('now'))
            ON CONFLICT(article_id, keyword_id) DO NOTHING
          `)
          .bind(articleId, keywordId)
          .run();

        // Update keyword article count
        await this.db
          .prepare('UPDATE keywords SET article_count = article_count + 1 WHERE id = ?')
          .bind(keywordId)
          .run();

      } catch (error: any) {
        console.error(`[SIMPLE-RSS] Error storing keyword "${keyword}":`, error.message);
      }
    }
  }

  /**
   * Create or update author profile
   * Tracks author activity across sources
   */
  private async createOrUpdateAuthor(authorName: string, source: string): Promise<void> {
    try {
      // Clean up author name
      const cleanName = authorName.trim();
      if (!cleanName || cleanName.length < 2) {
        return; // Skip invalid names
      }

      // Generate normalized name for matching (lowercase, no special chars)
      const normalizedName = cleanName.toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

      // Check if author exists
      const existingAuthor = await this.db
        .prepare('SELECT id, article_count, expertise_categories FROM authors WHERE normalized_name = ?')
        .bind(normalizedName)
        .first();

      if (!existingAuthor) {
        // Create new author profile
        await this.db
          .prepare(`
            INSERT INTO authors (
              name, normalized_name, outlet, article_count,
              created_at, updated_at
            )
            VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))
          `)
          .bind(cleanName, normalizedName, source)
          .run();

        console.log(`[SIMPLE-RSS] 👤 Created author profile: ${cleanName} (${source})`);
      } else {
        // Update existing author
        await this.db
          .prepare(`
            UPDATE authors
            SET article_count = article_count + 1,
                updated_at = datetime('now')
            WHERE id = ?
          `)
          .bind(existingAuthor.id)
          .run();
      }

    } catch (error: any) {
      console.error(`[SIMPLE-RSS] Error creating/updating author "${authorName}":`, error.message);
    }
  }
}
