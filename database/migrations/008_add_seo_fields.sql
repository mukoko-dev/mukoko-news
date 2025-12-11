-- Migration 008: Add SEO fields to articles table
-- Adds fields for storing generated SEO metadata

-- Add SEO-specific fields to articles table
ALTER TABLE articles ADD COLUMN meta_description TEXT;
ALTER TABLE articles ADD COLUMN seo_title TEXT;
ALTER TABLE articles ADD COLUMN canonical_url TEXT;
ALTER TABLE articles ADD COLUMN seo_keywords TEXT;
ALTER TABLE articles ADD COLUMN og_image TEXT;
ALTER TABLE articles ADD COLUMN seo_updated_at DATETIME;

-- Create index for SEO batch processing
CREATE INDEX IF NOT EXISTS idx_articles_seo_update ON articles(status, seo_updated_at);

-- Create index for sitemap generation
CREATE INDEX IF NOT EXISTS idx_articles_sitemap ON articles(status, published_at DESC);
