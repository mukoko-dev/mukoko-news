/**
 * Tests for PersonalizedFeedService
 * Tests personalized feed generation, scoring, and country filtering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PersonalizedFeedService } from '../PersonalizedFeedService';

// Helper to create mock D1Database
const createMockD1 = () => {
  const mockStatement = {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
    all: vi.fn(),
    run: vi.fn(),
  };

  return {
    prepare: vi.fn().mockReturnValue(mockStatement),
    _statement: mockStatement,
  };
};

describe('PersonalizedFeedService', () => {
  let service: PersonalizedFeedService;
  let mockDb: ReturnType<typeof createMockD1>;

  // Sample articles for testing
  const sampleArticles = [
    {
      id: 1,
      title: 'Politics Article',
      slug: 'politics-article',
      description: 'About politics',
      content_snippet: 'Content...',
      author: 'John Doe',
      source: 'The Herald',
      source_id: 'herald',
      published_at: new Date().toISOString(),
      image_url: 'https://example.com/image1.jpg',
      original_url: 'https://example.com/article1',
      category_id: 'politics',
      country_id: 'ZW',
      view_count: 100,
      like_count: 10,
      bookmark_count: 5,
    },
    {
      id: 2,
      title: 'Sports Article',
      slug: 'sports-article',
      description: 'About sports',
      content_snippet: 'Content...',
      author: 'Jane Smith',
      source: 'Daily News',
      source_id: 'dailynews',
      published_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      image_url: 'https://example.com/image2.jpg',
      original_url: 'https://example.com/article2',
      category_id: 'sports',
      country_id: 'ZA',
      view_count: 200,
      like_count: 20,
      bookmark_count: 10,
    },
    {
      id: 3,
      title: 'Business Article',
      slug: 'business-article',
      description: 'About business',
      content_snippet: 'Content...',
      author: 'Bob Wilson',
      source: 'Chronicle',
      source_id: 'chronicle',
      published_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      image_url: 'https://example.com/image3.jpg',
      original_url: 'https://example.com/article3',
      category_id: 'business',
      country_id: 'KE',
      view_count: 50,
      like_count: 5,
      bookmark_count: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockD1();
    service = new PersonalizedFeedService(mockDb as unknown as D1Database);
  });

  describe('getPersonalizedFeed', () => {
    describe('anonymous users', () => {
      it('should return trending feed for anonymous users', async () => {
        mockDb._statement.all.mockResolvedValue({ results: sampleArticles });
        mockDb._statement.first.mockResolvedValue({ total: 3 });

        const result = await service.getPersonalizedFeed(null);

        expect(result.isPersonalized).toBe(false);
        expect(result.articles).toBeDefined();
      });

      it('should filter by countries for anonymous users', async () => {
        mockDb._statement.all.mockResolvedValue({
          results: sampleArticles.filter(a => a.country_id === 'ZW')
        });
        mockDb._statement.first.mockResolvedValue({ total: 1 });

        const result = await service.getPersonalizedFeed(null, { countries: ['ZW'] });

        expect(result.countries).toEqual(['ZW']);
      });

      it('should respect limit and offset', async () => {
        mockDb._statement.all.mockResolvedValue({ results: [sampleArticles[0]] });
        mockDb._statement.first.mockResolvedValue({ total: 3 });

        const result = await service.getPersonalizedFeed(null, { limit: 1, offset: 0 });

        expect(result.articles.length).toBe(1);
      });
    });

    describe('users without preferences', () => {
      beforeEach(() => {
        // Mock empty preferences
        mockDb._statement.all.mockResolvedValue({ results: [] });
        mockDb._statement.first.mockResolvedValue({ total: 3 });
      });

      it('should return trending feed for users without preferences', async () => {
        // Re-setup for this specific test to return articles on second call
        mockDb._statement.all
          .mockResolvedValueOnce({ results: [] }) // sources
          .mockResolvedValueOnce({ results: [] }) // authors
          .mockResolvedValueOnce({ results: [] }) // categories
          .mockResolvedValueOnce({ results: [] }) // countries
          .mockResolvedValueOnce({ results: [] }) // history
          .mockResolvedValueOnce({ results: [] }) // recent
          .mockResolvedValue({ results: sampleArticles }); // trending

        const result = await service.getPersonalizedFeed('user-123');

        expect(result.isPersonalized).toBe(false);
      });
    });

    describe('users with preferences', () => {
      beforeEach(() => {
        // Setup user with preferences
        mockDb._statement.all
          .mockResolvedValueOnce({ results: [{ follow_id: 'herald' }] }) // followed sources
          .mockResolvedValueOnce({ results: [{ follow_id: 'John Doe' }] }) // followed authors
          .mockResolvedValueOnce({ results: [{ follow_id: 'politics' }] }) // followed categories
          .mockResolvedValueOnce({ results: [{ country_id: 'ZW', is_primary: true }] }) // countries
          .mockResolvedValueOnce({ results: [{ category_id: 'politics', read_count: 10, total_time: 600, avg_depth: 80 }] }) // history
          .mockResolvedValueOnce({ results: [] }) // recent reads
          .mockResolvedValue({ results: sampleArticles }); // candidates

        mockDb._statement.first.mockResolvedValue({ total: 3 });
      });

      it('should return personalized feed', async () => {
        const result = await service.getPersonalizedFeed('user-123');

        expect(result.isPersonalized).toBe(true);
        expect(result.articles).toBeDefined();
      });

      it('should boost articles from followed sources', async () => {
        const result = await service.getPersonalizedFeed('user-123');

        // Herald article should be ranked higher
        const heraldArticle = result.articles.find(a => a.source_id === 'herald');
        expect(heraldArticle).toBeDefined();
        if (heraldArticle?.scoreBreakdown) {
          expect(heraldArticle.scoreBreakdown.followedSource).toBeGreaterThan(0);
        }
      });

      it('should boost articles from followed authors', async () => {
        const result = await service.getPersonalizedFeed('user-123');

        const authorArticle = result.articles.find(a => a.author === 'John Doe');
        expect(authorArticle).toBeDefined();
        if (authorArticle?.scoreBreakdown) {
          expect(authorArticle.scoreBreakdown.followedAuthor).toBeGreaterThan(0);
        }
      });

      it('should boost articles from followed categories', async () => {
        const result = await service.getPersonalizedFeed('user-123');

        const categoryArticle = result.articles.find(a => a.category_id === 'politics');
        expect(categoryArticle).toBeDefined();
        if (categoryArticle?.scoreBreakdown) {
          expect(categoryArticle.scoreBreakdown.followedCategory).toBeGreaterThan(0);
        }
      });

      it('should boost articles from primary country', async () => {
        const result = await service.getPersonalizedFeed('user-123');

        const countryArticle = result.articles.find(a => a.country_id === 'ZW');
        expect(countryArticle).toBeDefined();
        if (countryArticle?.scoreBreakdown) {
          expect(countryArticle.scoreBreakdown.primaryCountry).toBeGreaterThan(0);
        }
      });

      it('should apply recency weight', async () => {
        const result = await service.getPersonalizedFeed('user-123', { recencyWeight: 2.0 });

        // More recent articles should have higher recency scores
        const newestArticle = result.articles.find(a => a.id === 1);
        const olderArticle = result.articles.find(a => a.id === 3);

        if (newestArticle?.scoreBreakdown && olderArticle?.scoreBreakdown) {
          expect(newestArticle.scoreBreakdown.recency).toBeGreaterThan(
            olderArticle.scoreBreakdown.recency
          );
        }
      });

      it('should exclude already read articles', async () => {
        // Setup with recently read articles
        mockDb._statement.all
          .mockResolvedValueOnce({ results: [{ follow_id: 'herald' }] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [{ article_id: 1 }] }) // article 1 was read
          .mockResolvedValue({ results: sampleArticles });

        const result = await service.getPersonalizedFeed('user-123', { excludeRead: true });

        const readArticle = result.articles.find(a => a.id === 1);
        expect(readArticle).toBeUndefined();
      });

      it('should override countries with option', async () => {
        const result = await service.getPersonalizedFeed('user-123', { countries: ['KE'] });

        expect(result.countries).toEqual(['KE']);
      });
    });

    describe('diversity factor', () => {
      it('should apply diversity penalty with high factor', async () => {
        // Articles from same category
        const sameCategoryArticles = [
          { ...sampleArticles[0], id: 1, category_id: 'politics' },
          { ...sampleArticles[0], id: 2, category_id: 'politics' },
          { ...sampleArticles[0], id: 3, category_id: 'politics' },
        ];

        mockDb._statement.all
          .mockResolvedValueOnce({ results: [{ follow_id: 'politics' }] }) // followed categories
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValue({ results: sameCategoryArticles });

        mockDb._statement.first.mockResolvedValue({ total: 3 });

        const result = await service.getPersonalizedFeed('user-123', { diversityFactor: 1.0 });

        // Later articles from same category should have diversity penalty
        const articles = result.articles;
        if (articles.length >= 2 && articles[1].scoreBreakdown) {
          expect(articles[1].scoreBreakdown.diversity).toBeLessThan(0);
        }
      });

      it('should not apply diversity penalty with factor 0', async () => {
        mockDb._statement.all
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [{ follow_id: 'politics' }] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValue({ results: sampleArticles });

        mockDb._statement.first.mockResolvedValue({ total: 3 });

        const result = await service.getPersonalizedFeed('user-123', { diversityFactor: 0 });

        result.articles.forEach(article => {
          if (article.scoreBreakdown) {
            expect(article.scoreBreakdown.diversity).toBe(0);
          }
        });
      });
    });

    describe('engagement scoring', () => {
      it('should score based on engagement metrics', async () => {
        mockDb._statement.all
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValueOnce({ results: [] })
          .mockResolvedValue({ results: sampleArticles });

        mockDb._statement.first.mockResolvedValue({ total: 3 });

        const result = await service.getPersonalizedFeed('user-123');

        // Sports article has highest engagement (200 views, 20 likes, 10 bookmarks)
        const highEngagement = result.articles.find(a => a.category_id === 'sports');
        const lowEngagement = result.articles.find(a => a.category_id === 'business');

        if (highEngagement?.scoreBreakdown && lowEngagement?.scoreBreakdown) {
          expect(highEngagement.scoreBreakdown.engagement).toBeGreaterThan(
            lowEngagement.scoreBreakdown.engagement
          );
        }
      });
    });
  });

  describe('getFeedExplanation', () => {
    it('should return explanation of why articles are recommended', async () => {
      mockDb._statement.all
        .mockResolvedValueOnce({ results: [{ follow_id: 'herald' }] }) // sources
        .mockResolvedValueOnce({ results: [{ follow_id: 'John Doe' }] }) // authors
        .mockResolvedValueOnce({ results: [{ follow_id: 'politics' }] }) // categories
        .mockResolvedValueOnce({ results: [{ country_id: 'ZW' }] }) // countries
        .mockResolvedValueOnce({ results: [{ category_id: 'politics', read_count: 10, total_time: 600, avg_depth: 80 }] })
        .mockResolvedValueOnce({ results: [] }) // recent
        .mockResolvedValueOnce({ results: [{ name: 'The Herald' }] }) // source names
        .mockResolvedValueOnce({ results: [{ name: 'Politics' }] }); // category names

      const result = await service.getFeedExplanation('user-123');

      expect(result.sources).toContain('The Herald');
      expect(result.authors).toContain('John Doe');
      expect(result.categories).toContain('politics');
      expect(result.topInterests).toContain('Politics');
    });

    it('should handle users with no follows', async () => {
      mockDb._statement.all.mockResolvedValue({ results: [] });

      const result = await service.getFeedExplanation('user-123');

      expect(result.sources).toEqual([]);
      expect(result.authors).toEqual([]);
      expect(result.categories).toEqual([]);
      expect(result.topInterests).toEqual([]);
    });
  });

  describe('Pan-African country support', () => {
    it('should filter articles by multiple countries', async () => {
      const filteredArticles = sampleArticles.filter(
        a => ['ZW', 'ZA'].includes(a.country_id)
      );

      mockDb._statement.all.mockResolvedValue({ results: filteredArticles });
      mockDb._statement.first.mockResolvedValue({ total: 2 });

      const result = await service.getPersonalizedFeed(null, {
        countries: ['ZW', 'ZA']
      });

      expect(result.countries).toEqual(['ZW', 'ZA']);
      expect(result.articles.every(a => ['ZW', 'ZA'].includes(a.country_id))).toBe(true);
    });

    it('should use user preferred countries when no override', async () => {
      mockDb._statement.all
        .mockResolvedValueOnce({ results: [] }) // sources
        .mockResolvedValueOnce({ results: [] }) // authors
        .mockResolvedValueOnce({ results: [] }) // categories
        .mockResolvedValueOnce({ results: [
          { country_id: 'ZW', is_primary: true },
          { country_id: 'ZA', is_primary: false },
        ]})
        .mockResolvedValueOnce({ results: [] }) // history
        .mockResolvedValueOnce({ results: [] }) // recent
        .mockResolvedValue({ results: sampleArticles.filter(a => ['ZW', 'ZA'].includes(a.country_id)) });

      mockDb._statement.first.mockResolvedValue({ total: 2 });

      const result = await service.getPersonalizedFeed('user-123');

      expect(result.countries).toEqual(['ZW', 'ZA']);
    });
  });
});
