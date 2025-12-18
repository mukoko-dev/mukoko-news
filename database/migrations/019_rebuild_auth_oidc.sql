-- Migration 019: Full Auth Rebuild for OIDC
-- Drops legacy auth tables and recreates with OIDC/Web3 standards
-- This is a breaking change - existing user sessions will be invalidated

-- ================================================
-- DROP VIEWS AND LEGACY TABLES
-- ================================================

-- Drop ALL views first (they depend on tables we're modifying)
DROP VIEW IF EXISTS user_auth_summary;
DROP VIEW IF EXISTS active_mobile_verifications;
DROP VIEW IF EXISTS user_profile_view;
DROP VIEW IF EXISTS admin_users_view;

DROP TABLE IF EXISTS auth_settings_log;
DROP TABLE IF EXISTS auth_settings;
DROP TABLE IF EXISTS role_definitions;
DROP TABLE IF EXISTS role_change_log;
DROP TABLE IF EXISTS auth_provider_config;
DROP TABLE IF EXISTS user_auth_providers;
DROP TABLE IF EXISTS mobile_verification_log;
DROP TABLE IF EXISTS web3_signature_log;
DROP TABLE IF EXISTS oidc_session_log;
DROP TABLE IF EXISTS user_sessions;

-- ================================================
-- BACKUP AND RECREATE USERS TABLE
-- ================================================

-- Create new users table with OIDC standard claims
CREATE TABLE IF NOT EXISTS users_new (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),

    -- OIDC Standard Claims
    sub TEXT UNIQUE,
    email TEXT UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    name TEXT,
    given_name TEXT,
    family_name TEXT,
    picture TEXT,
    phone_number TEXT,
    phone_number_verified BOOLEAN DEFAULT FALSE,

    -- Platform-specific
    username TEXT UNIQUE,
    bio TEXT,
    locale TEXT DEFAULT 'en',
    zoneinfo TEXT,

    -- RBAC
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'support', 'author', 'user')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),

    -- Activity
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    preferences JSON DEFAULT '{}',
    analytics_consent BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Migrate existing user data
INSERT INTO users_new (
    id, email, email_verified, name, username, bio,
    role, status, last_login_at, login_count, preferences,
    analytics_consent, created_at, updated_at
)
SELECT
    id, email, email_verified,
    COALESCE(display_name, username) as name,
    username, bio,
    CASE
        WHEN role IN ('admin', 'moderator', 'support', 'author', 'user') THEN role
        WHEN role = 'super_admin' THEN 'admin'
        WHEN role = 'creator' THEN 'user'
        WHEN role = 'business-creator' THEN 'author'
        ELSE 'user'
    END as role,
    COALESCE(status, 'active') as status,
    last_login_at,
    COALESCE(login_count, 0) as login_count,
    COALESCE(preferences, '{}') as preferences,
    COALESCE(analytics_consent, TRUE) as analytics_consent,
    created_at, updated_at
FROM users;

-- Drop old table and rename
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- ================================================
-- AUTH PROVIDERS (Multi-provider identity)
-- ================================================

CREATE TABLE user_auth_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('oidc', 'mobile', 'web3')),
    provider_name TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    last_used_at TIMESTAMP,

    -- OIDC
    oidc_subject TEXT,
    oidc_issuer TEXT,

    -- Mobile (E.164)
    mobile_number TEXT,
    mobile_country_code TEXT,
    mobile_verified BOOLEAN DEFAULT FALSE,

    -- Web3 (EIP-55/EIP-155)
    wallet_address TEXT,
    chain_id INTEGER,
    ens_name TEXT,

    metadata JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- AUTH PROVIDER CONFIG
-- ================================================

CREATE TABLE auth_provider_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('oidc', 'mobile', 'web3')),
    provider_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    config JSON DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO auth_provider_config (provider_type, provider_name, display_name, enabled, config) VALUES
    ('oidc', 'mukoko', 'Mukoko ID', TRUE, '{"issuer": "https://id.mukoko.com"}'),
    ('oidc', 'google', 'Google', FALSE, '{"issuer": "https://accounts.google.com"}'),
    ('oidc', 'apple', 'Apple', FALSE, '{"issuer": "https://appleid.apple.com"}'),
    ('mobile', 'sms', 'SMS Verification', TRUE, '{"countries": ["ZW", "ZA", "KE", "NG"]}'),
    ('web3', 'ethereum', 'Ethereum', TRUE, '{"chainIds": [1, 137, 8453]}');

-- ================================================
-- ROLE DEFINITIONS (RBAC)
-- ================================================

CREATE TABLE role_definitions (
    role TEXT PRIMARY KEY,
    level INTEGER NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSON DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO role_definitions (role, level, display_name, description, permissions) VALUES
    ('admin', 100, 'Administrator', 'Full system access', '["*"]'),
    ('moderator', 75, 'Moderator', 'Content moderation', '["moderate:*", "view:*"]'),
    ('support', 50, 'Support', 'Customer support', '["support:*", "view:users"]'),
    ('author', 25, 'Author', 'Content creation', '["create:articles", "edit:own"]'),
    ('user', 10, 'User', 'Basic access', '["read:*", "create:comments"]');

-- ================================================
-- AUTH SETTINGS (Per-role auth toggle)
-- ================================================

CREATE TABLE auth_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL UNIQUE CHECK (role IN ('admin', 'moderator', 'support', 'author', 'user')),
    auth_required BOOLEAN NOT NULL DEFAULT FALSE,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE auth_settings_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    auth_required_old BOOLEAN,
    auth_required_new BOOLEAN NOT NULL,
    changed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    reason TEXT
);

INSERT INTO auth_settings (role, auth_required, locked) VALUES
    ('admin', TRUE, TRUE),
    ('moderator', FALSE, FALSE),
    ('support', FALSE, FALSE),
    ('author', FALSE, FALSE),
    ('user', FALSE, FALSE);

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_users_sub ON users(sub);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_auth_providers_user ON user_auth_providers(user_id);
CREATE INDEX idx_auth_providers_oidc ON user_auth_providers(oidc_subject, oidc_issuer);
CREATE INDEX idx_auth_providers_mobile ON user_auth_providers(mobile_number);
CREATE INDEX idx_auth_providers_wallet ON user_auth_providers(wallet_address, chain_id);

CREATE INDEX idx_auth_settings_role ON auth_settings(role);
CREATE INDEX idx_auth_settings_log_role ON auth_settings_log(role);
