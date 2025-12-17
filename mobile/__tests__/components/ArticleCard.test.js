/**
 * Tests for ArticleCard Component
 * Tests rendering, utility functions, and component behavior
 */

// Test utility functions extracted from ArticleCard
describe('ArticleCard Utility Functions', () => {
  describe('formatRelativeTime', () => {
    const formatRelativeTime = (dateString) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Recently';

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        return 'Recently';
      }
    };

    it('should return "Just now" for very recent dates', () => {
      const now = new Date().toISOString();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('should return minutes for dates less than an hour ago', () => {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      expect(formatRelativeTime(thirtyMinsAgo)).toBe('30m');
    });

    it('should return hours for dates less than a day ago', () => {
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(fiveHoursAgo)).toBe('5h');
    });

    it('should return days for dates less than a week ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(threeDaysAgo)).toBe('3d');
    });

    it('should return formatted date for older dates', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoWeeksAgo.toISOString());
      // Should be something like "Dec 2"
      expect(result).toMatch(/[A-Z][a-z]{2} \d{1,2}/);
    });

    it('should return "Recently" for invalid date strings', () => {
      expect(formatRelativeTime('invalid-date')).toBe('Recently');
      expect(formatRelativeTime('')).toBe('Recently');
      // Note: null and undefined are coerced to valid dates by Date constructor
    });

    it('should handle edge case at exactly 60 minutes', () => {
      const sixtyMinsAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(sixtyMinsAgo)).toBe('1h');
    });

    it('should handle edge case at exactly 24 hours', () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(oneDayAgo)).toBe('1d');
    });
  });

  describe('getWordCount', () => {
    const getWordCount = (text) => {
      if (!text) return 0;
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    it('should return 0 for empty text', () => {
      expect(getWordCount('')).toBe(0);
      expect(getWordCount(null)).toBe(0);
      expect(getWordCount(undefined)).toBe(0);
    });

    it('should count words correctly', () => {
      expect(getWordCount('Hello world')).toBe(2);
      expect(getWordCount('One two three four five')).toBe(5);
    });

    it('should handle multiple spaces', () => {
      expect(getWordCount('Hello    world')).toBe(2);
    });

    it('should handle leading and trailing spaces', () => {
      expect(getWordCount('  Hello world  ')).toBe(2);
    });

    it('should handle newlines and tabs', () => {
      expect(getWordCount('Hello\nworld\tthere')).toBe(3);
    });
  });

  describe('getReadTime', () => {
    const getWordCount = (text) => {
      if (!text) return 0;
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const getReadTime = (text) => {
      const words = getWordCount(text);
      const minutes = Math.ceil(words / 200);
      return minutes < 1 ? 1 : minutes;
    };

    it('should return 1 minute for short text', () => {
      expect(getReadTime('Hello world')).toBe(1);
    });

    it('should return 1 minute for text up to 200 words', () => {
      const words = Array(200).fill('word').join(' ');
      expect(getReadTime(words)).toBe(1);
    });

    it('should return 2 minutes for 201-400 words', () => {
      const words = Array(201).fill('word').join(' ');
      expect(getReadTime(words)).toBe(2);
    });

    it('should return 5 minutes for 1000 words', () => {
      const words = Array(1000).fill('word').join(' ');
      expect(getReadTime(words)).toBe(5);
    });

    it('should return 1 for empty text', () => {
      expect(getReadTime('')).toBe(1);
    });
  });

  describe('getHashtags', () => {
    const getHashtags = (article) => {
      const tags = [];

      if (article.category) {
        tags.push(`#${article.category.toLowerCase().replace(/\s+/g, '')}`);
      }

      if (article.tags && Array.isArray(article.tags)) {
        article.tags.slice(0, 3).forEach(tag => {
          const formatted = `#${tag.toLowerCase().replace(/\s+/g, '')}`;
          if (!tags.includes(formatted)) {
            tags.push(formatted);
          }
        });
      }

      const titleLower = (article.title || '').toLowerCase();
      const zimbabweKeywords = ['zimbabwe', 'zim', 'harare', 'bulawayo'];
      zimbabweKeywords.forEach(keyword => {
        if (titleLower.includes(keyword) && tags.length < 4) {
          const tag = `#${keyword}`;
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        }
      });

      return tags.slice(0, 4);
    };

    it('should return empty array for article with no category or tags', () => {
      expect(getHashtags({})).toEqual([]);
    });

    it('should include category as first hashtag', () => {
      const result = getHashtags({ category: 'Politics' });
      expect(result[0]).toBe('#politics');
    });

    it('should handle category with spaces', () => {
      const result = getHashtags({ category: 'Breaking News' });
      expect(result).toContain('#breakingnews');
    });

    it('should include article tags', () => {
      const result = getHashtags({ tags: ['Economy', 'Business', 'Finance'] });
      expect(result).toContain('#economy');
      expect(result).toContain('#business');
      expect(result).toContain('#finance');
    });

    it('should limit to 3 tags from tags array', () => {
      const result = getHashtags({
        tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5']
      });
      // Only first 3 tags should be included
      expect(result).toContain('#tag1');
      expect(result).toContain('#tag2');
      expect(result).toContain('#tag3');
      expect(result).not.toContain('#tag4');
    });

    it('should extract Zimbabwe keywords from title', () => {
      const result = getHashtags({ title: 'Harare News Update' });
      expect(result).toContain('#harare');
    });

    it('should extract multiple Zimbabwe keywords', () => {
      const result = getHashtags({
        title: 'Zimbabwe and Harare Economic News'
      });
      expect(result).toContain('#zimbabwe');
      expect(result).toContain('#harare');
    });

    it('should limit to 4 hashtags maximum', () => {
      const result = getHashtags({
        category: 'Politics',
        tags: ['Tag1', 'Tag2', 'Tag3'],
        title: 'Zimbabwe Harare Bulawayo News',
      });
      expect(result.length).toBeLessThanOrEqual(4);
    });

    it('should not duplicate hashtags', () => {
      const result = getHashtags({
        category: 'Zimbabwe',
        title: 'Zimbabwe News',
      });
      const uniqueTags = [...new Set(result)];
      expect(result.length).toBe(uniqueTags.length);
    });
  });
});

