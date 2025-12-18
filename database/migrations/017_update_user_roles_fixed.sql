-- Migration 017 (Fixed): Update User Roles
-- Changes roles from (creator, business-creator, moderator, admin, super_admin)
-- to (admin, moderator, support, author, user)
--
-- This version matches the actual database schema (no password_hash, user_number, etc.)

-- =============================================================================
-- MIGRATE EXISTING ROLES
-- =============================================================================

-- Map old roles to new roles:
-- super_admin -> admin
-- admin -> admin
-- moderator -> moderator
-- creator -> user
-- business-creator -> author

UPDATE users SET role = 'admin' WHERE role = 'super_admin';
UPDATE users SET role = 'author' WHERE role = 'business-creator';
UPDATE users SET role = 'user' WHERE role = 'creator';

-- =============================================================================
-- CREATE NEW USERS TABLE WITH UPDATED CONSTRAINT
-- =============================================================================

-- SQLite doesn't support modifying CHECK constraints, so we need to recreate the table
CREATE TABLE IF NOT EXISTS users_new (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,

    -- Profile information
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,

    -- Role management (UPDATED)
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'support', 'author', 'user')),

    -- Account status
    email_verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

    -- Activity tracking
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,

    -- Preferences
    preferences JSON DEFAULT '{}',
    analytics_consent BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Mobile (from migration 016)
    mobile_number TEXT,
    mobile_verified BOOLEAN DEFAULT FALSE,
    mobile_country_code TEXT,

    -- Web3 (from migration 016)
    primary_wallet_address TEXT,
    primary_chain_id INTEGER,
    preferred_auth_provider TEXT
);

-- Copy data from old table (only existing columns)
INSERT INTO users_new (
    id, email, username,
    display_name, avatar_url, bio,
    role,
    email_verified, status,
    last_login_at, login_count,
    preferences, analytics_consent,
    created_at, updated_at,
    mobile_number, mobile_verified, mobile_country_code,
    primary_wallet_address, primary_chain_id, preferred_auth_provider
)
SELECT
    id, email, username,
    display_name, avatar_url, bio,
    role,
    email_verified, status,
    last_login_at, login_count,
    preferences, analytics_consent,
    created_at, updated_at,
    mobile_number, mobile_verified, mobile_country_code,
    primary_wallet_address, primary_chain_id, preferred_auth_provider
FROM users;

-- Drop old table and rename
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
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
    permissions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO role_definitions (role, level, display_name, description, permissions) VALUES
('admin', 100, 'Administrator', 'Full system access', '["*"]'),
('moderator', 75, 'Moderator', 'Content moderation, user management', '["moderate:content", "moderate:comments", "manage:users.warn", "view:reports"]'),
('support', 50, 'Support', 'Customer support, limited admin access', '["support:tickets", "view:users", "view:content", "manage:comments"]'),
('author', 25, 'Author', 'Content creation, manage own articles', '["create:articles", "edit:own.articles", "view:own.analytics", "manage:own.profile"]'),
('user', 10, 'User', 'Basic access - read, comment, like, bookmark', '["read:content", "create:comments", "like:content", "bookmark:content", "manage:own.profile"]');

-- =============================================================================
-- AUDIT LOG FOR ROLE CHANGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS role_change_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    old_role TEXT,
    new_role TEXT NOT NULL,
    changed_by TEXT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_role_change_user ON role_change_log(user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_date ON role_change_log(created_at);

-- Log the migration
INSERT INTO role_change_log (user_id, old_role, new_role, reason)
SELECT id, 'creator', role, 'Migration 017: Role system update to OIDC-compatible roles'
FROM users;
