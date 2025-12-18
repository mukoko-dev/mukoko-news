-- Migration: Fix user_id column type consistency
-- Changes user_id from INTEGER to TEXT in social feature tables to match users table schema
-- users.id is TEXT (UUID format), so all foreign keys should be TEXT

-- ===== FIX user_author_follows TABLE =====

-- Create new table with correct type
CREATE TABLE IF NOT EXISTS user_author_follows_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,  -- Changed from INTEGER to TEXT
    author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_preferences TEXT DEFAULT 'all',

    UNIQUE(user_id, author_id)
);

-- Copy existing data (cast INTEGER to TEXT)
INSERT OR IGNORE INTO user_author_follows_new (id, user_id, author_id, followed_at, notification_preferences)
SELECT id, CAST(user_id AS TEXT), author_id, followed_at, notification_preferences
FROM user_author_follows;

-- Drop old table and rename new one
DROP TABLE IF EXISTS user_author_follows;
ALTER TABLE user_author_follows_new RENAME TO user_author_follows;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_user_author_follows_user ON user_author_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_author_follows_author ON user_author_follows(author_id);

-- ===== FIX user_source_follows TABLE =====

-- Create new table with correct type
CREATE TABLE IF NOT EXISTS user_source_follows_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,  -- Changed from INTEGER to TEXT
    source_id TEXT NOT NULL,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_preferences TEXT DEFAULT 'all',

    UNIQUE(user_id, source_id)
);

-- Copy existing data
INSERT OR IGNORE INTO user_source_follows_new (id, user_id, source_id, followed_at, notification_preferences)
SELECT id, CAST(user_id AS TEXT), source_id, followed_at, notification_preferences
FROM user_source_follows;

-- Drop old table and rename new one
DROP TABLE IF EXISTS user_source_follows;
ALTER TABLE user_source_follows_new RENAME TO user_source_follows;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_user_source_follows_user ON user_source_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_source_follows_source ON user_source_follows(source_id);

-- ===== FIX author_profile_interactions TABLE =====

-- Create new table with correct type
CREATE TABLE IF NOT EXISTS author_profile_interactions_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    user_id TEXT,  -- Changed from INTEGER to TEXT, nullable for anonymous
    interaction_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Copy existing data
INSERT OR IGNORE INTO author_profile_interactions_new (id, author_id, user_id, interaction_type, ip_address, user_agent, referrer, created_at)
SELECT id, author_id, CAST(user_id AS TEXT), interaction_type, ip_address, user_agent, referrer, created_at
FROM author_profile_interactions;

-- Drop old table and rename new one
DROP TABLE IF EXISTS author_profile_interactions;
ALTER TABLE author_profile_interactions_new RENAME TO author_profile_interactions;

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_author_profile_interactions_author ON author_profile_interactions(author_id);
CREATE INDEX IF NOT EXISTS idx_author_profile_interactions_user ON author_profile_interactions(user_id);

-- ===== RECREATE TRIGGERS WITH TEXT USER_ID =====

-- Drop old triggers if they exist
DROP TRIGGER IF EXISTS update_author_follower_count_on_follow;
DROP TRIGGER IF EXISTS update_author_follower_count_on_unfollow;
DROP TRIGGER IF EXISTS update_source_follower_count_on_follow;
DROP TRIGGER IF EXISTS update_source_follower_count_on_unfollow;

-- Recreate follower count triggers
CREATE TRIGGER IF NOT EXISTS update_author_follower_count_on_follow
    AFTER INSERT ON user_author_follows
    FOR EACH ROW
    BEGIN
        UPDATE authors
        SET follower_count = follower_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.author_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_author_follower_count_on_unfollow
    AFTER DELETE ON user_author_follows
    FOR EACH ROW
    BEGIN
        UPDATE authors
        SET follower_count = CASE WHEN follower_count > 0 THEN follower_count - 1 ELSE 0 END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.author_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_source_follower_count_on_follow
    AFTER INSERT ON user_source_follows
    FOR EACH ROW
    BEGIN
        UPDATE news_sources
        SET follower_count = follower_count + 1
        WHERE id = NEW.source_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_source_follower_count_on_unfollow
    AFTER DELETE ON user_source_follows
    FOR EACH ROW
    BEGIN
        UPDATE news_sources
        SET follower_count = CASE WHEN follower_count > 0 THEN follower_count - 1 ELSE 0 END
        WHERE id = OLD.source_id;
    END;
