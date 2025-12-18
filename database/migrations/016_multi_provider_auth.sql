-- Migration 016: Multi-Provider Authentication System
-- Supports OIDC (Google, Apple, etc.), Web3 (Ethereum, etc.), and Mobile (SMS/WhatsApp)
-- Designed for African markets where mobile-first is essential

-- =============================================================================
-- USER AUTHENTICATION PROVIDERS TABLE
-- =============================================================================
-- Links users to multiple authentication methods (OIDC, Web3, Mobile, Email)

CREATE TABLE IF NOT EXISTS user_auth_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Provider identification
    provider_type TEXT NOT NULL CHECK (provider_type IN ('oidc', 'web3', 'mobile', 'email')),
    provider_name TEXT NOT NULL,  -- 'google', 'apple', 'ethereum', 'mpesa', 'whatsapp', 'local'

    -- ========== OIDC Fields (OpenID Connect) ==========
    oidc_subject TEXT,            -- The 'sub' claim (unique user ID from provider)
    oidc_issuer TEXT,             -- The 'iss' claim (provider URL)
    oidc_access_token TEXT,       -- Encrypted access token (for API calls)
    oidc_refresh_token TEXT,      -- Encrypted refresh token
    oidc_token_expires_at TIMESTAMP,
    oidc_id_token TEXT,           -- The ID token (JWT)
    oidc_scopes TEXT,             -- Granted scopes (comma-separated)

    -- ========== Web3 Fields ==========
    wallet_address TEXT,          -- 0x... Ethereum address or equivalent
    chain_id INTEGER,             -- Network ID (1=Ethereum, 137=Polygon, etc.)
    wallet_type TEXT,             -- 'metamask', 'walletconnect', 'coinbase', etc.
    ens_name TEXT,                -- ENS domain (vitalik.eth)
    signature_nonce TEXT,         -- Current nonce for signature verification
    last_signature_at TIMESTAMP,  -- When last signature was verified

    -- ========== Mobile Fields (Africa-first) ==========
    mobile_number TEXT,           -- E.164 format (+263771234567)
    mobile_country_code TEXT,     -- ISO country code (ZW, KE, NG, ZA, etc.)
    mobile_carrier TEXT,          -- Carrier name if detected (Econet, Safaricom, MTN)
    mobile_verified BOOLEAN DEFAULT FALSE,
    mobile_verification_code TEXT, -- Hashed OTP code
    mobile_verification_expires TIMESTAMP,
    mobile_verification_attempts INTEGER DEFAULT 0,
    mobile_last_otp_sent TIMESTAMP,

    -- WhatsApp-specific (popular in Africa)
    whatsapp_enabled BOOLEAN DEFAULT FALSE,
    whatsapp_verified BOOLEAN DEFAULT FALSE,

    -- USSD support (for feature phones)
    ussd_pin_hash TEXT,           -- For USSD authentication
    ussd_session_id TEXT,

    -- ========== Common Fields ==========
    is_primary BOOLEAN DEFAULT FALSE,  -- Primary authentication method
    verified_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    device_fingerprint TEXT,      -- Device identification
    ip_address TEXT,              -- Last known IP
    user_agent TEXT,              -- Last known user agent
    metadata TEXT,                -- JSON for provider-specific data

    -- Constraints
    UNIQUE(provider_type, provider_name, oidc_subject),
    UNIQUE(wallet_address, chain_id),
    UNIQUE(mobile_number)
);

-- =============================================================================
-- MOBILE VERIFICATION LOG (Audit trail for OTP)
-- =============================================================================

CREATE TABLE IF NOT EXISTS mobile_verification_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    mobile_number TEXT NOT NULL,
    country_code TEXT,

    -- Verification details
    verification_type TEXT NOT NULL CHECK (verification_type IN ('sms', 'whatsapp', 'ussd', 'voice')),
    verification_code_hash TEXT,  -- Hashed OTP

    -- Status tracking
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'verified', 'expired', 'failed')),
    attempts INTEGER DEFAULT 0,

    -- Provider info
    sms_provider TEXT,            -- 'twilio', 'africas_talking', 'infobip', etc.
    provider_message_id TEXT,     -- External reference ID

    -- Timestamps
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP,

    -- Cost tracking (important for African markets)
    cost_amount DECIMAL(10,4),
    cost_currency TEXT DEFAULT 'USD',

    -- Error handling
    error_code TEXT,
    error_message TEXT,

    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    device_info TEXT
);

