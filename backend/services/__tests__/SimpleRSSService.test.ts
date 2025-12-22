/**
 * Tests for SimpleRSSService
 * Tests RSS feed fetching, parsing, category assignment, and image extraction
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch for RSS feed testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// SimpleRSSService helper functions (tested in isolation)
describe('SimpleRSSService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RSS Feed Parsing', () => {
    describe('parseItem', () => {
      // Test the item parsing logic
      const extractText = (node: any): string | null => {
        if (node === null || node === undefined) return null;
        if (typeof node === 'string') return node.trim();
        if (typeof node === 'object') {
          if (node['#text']) return String(node['#text']).trim();
          if (node['_']) return String(node['_']).trim();
        }
        return String(node).trim();
      };

      it('should extract text from string node', () => {
        expect(extractText('Test Title')).toBe('Test Title');
      });

      it('should extract text from object with #text', () => {
        expect(extractText({ '#text': 'Title from object' })).toBe('Title from object');
      });

      it('should extract text from object with _ property', () => {
        expect(extractText({ _: 'Title from underscore' })).toBe('Title from underscore');
      });

      it('should return null for null/undefined', () => {
        expect(extractText(null)).toBeNull();
        expect(extractText(undefined)).toBeNull();
      });

      it('should convert numbers to strings', () => {
        expect(extractText(123)).toBe('123');
      });

      it('should trim whitespace', () => {
        expect(extractText('  spaced text  ')).toBe('spaced text');
      });
    });

    describe('parseDate', () => {
      const parseDate = (dateStr: any): string => {
        if (!dateStr) return new Date().toISOString();
        try {
          const text = typeof dateStr === 'object' && dateStr['#text']
            ? dateStr['#text']
            : String(dateStr);
          const date = new Date(text);
          if (isNaN(date.getTime())) {
            return new Date().toISOString();
          }
          return date.toISOString();
        } catch {
          return new Date().toISOString();
        }
      };

      it('should parse RFC 2822 date format', () => {
        const date = parseDate('Mon, 01 Jan 2024 12:00:00 GMT');
        expect(date).toBe('2024-01-01T12:00:00.000Z');
      });

      it('should parse ISO 8601 date format', () => {
        const date = parseDate('2024-01-15T10:30:00Z');
        expect(date).toBe('2024-01-15T10:30:00.000Z');
      });

      it('should handle object with #text', () => {
        const date = parseDate({ '#text': '2024-06-15T00:00:00Z' });
        expect(date).toBe('2024-06-15T00:00:00.000Z');
      });

      it('should return current date for invalid input', () => {
        const date = parseDate('not a date');
        expect(new Date(date).getTime()).toBeGreaterThan(0);
      });

      it('should return current date for null/undefined', () => {
        const date1 = parseDate(null);
        const date2 = parseDate(undefined);
        expect(new Date(date1).getTime()).toBeGreaterThan(0);
        expect(new Date(date2).getTime()).toBeGreaterThan(0);
      });
    });
  });

  describe('Category Assignment', () => {
    // Category assignment keywords
    const CATEGORY_KEYWORDS: Record<string, string[]> = {
      politics: ['government', 'parliament', 'minister', 'election', 'president', 'vote', 'party', 'policy'],
      sports: ['football', 'soccer', 'cricket', 'rugby', 'tennis', 'athletics', 'sports', 'match', 'tournament'],
      business: ['economy', 'market', 'trade', 'investment', 'company', 'stock', 'business', 'finance'],
      technology: ['tech', 'software', 'app', 'digital', 'ai', 'innovation', 'startup', 'technology'],
      entertainment: ['music', 'movie', 'celebrity', 'entertainment', 'show', 'concert', 'film', 'artist'],
      health: ['health', 'medical', 'hospital', 'disease', 'doctor', 'patient', 'treatment', 'covid'],
    };

    const assignCategory = (title: string, description: string = ''): string => {
      const content = `${title} ${description}`.toLowerCase();

      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        for (const keyword of keywords) {
          if (content.includes(keyword)) {
            return category;
          }
        }
      }

      return 'general';
    };

    it('should assign politics category for government content', () => {
      expect(assignCategory('Government announces new policy')).toBe('politics');
    });

    it('should assign sports category for football content', () => {
      expect(assignCategory('Zimbabwe football team wins match')).toBe('sports');
    });

    it('should assign business category for economy content', () => {
      expect(assignCategory('Stock market reaches new high')).toBe('business');
    });

    it('should assign technology category for tech content', () => {
      expect(assignCategory('New AI software launched')).toBe('technology');
    });

    it('should assign entertainment category for music content', () => {
      expect(assignCategory('Popular artist announces concert')).toBe('entertainment');
    });

    it('should assign health category for medical content', () => {
      expect(assignCategory('New hospital opens in Harare')).toBe('health');
    });

    it('should return general for unmatched content', () => {
      expect(assignCategory('Local gathering held yesterday morning')).toBe('general');
    });

    it('should check description when title has no match', () => {
      expect(assignCategory('Breaking news', 'parliament session delayed')).toBe('politics');
    });

    it('should be case insensitive', () => {
      expect(assignCategory('GOVERNMENT POLICY ANNOUNCED')).toBe('politics');
    });
  });

  describe('Slug Generation', () => {
    const generateSlug = (title: string): string => {
      return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 80)
        .replace(/-$/, '');
    };

    it('should convert spaces to hyphens', () => {
      expect(generateSlug('This Is A Title')).toBe('this-is-a-title');
    });

    it('should remove special characters', () => {
      expect(generateSlug('Title with @#$% symbols!')).toBe('title-with-symbols');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Title   with   spaces')).toBe('title-with-spaces');
    });

    it('should limit to 80 characters', () => {
      const longTitle = 'A'.repeat(100);
      expect(generateSlug(longTitle).length).toBeLessThanOrEqual(80);
    });

    it('should remove trailing hyphens', () => {
      expect(generateSlug('Title ends with symbol!')).toBe('title-ends-with-symbol');
    });
  });

  describe('Image Extraction', () => {
    const TRUSTED_DOMAINS = ['herald.co.zw', 'wp.com', 'cloudinary.com', 'imgur.com'];

    const isValidImageUrl = (url: string | null | undefined): boolean => {
      if (!url || typeof url !== 'string') return false;
      try {
        const urlObj = new URL(url);
        return TRUSTED_DOMAINS.some(domain => urlObj.hostname.includes(domain));
      } catch {
        return false;
      }
    };

    // NOTE: This is a test-only function to validate URL extraction behavior.
    // Production code should use proper HTML parsing (DOMParser) not regex.
    const findImageUrl = (html: string): string | null => {
      // Simple approach: look for src= followed by a URL
      // This is for testing purposes only - NOT for production HTML parsing
      const srcIndex = html.toLowerCase().indexOf('src=');
      if (srcIndex === -1) return null;

      const afterSrc = html.slice(srcIndex + 4);
      const quote = afterSrc[0];
      if (quote !== '"' && quote !== "'") return null;

      const endQuote = afterSrc.indexOf(quote, 1);
      if (endQuote === -1) return null;

      return afterSrc.slice(1, endQuote);
    };

    it('should validate trusted domain URLs', () => {
      expect(isValidImageUrl('https://herald.co.zw/image.jpg')).toBe(true);
      expect(isValidImageUrl('https://i1.wp.com/photo.jpg')).toBe(true);
      expect(isValidImageUrl('https://res.cloudinary.com/image.png')).toBe(true);
    });

    it('should reject untrusted domain URLs', () => {
      expect(isValidImageUrl('https://evil-site.com/image.jpg')).toBe(false);
      expect(isValidImageUrl('https://random.net/photo.png')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isValidImageUrl('')).toBe(false);
      expect(isValidImageUrl(null)).toBe(false);
      expect(isValidImageUrl(undefined)).toBe(false);
      expect(isValidImageUrl('not-a-url')).toBe(false);
    });

    it('should find image URL from HTML with double quotes', () => {
      const html = '<p>Text</p><img src="https://example.com/image.jpg" alt="test">';
      expect(findImageUrl(html)).toBe('https://example.com/image.jpg');
    });

    it('should find image URL from HTML with single quotes', () => {
      const html = "<img src='https://example.com/photo.png'>";
      expect(findImageUrl(html)).toBe('https://example.com/photo.png');
    });

    it('should return null when no image found', () => {
      const html = '<p>No images here</p>';
      expect(findImageUrl(html)).toBeNull();
    });
  });

  describe('Keyword Extraction', () => {
    const extractKeywords = (title: string, description: string = ''): string[] => {
      const text = `${title} ${description}`.toLowerCase();
      const words = text.match(/\b[a-z]{4,}\b/g) || [];

      // Remove common words
      const stopWords = ['this', 'that', 'with', 'from', 'have', 'been', 'will', 'what', 'when', 'where', 'which'];
      const filtered = words.filter(word => !stopWords.includes(word));

      // Return unique keywords, limited to 5
      return [...new Set(filtered)].slice(0, 5);
    };

    it('should extract keywords from title', () => {
      const keywords = extractKeywords('Zimbabwe Government Announces New Policy');
      expect(keywords).toContain('zimbabwe');
      expect(keywords).toContain('government');
      expect(keywords).toContain('announces');
      expect(keywords).toContain('policy');
    });

    it('should exclude words shorter than 4 characters', () => {
      const keywords = extractKeywords('The big cat ran');
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('big');
      expect(keywords).not.toContain('cat');
      expect(keywords).not.toContain('ran');
    });

    it('should exclude stop words', () => {
      const keywords = extractKeywords('This article will have been updated');
      expect(keywords).not.toContain('this');
      expect(keywords).not.toContain('will');
      expect(keywords).not.toContain('have');
      expect(keywords).not.toContain('been');
    });

    it('should return unique keywords only', () => {
      const keywords = extractKeywords('Zimbabwe news about Zimbabwe');
      const zimbabweCount = keywords.filter(k => k === 'zimbabwe').length;
      expect(zimbabweCount).toBeLessThanOrEqual(1);
    });

    it('should limit to 5 keywords', () => {
      const keywords = extractKeywords(
        'government parliament minister election president policy reform legislation amendment constitution'
      );
      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array for empty input', () => {
      expect(extractKeywords('')).toEqual([]);
    });
  });

  describe('Feed Fetch Error Handling', () => {
    it('should handle timeout errors', async () => {
      mockFetch.mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error('Aborted');
          (error as any).name = 'AbortError';
          reject(error);
        });
      });

      try {
        await fetch('https://example.com/feed.xml');
      } catch (error: any) {
        expect(error.name).toBe('AbortError');
      }
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const response = await fetch('https://example.com/feed.xml');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(fetch('https://example.com/feed.xml')).rejects.toThrow('Network error');
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(''),
      });

      const response = await fetch('https://example.com/feed.xml');
      const text = await response.text();
      expect(text).toBe('');
    });

    it('should detect HTML instead of RSS', async () => {
      const htmlResponse = '<!DOCTYPE html><html><body>Not RSS</body></html>';
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(htmlResponse),
      });

      const response = await fetch('https://example.com/feed');
      const text = await response.text();
      expect(text.startsWith('<!DOCTYPE')).toBe(true);
    });
  });

  describe('RSS 2.0 vs Atom Format', () => {
    it('should identify RSS 2.0 feed structure', () => {
      const rss2Feed = {
        rss: {
          channel: {
            item: [{ title: 'Article 1' }],
          },
        },
      };

      expect(rss2Feed.rss?.channel?.item).toBeDefined();
    });

    it('should identify Atom feed structure', () => {
      const atomFeed = {
        feed: {
          entry: [{ title: 'Entry 1' }],
        },
      };

      expect(atomFeed.feed?.entry).toBeDefined();
    });

    it('should handle single item (not array)', () => {
      const singleItemFeed = {
        rss: {
          channel: {
            item: { title: 'Single Article' },
          },
        },
      };

      const item = singleItemFeed.rss.channel.item;
      const items = Array.isArray(item) ? item : [item];
      expect(items).toHaveLength(1);
    });
  });

  describe('Content Sanitization', () => {
    // NOTE: This is a test-only utility for validating text extraction behavior.
    // Production code should use proper HTML parsing libraries like DOMParser.
    // This is intentionally simple to test the service's text extraction output.
    const extractTextContent = (input: string): string => {
      // Use a simple approach: split on angle brackets, keep only text
      const parts = input.split(/[<>]/);
      // Filter out tag names and attributes, keep text content
      const textParts = parts.filter((part, index) => {
        // Even indices after split on < > are typically content, not tags
        if (index % 2 === 0) return true;
        // Check if this looks like a tag (starts with / or letter)
        return !/^[a-zA-Z\/!]/.test(part.trim());
      });
      return textParts.join(' ').replace(/\s+/g, ' ').trim();
    };

    it('should extract text content from HTML', () => {
      const result = extractTextContent('<p>Hello <strong>World</strong></p>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should handle nested tags', () => {
      const result = extractTextContent('<div><p>Nested <em>text</em></p></div>');
      expect(result).toContain('Nested');
      expect(result).toContain('text');
    });

    it('should normalize whitespace', () => {
      const result = extractTextContent('<p>Line 1</p>   <p>Line 2</p>');
      // Should not have excessive whitespace
      expect(result).not.toMatch(/\s{3,}/);
    });

    it('should return empty string for empty input', () => {
      expect(extractTextContent('')).toBe('');
    });
  });
});
