-- Mukoko News Database Schema
-- D1 Database: mukoko-news-db - News articles, RSS sources, categories, and analytics
-- Auth handled separately via id.mukoko.com (OIDC)

PRAGMA defer_foreign_keys=TRUE;

-- ================================================
-- USER TABLES (local profile data, auth via OIDC)
-- ================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE, -- TikTok-style usernames (@username)

    -- Profile information
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,

    -- Role management (admin, moderator, support, author, user)
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'support', 'author', 'user')),

    -- Account status
    email_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

    -- Activity tracking
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,

    -- Preferences
    preferences JSON DEFAULT '{}',

    -- Analytics opt-in
    analytics_consent BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key TEXT NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, preference_key)
);

-- ================================================
-- CATEGORIES AND KEYWORDS (must be created before sources that reference them)
-- ================================================

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    color TEXT,
    keywords TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS keywords (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    type TEXT DEFAULT 'general',
    enabled INTEGER DEFAULT 1,
    article_count INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_keyword_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    keyword_id TEXT NOT NULL REFERENCES keywords(id),
    relevance_score REAL DEFAULT 1.0,
    source TEXT DEFAULT 'auto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, keyword_id)
);

-- Legacy article_keywords table (used by some services)
CREATE TABLE IF NOT EXISTS article_keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    weight INTEGER DEFAULT 1,
    confidence_score REAL DEFAULT 1.0,
    UNIQUE(article_id, keyword)
);

-- ================================================
-- RSS SOURCES AND NEWS SOURCES
-- ================================================

CREATE TABLE IF NOT EXISTS rss_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    country_id TEXT DEFAULT 'ZW' REFERENCES countries(id),  -- Pan-African support
    enabled INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 3,
    metadata TEXT,
    last_fetched_at DATETIME,
    fetch_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news_sources (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    website_url TEXT,
    rss_feed_url TEXT NOT NULL,
    logo_url TEXT,
    description TEXT,
    country TEXT DEFAULT 'Zimbabwe',           -- Legacy field for display
    country_id TEXT DEFAULT 'ZW' REFERENCES countries(id),  -- Pan-African support
    language TEXT DEFAULT 'en',
    category_id TEXT REFERENCES categories(id),

    -- Source status
    enabled BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE,

    -- Fetching configuration
    fetch_frequency INTEGER DEFAULT 60,
    last_fetched_at TIMESTAMP,
    last_successful_fetch_at TIMESTAMP,
    fetch_error_count INTEGER DEFAULT 0,
    last_fetch_error TEXT,

    -- Enhanced processing
    scraping_enabled BOOLEAN DEFAULT false,
    scraping_selectors TEXT,
    author_selectors TEXT,
    last_scrape_attempt TIMESTAMP,
    scrape_success_rate REAL DEFAULT 0.0,
    content_freshness_hours INTEGER DEFAULT 24,

    -- Quality metrics
    quality_rating REAL DEFAULT 1.0,
    credibility_score REAL DEFAULT 1.0,
    source_quality_score REAL DEFAULT 0.0,

    -- RSS configuration (legacy compatibility)
    url TEXT,
    category TEXT,
    priority INTEGER DEFAULT 3,
    metadata TEXT,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    fetch_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feed_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL,
    status TEXT NOT NULL,
    last_run_at DATETIME,
    next_run_at DATETIME,
    run_count INTEGER DEFAULT 0,
    error_message TEXT,
    processing_duration INTEGER,
    articles_fetched INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES rss_sources(id)
);

CREATE TABLE IF NOT EXISTS daily_source_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL REFERENCES news_sources(id),
    date TEXT NOT NULL,
    articles_fetched INTEGER DEFAULT 0,
    fetch_attempts INTEGER DEFAULT 0,
    fetch_errors INTEGER DEFAULT 0,
    avg_fetch_duration INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(source_id, date)
);

