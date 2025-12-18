-- Migration 017: Update User Roles
-- Changes roles from (creator, business-creator, moderator, admin, super_admin)
-- to (admin, moderator, support, author, user)
--
-- Role Hierarchy:
-- admin (100)     - Full system access
-- moderator (75)  - Content moderation, user management
-- support (50)    - Customer support, limited admin access
-- author (25)     - Content creation, own content management
-- user (10)       - Basic user access (default)

-- =============================================================================
-- MIGRATE EXISTING ROLES
-- =============================================================================

-- Map old roles to new roles:
-- super_admin -> admin
-- admin -> admin
-- moderator -> moderator
-- creator -> user (or author if they have content)
-- business-creator -> author

-- First, update super_admin to admin
UPDATE users SET role = 'admin' WHERE role = 'super_admin';

-- Update business-creator to author
UPDATE users SET role = 'author' WHERE role = 'business-creator';

-- Update creator to user (default)
-- Note: Creators who have written articles will be upgraded to author later
UPDATE users SET role = 'user' WHERE role = 'creator';

-- Upgrade users who have authored articles to 'author' role
UPDATE users
SET role = 'author'
WHERE id IN (
    SELECT DISTINCT u.id
    FROM users u
    INNER JOIN articles a ON a.author = u.display_name OR a.author = u.username
    WHERE u.role = 'user'
);

-- =============================================================================
-- CREATE NEW USERS TABLE WITH UPDATED CONSTRAINT
-- =============================================================================

-- SQLite doesn't support modifying CHECK constraints, so we need to recreate the table
-- This is done carefully to preserve all data

CREATE TABLE IF NOT EXISTS users_new (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password_hash TEXT,

    -- Profile information
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,

    -- User identifiers
    user_number TEXT UNIQUE,
    user_uid TEXT UNIQUE,

    -- Mobile authentication
    mobile_number TEXT,
    mobile_verified BOOLEAN DEFAULT FALSE,
    mobile_country_code TEXT,

    -- Web3 authentication
    primary_wallet_address TEXT,
    primary_chain_id INTEGER,

    -- Auth preferences
    preferred_auth_provider TEXT,

    -- Role management (UPDATED)
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'support', 'author', 'user')),

    -- Account status
    email_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

    -- Account lockout (security)
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TEXT DEFAULT NULL,

    -- Activity tracking
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table
INSERT INTO users_new
SELECT
    id, email, username, password_hash,
    display_name, avatar_url, bio,
    user_number, user_uid,
    mobile_number, mobile_verified, mobile_country_code,
    primary_wallet_address, primary_chain_id,
    preferred_auth_provider,
    role,
    email_verified, status,
    failed_login_attempts, account_locked_until,
    last_login_at, login_count,
    created_at, updated_at
FROM users;

-- Drop old table and rename
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_number ON users(user_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_uid ON users(user_uid);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(primary_wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- =============================================================================
-- ROLE DESCRIPTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS role_definitions (
    role TEXT PRIMARY KEY,
    level INTEGER NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions TEXT,  -- JSON array of permission strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO role_definitions (role, level, display_name, description, permissions) VALUES
('admin', 100, 'Administrator', 'Full system access including user management, content management, and system configuration', '["*"]'),
('moderator', 75, 'Moderator', 'Content moderation, user warnings, comment management', '["moderate:content", "moderate:comments", "manage:users.warn", "view:reports"]'),
('support', 50, 'Support', 'Customer support, view user issues, limited content management', '["support:tickets", "view:users", "view:content", "manage:comments"]'),
('author', 25, 'Author', 'Content creation, manage own articles, view analytics for own content', '["create:articles", "edit:own.articles", "view:own.analytics", "manage:own.profile"]'),
('user', 10, 'User', 'Basic access - read content, comment, like, bookmark', '["read:content", "create:comments", "like:content", "bookmark:content", "manage:own.profile"]');

-- =============================================================================
-- UPDATE ADMIN ENVIRONMENT VARIABLES REFERENCE
-- =============================================================================

-- Note: Update wrangler.jsonc ADMIN_ROLES from "admin,super_admin,moderator"
-- to "admin,moderator,support"

-- =============================================================================
-- AUDIT LOG FOR ROLE CHANGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS role_change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id),
    old_role TEXT,
    new_role TEXT NOT NULL,
    changed_by TEXT REFERENCES users(id),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_role_change_user ON role_change_log(user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_date ON role_change_log(created_at);

-- Log the migration changes
INSERT INTO role_change_log (user_id, old_role, new_role, reason)
SELECT id,
       CASE
           WHEN role = 'admin' AND EXISTS (SELECT 1 FROM users WHERE role = 'super_admin') THEN 'super_admin'
           WHEN role = 'author' THEN 'business-creator'
           WHEN role = 'user' THEN 'creator'
           ELSE role
       END,
       role,
       'Migration 017: Role system update'
FROM users;