-- =============================================================================
-- WEB3 SIGNATURE LOG (For wallet authentication)
-- =============================================================================

CREATE TABLE IF NOT EXISTS web3_signature_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    wallet_address TEXT NOT NULL,
    chain_id INTEGER,

    -- Signature details
    message TEXT NOT NULL,        -- The message that was signed
    signature TEXT NOT NULL,      -- The signature
    nonce TEXT NOT NULL,          -- Nonce used

    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,

    -- Context
    action TEXT,                  -- 'login', 'link_wallet', 'transaction', etc.
    ip_address TEXT,
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- OIDC SESSION LOG (For OAuth flows)
-- =============================================================================

CREATE TABLE IF NOT EXISTS oidc_session_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    provider_name TEXT NOT NULL,

    -- OAuth flow tracking
    state TEXT NOT NULL,          -- CSRF state parameter
    code_verifier TEXT,           -- PKCE code verifier
    redirect_uri TEXT,

    -- Status
    status TEXT NOT NULL CHECK (status IN ('initiated', 'callback', 'completed', 'failed', 'expired')),

    -- Tokens (encrypted)
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    token_expires_at TIMESTAMP,

    -- Claims received
    claims TEXT,                  -- JSON of received claims

    -- Error handling
    error_code TEXT,
    error_description TEXT,

    -- Timestamps
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,

    -- Context
    ip_address TEXT,
    user_agent TEXT
);