-- ================================================
-- ARTICLES
-- ================================================

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Core content fields
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    content TEXT,
    content_snippet TEXT,
    excerpt TEXT,

    -- Author information
    author TEXT,
    byline TEXT,

    -- Source information
    source TEXT NOT NULL,
    source_id TEXT REFERENCES news_sources(id),
    source_url TEXT,

    -- Categorization
    category TEXT,
    category_id TEXT REFERENCES categories(id),
    country_id TEXT DEFAULT 'ZW' REFERENCES countries(id),  -- Pan-African support
    tags TEXT,
    content_type TEXT DEFAULT 'article',

    -- Publishing metadata
    published_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_viewed_at DATETIME,
    last_content_update TIMESTAMP,

    -- Article metrics
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    social_shares INTEGER DEFAULT 0,

    -- Images and media
    image_url TEXT,
    optimized_image_url TEXT,

    -- SEO and sharing
    original_url TEXT NOT NULL,
    rss_guid TEXT,

    -- Article status and priority
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    priority INTEGER DEFAULT 0,

    -- Quality and trending
    source_quality_score REAL DEFAULT 0.0,
    trending_score REAL DEFAULT 0.0,

    -- AI processing
    ai_processed BOOLEAN DEFAULT FALSE,
    ai_processed_at TIMESTAMP,
    ai_summary TEXT,
    processed_content TEXT,

    -- Full-text search
    content_search TEXT
);

CREATE TABLE IF NOT EXISTS article_keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    weight INTEGER DEFAULT 1,

    UNIQUE(article_id, keyword)
);

-- ================================================
-- AUTHORS
-- ================================================

CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,

    -- Profile information
    bio TEXT,
    title TEXT,
    outlet TEXT,
    email TEXT,
    twitter_handle TEXT,
    linkedin_url TEXT,
    profile_image_url TEXT,
    expertise_categories TEXT,

    -- Author statistics
    article_count INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    avg_quality_score REAL DEFAULT 0.0,

    -- Verification
    verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'flagged')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    contribution_type TEXT DEFAULT 'primary' CHECK (contribution_type IN ('primary', 'contributor', 'editor')),
    byline_order INTEGER DEFAULT 1,
    confidence_score REAL DEFAULT 1.0,
    extraction_method TEXT DEFAULT 'ai' CHECK (extraction_method IN ('rss', 'ai', 'manual')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(article_id, author_id)
);

-- ================================================
-- USER ENGAGEMENT
-- ================================================

CREATE TABLE IF NOT EXISTS user_bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags TEXT,
    notes TEXT,

    UNIQUE(user_id, article_id)
);

CREATE TABLE IF NOT EXISTS user_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, article_id)
);

CREATE TABLE IF NOT EXISTS user_reading_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

    -- Reading engagement metrics
    reading_time INTEGER DEFAULT 0,
    scroll_depth INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,

    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_position_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    -- Reading context
    device_type TEXT,
    referrer TEXT,

    UNIQUE(user_id, article_id)
);

CREATE TABLE IF NOT EXISTS user_follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- What is being followed
    follow_type TEXT NOT NULL CHECK (follow_type IN ('source', 'author', 'category')),
    follow_id TEXT NOT NULL,

    -- Notification preferences
    notify_on_new BOOLEAN DEFAULT TRUE,
    notify_on_trending BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, follow_type, follow_id)
);

-- ================================================
-- COMMENTS
-- ================================================

CREATE TABLE IF NOT EXISTS article_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES article_comments(id) ON DELETE CASCADE,

    -- Comment content
    content TEXT NOT NULL,

    -- Engagement
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,

    -- Moderation
    status TEXT DEFAULT 'published' CHECK (status IN ('published', 'pending', 'flagged', 'deleted')),
    flagged_reason TEXT,
    moderated_by TEXT REFERENCES users(id),
    moderated_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comment_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL REFERENCES article_comments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(comment_id, user_id)
);

-- ================================================
-- ANALYTICS
-- ================================================

CREATE TABLE IF NOT EXISTS article_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reading_time INTEGER,
    scroll_depth INTEGER
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    event_data JSON,

    -- User context
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    session_id TEXT,

    -- Content context
    article_id INTEGER REFERENCES articles(id) ON DELETE SET NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,

    -- Technical context
    ip_address TEXT,
    user_agent TEXT,
    referer TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_resolution TEXT,

    -- Location context
    country TEXT,
    city TEXT,
    timezone TEXT,

    -- Performance metrics
    page_load_time INTEGER,
    time_on_page INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS search_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    category_filter TEXT,
    results_count INTEGER DEFAULT 0,
    clicked_result_id INTEGER REFERENCES articles(id),
    session_id TEXT,
    ip_hash TEXT,
    user_agent_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- AI PROCESSING
-- ================================================