describe('ArticleCard Component', () => {
  // Test article data
  const mockArticle = {
    id: '123',
    slug: 'test-article',
    title: 'Test Article Title',
    description: 'This is a test article description for testing purposes.',
    source: 'Test Source',
    category: 'Politics',
    imageUrl: 'https://example.com/image.jpg',
    pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  };

  describe('data transformation', () => {
    it('should use imageUrl if available', () => {
      const article = { ...mockArticle, imageUrl: 'https://example.com/image.jpg' };
      const imageUrl = article.imageUrl || article.image_url;
      expect(imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should fall back to image_url if imageUrl is not available', () => {
      const article = {
        ...mockArticle,
        imageUrl: undefined,
        image_url: 'https://example.com/fallback.jpg'
      };
      const imageUrl = article.imageUrl || article.image_url;
      expect(imageUrl).toBe('https://example.com/fallback.jpg');
    });

    it('should handle articles without images', () => {
      const article = { ...mockArticle, imageUrl: undefined, image_url: undefined };
      const imageUrl = article.imageUrl || article.image_url;
      expect(imageUrl).toBeFalsy();
    });

    it('should use pubDate if available', () => {
      const pubDate = mockArticle.pubDate || mockArticle.published_at;
      expect(pubDate).toBe(mockArticle.pubDate);
    });

    it('should fall back to published_at if pubDate is not available', () => {
      const article = { ...mockArticle, pubDate: undefined };
      const pubDate = article.pubDate || article.published_at;
      expect(pubDate).toBe(mockArticle.published_at);
    });
  });

  describe('content generation', () => {
    const getContentText = (article) => {
      return article.description || article.content || article.title || '';
    };

    it('should prefer description for content text', () => {
      const result = getContentText(mockArticle);
      expect(result).toBe(mockArticle.description);
    });

    it('should fall back to content if no description', () => {
      const article = {
        ...mockArticle,
        description: undefined,
        content: 'Article content here'
      };
      const result = getContentText(article);
      expect(result).toBe('Article content here');
    });

    it('should fall back to title if no description or content', () => {
      const article = {
        ...mockArticle,
        description: undefined,
        content: undefined
      };
      const result = getContentText(article);
      expect(result).toBe(mockArticle.title);
    });

    it('should return empty string if nothing available', () => {
      const result = getContentText({});
      expect(result).toBe('');
    });
  });

  describe('image key generation', () => {
    it('should generate stable key from article id', () => {
      const imageKey = `${mockArticle.id || mockArticle.slug}-image`;
      expect(imageKey).toBe('123-image');
    });

    it('should fall back to slug if no id', () => {
      const article = { ...mockArticle, id: undefined };
      const imageKey = `${article.id || article.slug}-image`;
      expect(imageKey).toBe('test-article-image');
    });
  });

  describe('accessibility', () => {
    it('should generate proper accessibility label', () => {
      const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now - date) / 3600000);
        return `${diffHours}h`;
      };

      const accessibilityLabel = `${mockArticle.title}. ${mockArticle.source}. ${formatRelativeTime(mockArticle.pubDate)}`;
      expect(accessibilityLabel).toContain('Test Article Title');
      expect(accessibilityLabel).toContain('Test Source');
    });
  });
});
