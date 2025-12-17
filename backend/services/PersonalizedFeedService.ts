/**
 * PersonalizedFeedService
 *
 * Generates personalized article feeds based on user preferences,
 * reading history, follows, and engagement patterns.
 */

interface UserPreferences {
  followedSources: string[];
  followedAuthors: string[];
  followedCategories: string[];
  categoryInterests: Map<string, number>; // category -> interest score
  recentlyRead: Set<number>; // article IDs read recently
}

interface ScoredArticle {
  id: number;
  title: string;
  slug: string;
  description: string;
  content_snippet: string;
  author: string;
  source: string;
  source_id: string;
  published_at: string;
  image_url: string;
  original_url: string;
  category_id: string;
  view_count: number;
  like_count: number;
  bookmark_count: number;
  score: number;
  scoreBreakdown?: {
    followedSource: number;
    followedAuthor: number;
    followedCategory: number;
    categoryInterest: number;
    recency: number;
    engagement: number;
    diversity: number;
  };
}

interface PersonalizedFeedOptions {
  limit?: number;
  offset?: number;
  excludeRead?: boolean;
  diversityFactor?: number; // 0-1, higher = more diverse categories
  recencyWeight?: number; // How much to weight recent articles
}

// Scoring weights
const WEIGHTS = {
  FOLLOWED_SOURCE: 50,      // Strong boost for followed sources
  FOLLOWED_AUTHOR: 40,      // Strong boost for followed authors
  FOLLOWED_CATEGORY: 30,    // Medium boost for followed categories
  CATEGORY_INTEREST: 20,    // Based on reading history
  RECENCY: 25,              // Recent articles get boost
  ENGAGEMENT: 15,           // Popular articles get boost
  DIVERSITY_PENALTY: -10,   // Penalty for too many from same category
};

// Time decay constants
const RECENCY_HALF_LIFE_HOURS = 24; // Articles lose half their recency score per day