CREATE TABLE IF NOT EXISTS ai_processing_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,

    -- Processing stage
    stage TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),

    -- AI model information
    model TEXT,
    prompt_tokens INTEGER,
    response_tokens INTEGER,

    -- Processing results
    input_data TEXT,
    output_data TEXT,
    error_message TEXT,
    confidence_score REAL,

    -- Timing
    processing_time INTEGER,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_extraction_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    source_id TEXT REFERENCES news_sources(id),
    extraction_type TEXT NOT NULL CHECK (extraction_type IN ('rss', 'scrape', 'manual')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),

    -- Content extraction results
    extracted_title TEXT,
    extracted_content TEXT,
    extracted_author TEXT,
    extracted_image_urls TEXT,
    extracted_publish_date TIMESTAMP,

    -- Quality metrics
    content_length INTEGER,
    image_count INTEGER,
    link_count INTEGER,
    readability_score REAL,

    -- Processing metadata
    processing_time INTEGER,
    error_message TEXT,
    ai_model_used TEXT,
    extraction_confidence REAL DEFAULT 0.0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

    -- Pipeline stage tracking
    stage_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),

    -- Stage processing details
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    processing_time INTEGER,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Stage-specific data
    input_data TEXT,
    output_data TEXT,
    quality_metrics TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(article_id, stage_name)
);

CREATE TABLE IF NOT EXISTS quality_factors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

    -- Content quality factors
    has_author BOOLEAN DEFAULT false,
    has_publication_date BOOLEAN DEFAULT false,
    has_featured_image BOOLEAN DEFAULT false,
    content_completeness REAL DEFAULT 0.0,
    grammar_score REAL DEFAULT 0.0,
    readability_score REAL DEFAULT 0.0,
    factual_accuracy_score REAL DEFAULT 0.0,
    source_citations INTEGER DEFAULT 0,

    -- Engagement prediction factors
    headline_quality REAL DEFAULT 0.0,
    topic_relevance REAL DEFAULT 0.0,
    timeliness_score REAL DEFAULT 0.0,
    controversy_score REAL DEFAULT 0.0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_classifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,

    -- Content type classification
    content_type TEXT NOT NULL,
    content_subtype TEXT,
    urgency_level TEXT DEFAULT 'standard' CHECK (urgency_level IN ('breaking', 'urgent', 'standard', 'archive')),

    -- Geographic relevance
    geographic_scope TEXT DEFAULT 'national' CHECK (geographic_scope IN ('local', 'national', 'regional', 'international')),
    locations TEXT,

    -- Audience targeting
    target_audience TEXT DEFAULT 'general',
    reading_level TEXT DEFAULT 'standard' CHECK (reading_level IN ('basic', 'standard', 'advanced')),

    -- AI confidence scores
    classification_confidence REAL DEFAULT 0.0,
    ai_model_version TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- SYSTEM CONFIGURATION AND CACHE
-- ================================================

CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cache_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT NOT NULL UNIQUE,
    cache_type TEXT NOT NULL,
    data TEXT,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trusted_domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL UNIQUE,
    type TEXT DEFAULT 'image' CHECK (type IN ('image', 'content', 'analytics')),
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- LOGGING AND AUDIT
-- ================================================

CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    message TEXT NOT NULL,
    metadata JSON DEFAULT '{}',
    request_id TEXT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    duration INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('counter', 'gauge', 'histogram', 'timer')),
    tags JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,

    -- Actor information
    actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    actor_ip TEXT,

    -- Change details
    old_values JSON,
    new_values JSON,

    -- Metadata
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    request_id TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cron_execution_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cron_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('started', 'success', 'failed')),
    articles_fetched INTEGER DEFAULT 0,
    articles_processed INTEGER DEFAULT 0,
    errors_encountered INTEGER DEFAULT 0,
    execution_time INTEGER,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- COUNTRIES (Pan-African support)
-- ================================================

CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY NOT NULL,           -- ISO 3166-1 alpha-2 code (e.g., "ZW", "SA", "KE")
    name TEXT NOT NULL,                     -- Full name (e.g., "Zimbabwe")
    code TEXT UNIQUE NOT NULL,              -- Same as id, for clarity
    emoji TEXT,                             -- Flag emoji (e.g., "🇿🇼")

    -- Localization
    language TEXT DEFAULT 'en',             -- Primary language
    timezone TEXT,                          -- Default timezone

    -- Configuration
    enabled BOOLEAN DEFAULT TRUE,           -- Whether country is active
    priority INTEGER DEFAULT 0,             -- Display order (higher = first)

    -- Country-specific settings
    keywords TEXT,                          -- JSON array of country-specific keywords for categorization

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed African countries
INSERT OR IGNORE INTO countries (id, name, code, emoji, language, timezone, enabled, priority) VALUES
    ('ZW', 'Zimbabwe', 'ZW', '🇿🇼', 'en', 'Africa/Harare', 1, 100),
    ('ZA', 'South Africa', 'ZA', '🇿🇦', 'en', 'Africa/Johannesburg', 1, 90),
    ('KE', 'Kenya', 'KE', '🇰🇪', 'en', 'Africa/Nairobi', 1, 85),
    ('NG', 'Nigeria', 'NG', '🇳🇬', 'en', 'Africa/Lagos', 1, 80),
    ('GH', 'Ghana', 'GH', '🇬🇭', 'en', 'Africa/Accra', 1, 75),
    ('TZ', 'Tanzania', 'TZ', '🇹🇿', 'en', 'Africa/Dar_es_Salaam', 1, 70),
    ('UG', 'Uganda', 'UG', '🇺🇬', 'en', 'Africa/Kampala', 1, 65),
    ('RW', 'Rwanda', 'RW', '🇷🇼', 'en', 'Africa/Kigali', 1, 60),
    ('ZM', 'Zambia', 'ZM', '🇿🇲', 'en', 'Africa/Lusaka', 1, 55),
    ('BW', 'Botswana', 'BW', '🇧🇼', 'en', 'Africa/Gaborone', 1, 50),
    ('MW', 'Malawi', 'MW', '🇲🇼', 'en', 'Africa/Blantyre', 1, 45),
    ('MZ', 'Mozambique', 'MZ', '🇲🇿', 'pt', 'Africa/Maputo', 1, 40),
    ('NA', 'Namibia', 'NA', '🇳🇦', 'en', 'Africa/Windhoek', 1, 35),
    ('ET', 'Ethiopia', 'ET', '🇪🇹', 'am', 'Africa/Addis_Ababa', 1, 30),
    ('EG', 'Egypt', 'EG', '🇪🇬', 'ar', 'Africa/Cairo', 1, 25),
    ('MA', 'Morocco', 'MA', '🇲🇦', 'ar', 'Africa/Casablanca', 1, 20);

-- User country preferences (which countries a user wants news from)
CREATE TABLE IF NOT EXISTS user_country_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    country_id TEXT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,

    -- Preference settings
    is_primary BOOLEAN DEFAULT FALSE,       -- User's primary/home country
    priority INTEGER DEFAULT 0,             -- Order preference (higher = more prominent)
    notify_breaking BOOLEAN DEFAULT TRUE,   -- Notify on breaking news from this country

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, country_id)
);

-- Country-specific keywords for content categorization
CREATE TABLE IF NOT EXISTS country_keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country_id TEXT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id),

    -- Keyword configuration
    priority INTEGER DEFAULT 0,             -- Higher priority = stronger match
    keyword_type TEXT DEFAULT 'general' CHECK (keyword_type IN ('general', 'politics', 'sports', 'business', 'location', 'person', 'organization')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(country_id, keyword, category_id)
);

-- ================================================
-- INDEXES
-- ================================================

-- Countries
CREATE INDEX IF NOT EXISTS idx_countries_enabled ON countries(enabled);
CREATE INDEX IF NOT EXISTS idx_countries_priority ON countries(priority DESC);

-- User country preferences
CREATE INDEX IF NOT EXISTS idx_user_country_preferences_user ON user_country_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_country_preferences_country ON user_country_preferences(country_id);
CREATE INDEX IF NOT EXISTS idx_user_country_preferences_primary ON user_country_preferences(user_id, is_primary);