-- =============================================================================
-- SUPPORTED PROVIDERS CONFIGURATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS auth_provider_config (
    id TEXT PRIMARY KEY,          -- 'google', 'apple', 'ethereum', 'mpesa', etc.
    provider_type TEXT NOT NULL,  -- 'oidc', 'web3', 'mobile'
    display_name TEXT NOT NULL,   -- 'Google', 'Apple', 'M-Pesa', etc.

    -- Provider settings (encrypted where sensitive)
    client_id TEXT,
    client_secret TEXT,           -- Encrypted
    issuer_url TEXT,              -- For OIDC discovery
    authorization_url TEXT,
    token_url TEXT,
    userinfo_url TEXT,
    jwks_uri TEXT,
    scopes TEXT,                  -- Default scopes

    -- Mobile provider settings
    api_key TEXT,                 -- Encrypted
    api_secret TEXT,              -- Encrypted
    sender_id TEXT,               -- SMS sender ID

    -- Web3 settings
    chain_ids TEXT,               -- Supported chain IDs (comma-separated)
    rpc_urls TEXT,                -- JSON of chain_id -> RPC URL

    -- Feature flags
    enabled BOOLEAN DEFAULT TRUE,
    available_countries TEXT,     -- JSON array of ISO country codes (null = all)

    -- Display
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ADD FIELDS TO USERS TABLE
-- =============================================================================

-- Add mobile number to users table for quick access
ALTER TABLE users ADD COLUMN mobile_number TEXT;
ALTER TABLE users ADD COLUMN mobile_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN mobile_country_code TEXT;

-- Add wallet address for quick access
ALTER TABLE users ADD COLUMN primary_wallet_address TEXT;
ALTER TABLE users ADD COLUMN primary_chain_id INTEGER;

-- Add provider preference
ALTER TABLE users ADD COLUMN preferred_auth_provider TEXT;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Auth providers indexes
CREATE INDEX IF NOT EXISTS idx_auth_providers_user ON user_auth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_providers_type ON user_auth_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_auth_providers_mobile ON user_auth_providers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_auth_providers_wallet ON user_auth_providers(wallet_address);
CREATE INDEX IF NOT EXISTS idx_auth_providers_oidc ON user_auth_providers(oidc_subject, oidc_issuer);
CREATE INDEX IF NOT EXISTS idx_auth_providers_primary ON user_auth_providers(user_id, is_primary);

-- Mobile verification indexes
CREATE INDEX IF NOT EXISTS idx_mobile_verify_number ON mobile_verification_log(mobile_number);
CREATE INDEX IF NOT EXISTS idx_mobile_verify_user ON mobile_verification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_verify_status ON mobile_verification_log(status, expires_at);

-- Web3 signature indexes
CREATE INDEX IF NOT EXISTS idx_web3_sig_wallet ON web3_signature_log(wallet_address);
CREATE INDEX IF NOT EXISTS idx_web3_sig_user ON web3_signature_log(user_id);

-- OIDC session indexes
CREATE INDEX IF NOT EXISTS idx_oidc_session_state ON oidc_session_log(state);
CREATE INDEX IF NOT EXISTS idx_oidc_session_user ON oidc_session_log(user_id);

-- Users mobile index
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(primary_wallet_address);

-- =============================================================================
-- SEED DEFAULT PROVIDERS
-- =============================================================================

-- OIDC Providers
INSERT OR IGNORE INTO auth_provider_config (id, provider_type, display_name, sort_order) VALUES
('google', 'oidc', 'Google', 1),
('apple', 'oidc', 'Apple', 2),
('microsoft', 'oidc', 'Microsoft', 3),
('facebook', 'oidc', 'Facebook', 4);

-- Web3 Providers
INSERT OR IGNORE INTO auth_provider_config (id, provider_type, display_name, chain_ids, sort_order) VALUES
('ethereum', 'web3', 'Ethereum', '1,5,11155111', 10),
('polygon', 'web3', 'Polygon', '137,80001', 11),
('base', 'web3', 'Base', '8453,84531', 12);

-- Mobile Providers (Africa-focused)
INSERT OR IGNORE INTO auth_provider_config (id, provider_type, display_name, available_countries, sort_order) VALUES
('sms_zw', 'mobile', 'SMS (Zimbabwe)', '["ZW"]', 20),
('sms_ke', 'mobile', 'SMS (Kenya)', '["KE"]', 21),
('sms_ng', 'mobile', 'SMS (Nigeria)', '["NG"]', 22),
('sms_za', 'mobile', 'SMS (South Africa)', '["ZA"]', 23),
('sms_tz', 'mobile', 'SMS (Tanzania)', '["TZ"]', 24),
('sms_ug', 'mobile', 'SMS (Uganda)', '["UG"]', 25),
('sms_gh', 'mobile', 'SMS (Ghana)', '["GH"]', 26),
('sms_rw', 'mobile', 'SMS (Rwanda)', '["RW"]', 27),
('whatsapp', 'mobile', 'WhatsApp', NULL, 30),
('ussd', 'mobile', 'USSD', '["ZW","KE","NG","ZA","TZ","UG","GH","RW"]', 31);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update user's mobile number when verified
CREATE TRIGGER IF NOT EXISTS sync_mobile_to_user
AFTER UPDATE ON user_auth_providers
FOR EACH ROW
WHEN NEW.provider_type = 'mobile' AND NEW.mobile_verified = TRUE AND NEW.is_primary = TRUE
BEGIN
    UPDATE users
    SET mobile_number = NEW.mobile_number,
        mobile_verified = TRUE,
        mobile_country_code = NEW.mobile_country_code,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
END;

-- Update user's wallet when linked as primary
CREATE TRIGGER IF NOT EXISTS sync_wallet_to_user
AFTER UPDATE ON user_auth_providers
FOR EACH ROW
WHEN NEW.provider_type = 'web3' AND NEW.is_primary = TRUE
BEGIN
    UPDATE users
    SET primary_wallet_address = NEW.wallet_address,
        primary_chain_id = NEW.chain_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
END;

-- Update last_used_at when provider is used
CREATE TRIGGER IF NOT EXISTS update_provider_last_used
AFTER UPDATE ON user_auth_providers
FOR EACH ROW
WHEN NEW.last_used_at != OLD.last_used_at OR NEW.last_used_at IS NOT NULL
BEGIN
    UPDATE user_auth_providers
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View: Users with their authentication methods
CREATE VIEW IF NOT EXISTS user_auth_summary AS
SELECT
    u.id,
    u.username,
    u.email,
    u.mobile_number,
    u.mobile_verified,
    u.primary_wallet_address,
    u.preferred_auth_provider,
    (SELECT COUNT(*) FROM user_auth_providers WHERE user_id = u.id) as auth_provider_count,
    (SELECT GROUP_CONCAT(DISTINCT provider_type) FROM user_auth_providers WHERE user_id = u.id) as auth_types,
    (SELECT GROUP_CONCAT(DISTINCT provider_name) FROM user_auth_providers WHERE user_id = u.id) as auth_providers
FROM users u;

-- View: Active mobile verifications (for rate limiting)
CREATE VIEW IF NOT EXISTS active_mobile_verifications AS
SELECT
    mobile_number,
    COUNT(*) as verification_count,
    MAX(sent_at) as last_sent,
    SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified_count
FROM mobile_verification_log
WHERE sent_at > datetime('now', '-24 hours')
GROUP BY mobile_number;