export class PersonalizedFeedService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Get personalized feed for a user
   */
  async getPersonalizedFeed(
    userId: string | null,
    options: PersonalizedFeedOptions = {}
  ): Promise<{
    articles: ScoredArticle[];
    total: number;
    isPersonalized: boolean;
  }> {
    const {
      limit = 30,
      offset = 0,
      excludeRead = true,
      diversityFactor = 0.3,
      recencyWeight = 1.0,
    } = options;

    // If no user, return trending feed
    if (!userId) {
      return this.getTrendingFeed(limit, offset);
    }

    // Get user preferences
    const preferences = await this.getUserPreferences(userId);

    // Check if user has any preferences/history
    const hasPreferences =
      preferences.followedSources.length > 0 ||
      preferences.followedAuthors.length > 0 ||
      preferences.followedCategories.length > 0 ||
      preferences.categoryInterests.size > 0;

    if (!hasPreferences) {
      // New user with no preferences, return trending
      return this.getTrendingFeed(limit, offset);
    }

    // Get candidate articles (more than we need for scoring)
    const candidateLimit = Math.min(limit * 5, 200);
    const candidates = await this.getCandidateArticles(
      candidateLimit,
      excludeRead ? preferences.recentlyRead : new Set()
    );

    // Score and rank articles
    const scoredArticles = this.scoreArticles(
      candidates,
      preferences,
      recencyWeight,
      diversityFactor
    );

    // Apply pagination
    const paginatedArticles = scoredArticles.slice(offset, offset + limit);

    // Get total count
    const totalResult = await this.db.prepare(`
      SELECT COUNT(*) as total FROM articles WHERE status = 'published'
    `).first();

    return {
      articles: paginatedArticles,
      total: totalResult?.total as number || 0,
      isPersonalized: true,
    };
  }

  /**
   * Get user's preferences, follows, and reading history
   */
  private async getUserPreferences(userId: string): Promise<UserPreferences> {
    // Get followed sources
    const sourcesResult = await this.db.prepare(`
      SELECT follow_id FROM user_follows
      WHERE user_id = ? AND follow_type = 'source'
    `).bind(userId).all();
    const followedSources = (sourcesResult.results || []).map((r: any) => r.follow_id);

    // Get followed authors
    const authorsResult = await this.db.prepare(`
      SELECT follow_id FROM user_follows
      WHERE user_id = ? AND follow_type = 'author'
    `).bind(userId).all();
    const followedAuthors = (authorsResult.results || []).map((r: any) => r.follow_id);

    // Get followed categories
    const categoriesResult = await this.db.prepare(`
      SELECT follow_id FROM user_follows
      WHERE user_id = ? AND follow_type = 'category'
    `).bind(userId).all();
    const followedCategories = (categoriesResult.results || []).map((r: any) => r.follow_id);

    // Get category interests from reading history (last 30 days)
    const historyResult = await this.db.prepare(`
      SELECT a.category_id, COUNT(*) as read_count,
             SUM(h.reading_time) as total_time,
             AVG(h.scroll_depth) as avg_depth
      FROM user_reading_history h
      JOIN articles a ON h.article_id = a.id
      WHERE h.user_id = ?
        AND h.started_at > datetime('now', '-30 days')
      GROUP BY a.category_id
      ORDER BY read_count DESC
    `).bind(userId).all();

    const categoryInterests = new Map<string, number>();
    const historyRows = historyResult.results || [];
    const maxReadCount = Math.max(...historyRows.map((r: any) => r.read_count), 1);

    for (const row of historyRows) {
      const r = row as any;
      // Score based on read count, time spent, and scroll depth
      const readScore = (r.read_count / maxReadCount) * 0.5;
      const timeScore = Math.min(r.total_time / 3600, 1) * 0.3; // Cap at 1 hour
      const depthScore = (r.avg_depth / 100) * 0.2;
      categoryInterests.set(r.category_id, readScore + timeScore + depthScore);
    }

    // Get recently read article IDs (last 7 days)
    const recentResult = await this.db.prepare(`
      SELECT article_id FROM user_reading_history
      WHERE user_id = ? AND started_at > datetime('now', '-7 days')
    `).bind(userId).all();
    const recentlyRead = new Set((recentResult.results || []).map((r: any) => r.article_id));

    return {
      followedSources,
      followedAuthors,
      followedCategories,
      categoryInterests,
      recentlyRead,
    };
  }

  /**
   * Get candidate articles for personalization
   */
  private async getCandidateArticles(
    limit: number,
    excludeIds: Set<number>
  ): Promise<ScoredArticle[]> {
    // Get recent articles (last 14 days for personalization pool)
    const result = await this.db.prepare(`
      SELECT id, title, slug, description, content_snippet, author, source, source_id,
             published_at, image_url, original_url, category_id, view_count,
             like_count, bookmark_count
      FROM articles
      WHERE status = 'published'
        AND published_at > datetime('now', '-14 days')
      ORDER BY published_at DESC
      LIMIT ?
    `).bind(limit).all();

    const articles = (result.results || []) as unknown as ScoredArticle[];

    // Filter out already read articles if needed
    if (excludeIds.size > 0) {
      return articles.filter(a => !excludeIds.has(a.id));
    }

    return articles;
  }

  /**
   * Score articles based on user preferences
   */
  private scoreArticles(
    articles: ScoredArticle[],
    preferences: UserPreferences,
    recencyWeight: number,
    diversityFactor: number
  ): ScoredArticle[] {
    const now = Date.now();
    const categoryCount = new Map<string, number>();

    // First pass: calculate base scores
    const scoredArticles = articles.map(article => {
      let score = 0;
      const breakdown = {
        followedSource: 0,
        followedAuthor: 0,
        followedCategory: 0,
        categoryInterest: 0,
        recency: 0,
        engagement: 0,
        diversity: 0,
      };

      // Followed source boost
      if (preferences.followedSources.includes(article.source_id)) {
        breakdown.followedSource = WEIGHTS.FOLLOWED_SOURCE;
        score += breakdown.followedSource;
      }

      // Followed author boost
      if (article.author && preferences.followedAuthors.includes(article.author)) {
        breakdown.followedAuthor = WEIGHTS.FOLLOWED_AUTHOR;
        score += breakdown.followedAuthor;
      }

      // Followed category boost
      if (preferences.followedCategories.includes(article.category_id)) {
        breakdown.followedCategory = WEIGHTS.FOLLOWED_CATEGORY;
        score += breakdown.followedCategory;
      }

      // Category interest from reading history
      const categoryInterest = preferences.categoryInterests.get(article.category_id) || 0;
      breakdown.categoryInterest = categoryInterest * WEIGHTS.CATEGORY_INTEREST;
      score += breakdown.categoryInterest;

      // Recency score (exponential decay)
      const articleTime = new Date(article.published_at).getTime();
      const hoursOld = (now - articleTime) / (1000 * 60 * 60);
      const recencyScore = Math.pow(0.5, hoursOld / RECENCY_HALF_LIFE_HOURS);
      breakdown.recency = recencyScore * WEIGHTS.RECENCY * recencyWeight;
      score += breakdown.recency;

      // Engagement score (logarithmic to prevent viral articles from dominating)
      const engagementRaw = article.view_count + article.like_count * 3 + article.bookmark_count * 2;
      const engagementScore = Math.log10(Math.max(engagementRaw, 1) + 1) / 3; // Normalize to ~0-1
      breakdown.engagement = engagementScore * WEIGHTS.ENGAGEMENT;
      score += breakdown.engagement;

      return {
        ...article,
        score,
        scoreBreakdown: breakdown,
      };
    });

    // Sort by score
    scoredArticles.sort((a, b) => b.score - a.score);

    // Second pass: apply diversity penalty (in order)
    if (diversityFactor > 0) {
      for (const article of scoredArticles) {
        const count = categoryCount.get(article.category_id) || 0;
        if (count > 0) {
          // Apply increasing penalty for repeated categories
          const penalty = count * WEIGHTS.DIVERSITY_PENALTY * diversityFactor;
          article.score += penalty;
          if (article.scoreBreakdown) {
            article.scoreBreakdown.diversity = penalty;
          }
        }
        categoryCount.set(article.category_id, count + 1);
      }

      // Re-sort after diversity adjustment
      scoredArticles.sort((a, b) => b.score - a.score);
    }

    return scoredArticles;
  }

  /**
   * Get trending feed for anonymous users or users without preferences
   */
  private async getTrendingFeed(
    limit: number,
    offset: number
  ): Promise<{
    articles: ScoredArticle[];
    total: number;
    isPersonalized: boolean;
  }> {
    const result = await this.db.prepare(`
      SELECT id, title, slug, description, content_snippet, author, source, source_id,
             published_at, image_url, original_url, category_id, view_count,
             like_count, bookmark_count
      FROM articles
      WHERE status = 'published'
        AND published_at > datetime('now', '-7 days')
      ORDER BY (view_count + like_count * 3 + bookmark_count * 2) DESC, published_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    const totalResult = await this.db.prepare(`
      SELECT COUNT(*) as total FROM articles
      WHERE status = 'published' AND published_at > datetime('now', '-7 days')
    `).first();

    return {
      articles: (result.results || []).map(a => ({ ...a, score: 0 } as ScoredArticle)),
      total: totalResult?.total as number || 0,
      isPersonalized: false,
    };
  }

  /**
   * Get "For You" summary - explains why articles were recommended
   */
  async getFeedExplanation(userId: string): Promise<{
    sources: string[];
    authors: string[];
    categories: string[];
    topInterests: string[];
  }> {
    const preferences = await this.getUserPreferences(userId);

    // Get names for followed sources
    const sourceNames: string[] = [];
    if (preferences.followedSources.length > 0) {
      const sourcesResult = await this.db.prepare(`
        SELECT name FROM rss_sources WHERE id IN (${preferences.followedSources.map(() => '?').join(',')})
      `).bind(...preferences.followedSources).all();
      sourceNames.push(...(sourcesResult.results || []).map((r: any) => r.name));
    }

    // Get category names for top interests
    const topInterestIds = Array.from(preferences.categoryInterests.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const categoryNames: string[] = [];
    if (topInterestIds.length > 0) {
      const categoriesResult = await this.db.prepare(`
        SELECT name FROM categories WHERE id IN (${topInterestIds.map(() => '?').join(',')})
      `).bind(...topInterestIds).all();
      categoryNames.push(...(categoriesResult.results || []).map((r: any) => r.name));
    }

    return {
      sources: sourceNames,
      authors: preferences.followedAuthors,
      categories: preferences.followedCategories,
      topInterests: categoryNames,
    };
  }
}