-- Country keywords
CREATE INDEX IF NOT EXISTS idx_country_keywords_country ON country_keywords(country_id);
CREATE INDEX IF NOT EXISTS idx_country_keywords_keyword ON country_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_country_keywords_category ON country_keywords(category_id);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Articles
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_priority ON articles(priority DESC);
CREATE INDEX IF NOT EXISTS idx_articles_rss_guid ON articles(rss_guid);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_byline ON articles(byline);
CREATE INDEX IF NOT EXISTS idx_articles_content_type ON articles(content_type);
CREATE INDEX IF NOT EXISTS idx_articles_trending_score ON articles(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_reading_time ON articles(reading_time);
-- Country-based queries (Pan-African support)
CREATE INDEX IF NOT EXISTS idx_articles_country ON articles(country_id);
CREATE INDEX IF NOT EXISTS idx_articles_country_published ON articles(country_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_country_category ON articles(country_id, category_id);

-- Authors
CREATE INDEX IF NOT EXISTS idx_authors_normalized_name ON authors(normalized_name);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);
CREATE INDEX IF NOT EXISTS idx_authors_outlet ON authors(outlet);
CREATE INDEX IF NOT EXISTS idx_authors_verification ON authors(verification_status);
CREATE INDEX IF NOT EXISTS idx_authors_article_count ON authors(article_count DESC);
CREATE INDEX IF NOT EXISTS idx_article_authors_article ON article_authors(article_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_author ON article_authors(author_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_contribution ON article_authors(contribution_type);

-- User engagement
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_article_id ON user_bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_article_id ON user_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_user_id ON user_reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_article_id ON user_reading_history(article_id);

-- Comments
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_user_id ON article_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_parent_id ON article_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_created_at ON article_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_comments_status ON article_comments(status);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Follows
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_type ON user_follows(follow_type);
CREATE INDEX IF NOT EXISTS idx_user_follows_follow_id ON user_follows(follow_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_composite ON user_follows(user_id, follow_type);

-- Categories and sources
CREATE INDEX IF NOT EXISTS idx_categories_enabled ON categories(enabled);
CREATE INDEX IF NOT EXISTS idx_news_sources_enabled ON news_sources(enabled);
CREATE INDEX IF NOT EXISTS idx_news_sources_category_id ON news_sources(category_id);
CREATE INDEX IF NOT EXISTS idx_news_sources_country ON news_sources(country_id);
CREATE INDEX IF NOT EXISTS idx_rss_sources_enabled ON rss_sources(enabled);
CREATE INDEX IF NOT EXISTS idx_rss_sources_country ON rss_sources(country_id);

-- Keywords
CREATE INDEX IF NOT EXISTS idx_keywords_name ON keywords(name);
CREATE INDEX IF NOT EXISTS idx_keywords_slug ON keywords(slug);
CREATE INDEX IF NOT EXISTS idx_akl_article ON article_keyword_links(article_id);
CREATE INDEX IF NOT EXISTS idx_akl_keyword ON article_keyword_links(keyword_id);
CREATE INDEX IF NOT EXISTS idx_article_keywords_article ON article_keywords(article_id);
CREATE INDEX IF NOT EXISTS idx_article_keywords_keyword ON article_keywords(keyword);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_article_id ON analytics_events(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Search logs
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs(query);
CREATE INDEX IF NOT EXISTS idx_search_logs_session_id ON search_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs(created_at);

-- AI processing
CREATE INDEX IF NOT EXISTS idx_ai_processing_log_article ON ai_processing_log(article_id);
CREATE INDEX IF NOT EXISTS idx_ai_processing_log_stage ON ai_processing_log(stage);
CREATE INDEX IF NOT EXISTS idx_ai_processing_log_status ON ai_processing_log(status);
CREATE INDEX IF NOT EXISTS idx_extraction_log_article ON content_extraction_log(article_id);
CREATE INDEX IF NOT EXISTS idx_extraction_log_status ON content_extraction_log(status);
CREATE INDEX IF NOT EXISTS idx_extraction_log_type ON content_extraction_log(extraction_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_article ON pipeline_stages(article_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_status ON pipeline_stages(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_name ON pipeline_stages(stage_name);
CREATE INDEX IF NOT EXISTS idx_quality_factors_article ON quality_factors(article_id);
CREATE INDEX IF NOT EXISTS idx_article_classifications_article ON article_classifications(article_id);
CREATE INDEX IF NOT EXISTS idx_article_classifications_type ON article_classifications(content_type);

-- Cache and system
CREATE INDEX IF NOT EXISTS idx_cache_metadata_key ON cache_metadata(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_metadata_type ON cache_metadata(cache_type);
CREATE INDEX IF NOT EXISTS idx_cache_metadata_expires ON cache_metadata(expires_at);
CREATE INDEX IF NOT EXISTS idx_feed_status_source_id ON feed_status(source_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_user_id ON audit_log(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_cron_execution_log_type ON cron_execution_log(cron_type);
CREATE INDEX IF NOT EXISTS idx_cron_execution_log_status ON cron_execution_log(status);
