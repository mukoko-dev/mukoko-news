-- Migration 018: Auth Settings
-- Configurable authentication requirements per role
-- Allows admin to enable/disable auth during OIDC migration

-- Auth settings table for role-based authentication configuration
CREATE TABLE IF NOT EXISTS auth_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL UNIQUE CHECK (role IN ('admin', 'moderator', 'support', 'author', 'user')),
    auth_required BOOLEAN NOT NULL DEFAULT FALSE,
    locked BOOLEAN NOT NULL DEFAULT FALSE,  -- If true, setting cannot be changed (e.g., admin always requires auth)
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by TEXT,  -- User ID who last changed this setting
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_auth_settings_role ON auth_settings(role);

-- Seed default auth settings
-- Admin is locked (always requires auth), others disabled during OIDC migration
INSERT OR REPLACE INTO auth_settings (role, auth_required, locked, updated_at) VALUES
    ('admin', TRUE, TRUE, datetime('now')),      -- LOCKED: Admin always requires authentication
    ('moderator', FALSE, FALSE, datetime('now')), -- Disabled during migration
    ('support', FALSE, FALSE, datetime('now')),   -- Disabled during migration
    ('author', FALSE, FALSE, datetime('now')),    -- Disabled during migration
    ('user', FALSE, FALSE, datetime('now'));      -- Disabled during migration

-- Auth settings change log for audit trail
CREATE TABLE IF NOT EXISTS auth_settings_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    auth_required_old BOOLEAN,
    auth_required_new BOOLEAN NOT NULL,
    changed_by TEXT,
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    reason TEXT,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_auth_settings_log_role ON auth_settings_log(role);
CREATE INDEX IF NOT EXISTS idx_auth_settings_log_changed_at ON auth_settings_log(changed_at);
