-- Migration: Add composite indexes for feed performance
-- Optimizes the sectioned feed endpoint queries (top stories, latest, category sections)
--
-- These indexes improve:
-- 1. Top Stories query: published articles from last N hours, sorted by engagement
-- 2. Latest query: published articles sorted by date
-- 3. Category sections: published articles filtered by category and country

-- Composite index for status + published_at (covers both top stories and latest base filter)
CREATE INDEX IF NOT EXISTS idx_articles_status_published
ON articles(status, published_at DESC);

-- Composite index for status + country + published_at (covers country-filtered latest)
CREATE INDEX IF NOT EXISTS idx_articles_status_country_published
ON articles(status, country_id, published_at DESC);

-- Composite index for status + category + published_at (covers category sections)
CREATE INDEX IF NOT EXISTS idx_articles_status_category_published
ON articles(status, category_id, published_at DESC);

-- Composite index for status + country + category (covers full filtering)
CREATE INDEX IF NOT EXISTS idx_articles_status_country_category_published
ON articles(status, country_id, category_id, published_at DESC);

-- Covering index for engagement-based sorting (top stories)
-- Note: SQLite can't use computed columns in indexes, but this helps with the base scan
CREATE INDEX IF NOT EXISTS idx_articles_engagement
ON articles(status, published_at DESC, view_count, like_count, bookmark_count)
WHERE status = 'published';
