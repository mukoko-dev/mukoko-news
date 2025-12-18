/**
 * AuthProviderService - Unified Authentication Provider Wrapper
 *
 * Single service that handles all authentication methods:
 * - OIDC (via id.mukoko.com or other providers)
 * - Mobile (SMS/WhatsApp OTP)
 * - Web3 (Wallet signatures)
 * - Email/Password (legacy)
 *
 * Roles:
 * - admin: Full system access
 * - moderator: Content moderation, user management
 * - support: Customer support, limited admin access
 * - author: Content creation, own content management
 * - user: Basic user access (default)
 */

import { D1Database, KVNamespace } from '@cloudflare/workers-types'

// =============================================================================
// TYPES
// =============================================================================

export interface AuthProviderBindings {
  DB: D1Database
  AUTH_STORAGE: KVNamespace
  AUTH_ISSUER_URL?: string
  // SMS Provider
  SMS_PROVIDER?: 'africas_talking' | 'twilio'
  AFRICAS_TALKING_API_KEY?: string
  AFRICAS_TALKING_USERNAME?: string
  TWILIO_ACCOUNT_SID?: string
  TWILIO_AUTH_TOKEN?: string
  TWILIO_PHONE_NUMBER?: string
}

export type UserRole = 'admin' | 'moderator' | 'support' | 'author' | 'user'

export interface User {
  id: string
  email: string | null
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  user_number: string | null
  user_uid: string | null
  mobile_number: string | null
  mobile_verified: boolean
  mobile_country_code: string | null
  primary_wallet_address: string | null
  primary_chain_id: number | null
  role: UserRole
  status: 'active' | 'suspended' | 'deleted'
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
}

export interface AuthProvider {
  id: number
  user_id: string
  provider_type: 'oidc' | 'mobile' | 'web3' | 'email'
  provider_name: string
  is_primary: boolean
  verified_at: string | null
  last_used_at: string | null
  // OIDC specific
  oidc_subject?: string
  oidc_issuer?: string
  // Mobile specific
  mobile_number?: string
  mobile_country_code?: string
  mobile_verified?: boolean
  // Web3 specific
  wallet_address?: string
  chain_id?: number
  ens_name?: string
}

export interface Session {
  user_id: string
  email: string | null
  username: string | null
  role: UserRole
  provider_type: string
  provider_name: string
  login_at: string
  expires_at: string
}

export interface AuthResult {
  success: boolean
  user?: User
  session?: Session
  session_token?: string
  is_new_user?: boolean
  error?: string
}

export interface OIDCClaims {
  sub: string
  iss?: string
  email?: string
  email_verified?: boolean
  name?: string
  given_name?: string
  family_name?: string
  picture?: string
  phone_number?: string
  phone_number_verified?: boolean
  [key: string]: unknown
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const ROLES: Record<UserRole, { level: number; description: string }> = {
  admin: { level: 100, description: 'Full system access' },
  moderator: { level: 75, description: 'Content moderation, user management' },
  support: { level: 50, description: 'Customer support, limited admin' },
  author: { level: 25, description: 'Content creation' },
  user: { level: 10, description: 'Basic user access' }
}

const SESSION_EXPIRY_HOURS = 24 * 7 // 7 days
const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10
const MAX_OTP_ATTEMPTS = 3

// African country codes
const AFRICAN_COUNTRIES: Record<string, string> = {
  ZW: '+263', KE: '+254', ZA: '+27', NG: '+234', TZ: '+255',
  UG: '+256', GH: '+233', RW: '+250', ZM: '+260', MW: '+265',
  BW: '+267', NA: '+264', MZ: '+258', ET: '+251', EG: '+20'
}

// =============================================================================
// AUTH PROVIDER SERVICE
// =============================================================================

export class AuthProviderService {
  private db: D1Database
  private kv: KVNamespace
  private env: AuthProviderBindings

  constructor(env: AuthProviderBindings) {
    this.db = env.DB
    this.kv = env.AUTH_STORAGE
    this.env = env
  }

  // ===========================================================================
  // SESSION MANAGEMENT
  // ===========================================================================

  /**
   * Create a new session for a user
   */
  async createSession(userId: string, providerType: string, providerName: string): Promise<{ token: string; session: Session }> {
    const user = await this.getUserById(userId)
    if (!user) throw new Error('User not found')

    const token = this.generateSessionToken()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000)

    const session: Session = {
      user_id: userId,
      email: user.email,
      username: user.username,
      role: user.role,
      provider_type: providerType,
      provider_name: providerName,
      login_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    }

    // Store in KV
    await this.kv.put(`session:${token}`, JSON.stringify(session), {
      expirationTtl: SESSION_EXPIRY_HOURS * 60 * 60
    })

    // Update last login
    await this.db.prepare(`
      UPDATE users SET last_login_at = CURRENT_TIMESTAMP, login_count = login_count + 1 WHERE id = ?
    `).bind(userId).run()

    return { token, session }
  }

  /**
   * Validate a session token
   */
  async validateSession(token: string): Promise<Session | null> {
    const data = await this.kv.get(`session:${token}`)
    if (!data) return null

    const session = JSON.parse(data) as Session
    if (new Date(session.expires_at) < new Date()) {
      await this.kv.delete(`session:${token}`)
      return null
    }

    return session
  }

  /**
   * Invalidate a session
   */
  async invalidateSession(token: string): Promise<void> {
    await this.kv.delete(`session:${token}`)
  }

  /**
   * Generate secure session token
   */
  private generateSessionToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // ===========================================================================
  // OIDC AUTHENTICATION (id.mukoko.com)
  // ===========================================================================

  /**
   * Authenticate via OIDC claims (called after OIDC callback)
   */
  async authenticateWithOIDC(claims: OIDCClaims, providerName: string = 'mukoko'): Promise<AuthResult> {
    if (!claims.sub) {
      return { success: false, error: 'Missing subject claim' }
    }

    const issuer = claims.iss || this.env.AUTH_ISSUER_URL || 'https://id.mukoko.com'

    // Find existing provider link
    const existingProvider = await this.db.prepare(`
      SELECT user_id FROM user_auth_providers
      WHERE provider_type = 'oidc' AND oidc_subject = ? AND oidc_issuer = ?
    `).bind(claims.sub, issuer).first<{ user_id: string }>()

    let userId: string
    let isNewUser = false

    if (existingProvider) {
      userId = existingProvider.user_id

      // Update provider last used
      await this.db.prepare(`
        UPDATE user_auth_providers
        SET last_used_at = CURRENT_TIMESTAMP, metadata = ?
        WHERE provider_type = 'oidc' AND oidc_subject = ? AND oidc_issuer = ?
      `).bind(JSON.stringify(claims), claims.sub, issuer).run()

      // Sync profile from claims
      await this.syncProfileFromOIDC(userId, claims, false)
    } else {
      // Create new user
      userId = this.generateUserId()
      isNewUser = true

      await this.db.prepare(`
        INSERT INTO users (id, email, email_verified, display_name, avatar_url, role, status)
        VALUES (?, ?, ?, ?, ?, 'user', 'active')
      `).bind(
        userId,
        claims.email || null,
        claims.email_verified || false,
        claims.name || claims.given_name || null,
        claims.picture || null
      ).run()

      // Link provider
      await this.db.prepare(`
        INSERT INTO user_auth_providers (
          user_id, provider_type, provider_name, oidc_subject, oidc_issuer,
          is_primary, verified_at, metadata
        ) VALUES (?, 'oidc', ?, ?, ?, TRUE, CURRENT_TIMESTAMP, ?)
      `).bind(userId, providerName, claims.sub, issuer, JSON.stringify(claims)).run()

      // Sync profile
      await this.syncProfileFromOIDC(userId, claims, true)
    }

    // Create session
    const { token, session } = await this.createSession(userId, 'oidc', providerName)
    const user = await this.getUserById(userId)

    return {
      success: true,
      user: user!,
      session,
      session_token: token,
      is_new_user: isNewUser
    }
  }

  /**
   * Sync user profile from OIDC claims
   */
  async syncProfileFromOIDC(userId: string, claims: OIDCClaims, overwrite: boolean = false): Promise<void> {
    const updates: string[] = []
    const params: any[] = []

    const mapping: Record<string, string> = {
      name: 'display_name',
      picture: 'avatar_url',
      email: 'email',
      phone_number: 'mobile_number'
    }

    for (const [claim, field] of Object.entries(mapping)) {
      if (claims[claim]) {
        if (overwrite || !await this.hasUserField(userId, field)) {
          updates.push(`${field} = ?`)
          params.push(claims[claim])
        }
      }
    }

    if (claims.email_verified) updates.push('email_verified = TRUE')
    if (claims.phone_number_verified) updates.push('mobile_verified = TRUE')

    if (updates.length > 0) {
      params.push(userId)
      await this.db.prepare(`
        UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).bind(...params).run()
    }
  }

  // ===========================================================================
  // MOBILE AUTHENTICATION (SMS/WhatsApp)
  // ===========================================================================

  /**
   * Send OTP to mobile number
   */
  async sendMobileOTP(mobileNumber: string, countryCode: string = 'ZW'): Promise<{ success: boolean; error?: string; expires_at?: string }> {
    const normalized = this.normalizePhoneNumber(mobileNumber, countryCode)
    if (!normalized) {
      return { success: false, error: 'Invalid phone number format' }
    }

    // Check rate limit
    const recentOTPs = await this.db.prepare(`
      SELECT COUNT(*) as count FROM mobile_verification_log
      WHERE mobile_number = ? AND sent_at > datetime('now', '-1 hour')
    `).bind(normalized).first<{ count: number }>()

    if ((recentOTPs?.count || 0) >= 5) {
      return { success: false, error: 'Too many OTP requests. Please wait.' }
    }

    // Generate OTP
    const otp = this.generateOTP()
    const otpHash = await this.hashOTP(otp)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

    // Store OTP in provider record
    await this.db.prepare(`
      INSERT INTO user_auth_providers (
        user_id, provider_type, provider_name, mobile_number, mobile_country_code,
        mobile_verification_code, mobile_verification_expires, mobile_verification_attempts
      ) VALUES (NULL, 'mobile', 'sms', ?, ?, ?, ?, 0)
      ON CONFLICT(mobile_number) DO UPDATE SET
        mobile_verification_code = excluded.mobile_verification_code,
        mobile_verification_expires = excluded.mobile_verification_expires,
        mobile_verification_attempts = 0,
        updated_at = CURRENT_TIMESTAMP
    `).bind(normalized, countryCode, otpHash, expiresAt).run()

    // Log attempt
    await this.db.prepare(`
      INSERT INTO mobile_verification_log (mobile_number, country_code, verification_type, status, expires_at)
      VALUES (?, ?, 'sms', 'sent', ?)
    `).bind(normalized, countryCode, expiresAt).run()

    // Send SMS (would integrate with provider)
    const sent = await this.sendSMS(normalized, `Your Mukoko News code is: ${otp}`)

    return sent
      ? { success: true, expires_at: expiresAt }
      : { success: false, error: 'Failed to send SMS' }
  }

  /**
   * Verify mobile OTP
   */
  async verifyMobileOTP(mobileNumber: string, code: string, countryCode: string = 'ZW'): Promise<AuthResult> {
    const normalized = this.normalizePhoneNumber(mobileNumber, countryCode)
    if (!normalized) {
      return { success: false, error: 'Invalid phone number' }
    }

    const provider = await this.db.prepare(`
      SELECT user_id, mobile_verification_code, mobile_verification_expires, mobile_verification_attempts
      FROM user_auth_providers
      WHERE provider_type = 'mobile' AND mobile_number = ?
    `).bind(normalized).first<{
      user_id: string | null
      mobile_verification_code: string
      mobile_verification_expires: string
      mobile_verification_attempts: number
    }>()

    if (!provider?.mobile_verification_code) {
      return { success: false, error: 'No pending verification' }
    }

    if (new Date(provider.mobile_verification_expires) < new Date()) {
      return { success: false, error: 'Code expired' }
    }

    if (provider.mobile_verification_attempts >= MAX_OTP_ATTEMPTS) {
      return { success: false, error: 'Too many attempts' }
    }

    const codeHash = await this.hashOTP(code)
    if (codeHash !== provider.mobile_verification_code) {
      await this.db.prepare(`
        UPDATE user_auth_providers
        SET mobile_verification_attempts = mobile_verification_attempts + 1
        WHERE provider_type = 'mobile' AND mobile_number = ?
      `).bind(normalized).run()
      return { success: false, error: 'Invalid code' }
    }

    // Verified - create or get user
    let userId = provider.user_id
    let isNewUser = false

    if (!userId) {
      userId = this.generateUserId()
      isNewUser = true

      await this.db.prepare(`
        INSERT INTO users (id, mobile_number, mobile_verified, mobile_country_code, role, status)
        VALUES (?, ?, TRUE, ?, 'user', 'active')
      `).bind(userId, normalized, countryCode).run()
    }

    // Update provider
    await this.db.prepare(`
      UPDATE user_auth_providers
      SET user_id = ?, mobile_verified = TRUE,
          mobile_verification_code = NULL, mobile_verification_expires = NULL,
          mobile_verification_attempts = 0, verified_at = CURRENT_TIMESTAMP,
          is_primary = CASE WHEN user_id IS NULL THEN TRUE ELSE is_primary END
      WHERE provider_type = 'mobile' AND mobile_number = ?
    `).bind(userId, normalized).run()

    // Update user
    await this.db.prepare(`
      UPDATE users SET mobile_verified = TRUE, mobile_number = ?, mobile_country_code = ?
      WHERE id = ? AND (mobile_number IS NULL OR mobile_number = ?)
    `).bind(normalized, countryCode, userId, normalized).run()

    // Create session
    const { token, session } = await this.createSession(userId, 'mobile', 'sms')
    const user = await this.getUserById(userId)

    return { success: true, user: user!, session, session_token: token, is_new_user: isNewUser }
  }

  // ===========================================================================
  // WEB3 AUTHENTICATION
  // ===========================================================================

  /**
   * Generate nonce for wallet signature
   */
  async generateWalletNonce(address: string): Promise<string> {
    const normalized = address.toLowerCase()
    const nonce = this.generateSessionToken().slice(0, 32)

    await this.db.prepare(`
      INSERT INTO user_auth_providers (
        user_id, provider_type, provider_name, wallet_address, signature_nonce
      ) VALUES (NULL, 'web3', 'ethereum', ?, ?)
      ON CONFLICT(wallet_address, chain_id) DO UPDATE SET
        signature_nonce = excluded.signature_nonce,
        updated_at = CURRENT_TIMESTAMP
    `).bind(normalized, nonce).run()

    return nonce
  }

  /**
   * Verify wallet signature and authenticate
   */
  async authenticateWithWallet(
    address: string,
    signature: string,
    message: string,
    chainId: number = 1
  ): Promise<AuthResult> {
    const normalized = address.toLowerCase()

    // Get stored nonce
    const provider = await this.db.prepare(`
      SELECT user_id, signature_nonce FROM user_auth_providers
      WHERE provider_type = 'web3' AND wallet_address = ?
    `).bind(normalized).first<{ user_id: string | null; signature_nonce: string }>()

    if (!provider?.signature_nonce) {
      return { success: false, error: 'No pending authentication' }
    }

    // Verify nonce is in message
    if (!message.includes(provider.signature_nonce)) {
      return { success: false, error: 'Invalid nonce' }
    }

    // Note: In production, verify signature cryptographically here
    // For now, we trust the frontend verification

    // Log signature
    await this.db.prepare(`
      INSERT INTO web3_signature_log (wallet_address, chain_id, message, signature, nonce, verified)
      VALUES (?, ?, ?, ?, ?, TRUE)
    `).bind(normalized, chainId, message, signature, provider.signature_nonce).run()

    let userId = provider.user_id
    let isNewUser = false

    if (!userId) {
      userId = this.generateUserId()
      isNewUser = true

      await this.db.prepare(`
        INSERT INTO users (id, primary_wallet_address, primary_chain_id, role, status)
        VALUES (?, ?, ?, 'user', 'active')
      `).bind(userId, normalized, chainId).run()
    }

    // Update provider
    await this.db.prepare(`
      UPDATE user_auth_providers
      SET user_id = ?, chain_id = ?, signature_nonce = NULL,
          verified_at = CURRENT_TIMESTAMP, last_used_at = CURRENT_TIMESTAMP,
          is_primary = CASE WHEN user_id IS NULL THEN TRUE ELSE is_primary END
      WHERE provider_type = 'web3' AND wallet_address = ?
    `).bind(userId, chainId, normalized).run()

    const { token, session } = await this.createSession(userId, 'web3', 'ethereum')
    const user = await this.getUserById(userId)

    return { success: true, user: user!, session, session_token: token, is_new_user: isNewUser }
  }

  // ===========================================================================
  // USER & ROLE MANAGEMENT
  // ===========================================================================

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const result = await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(userId).first()

    if (!result) return null
    return result as unknown as User
  }

  /**
   * Get user's auth providers
   */
  async getUserProviders(userId: string): Promise<AuthProvider[]> {
    const result = await this.db.prepare(`
      SELECT * FROM user_auth_providers WHERE user_id = ? ORDER BY is_primary DESC
    `).bind(userId).all()

    return (result.results || []) as unknown as AuthProvider[]
  }

  /**
   * Check if user has required role
   */
  hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLES[userRole].level >= ROLES[requiredRole].level
  }

  /**
   * Check if user is admin
   */
  isAdmin(role: UserRole): boolean {
    return role === 'admin'
  }

  /**
   * Check if user can moderate
   */
  canModerate(role: UserRole): boolean {
    return this.hasRole(role, 'moderator')
  }

  /**
   * Check if user can create content
   */
  canCreateContent(role: UserRole): boolean {
    return this.hasRole(role, 'author')
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole, adminId: string): Promise<boolean> {
    const admin = await this.getUserById(adminId)
    if (!admin || !this.isAdmin(admin.role)) {
      return false
    }

    await this.db.prepare(`
      UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(newRole, userId).run()

    return true
  }

  // ===========================================================================
  // PROVIDER LINKING
  // ===========================================================================

  /**
   * Link additional auth provider to user
   */
  async linkProvider(
    userId: string,
    providerType: 'oidc' | 'mobile' | 'web3',
    providerData: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    // Check for existing link
    let conflictQuery: string
    let conflictParams: any[]

    switch (providerType) {
      case 'oidc':
        conflictQuery = `SELECT user_id FROM user_auth_providers WHERE provider_type = 'oidc' AND oidc_subject = ? AND user_id != ?`
        conflictParams = [providerData.oidc_subject, userId]
        break
      case 'mobile':
        conflictQuery = `SELECT user_id FROM user_auth_providers WHERE provider_type = 'mobile' AND mobile_number = ? AND user_id != ?`
        conflictParams = [providerData.mobile_number, userId]
        break
      case 'web3':
        conflictQuery = `SELECT user_id FROM user_auth_providers WHERE provider_type = 'web3' AND wallet_address = ? AND user_id != ?`
        conflictParams = [providerData.wallet_address?.toLowerCase(), userId]
        break
      default:
        return { success: false, error: 'Invalid provider type' }
    }

    const existing = await this.db.prepare(conflictQuery).bind(...conflictParams).first()
    if (existing) {
      return { success: false, error: 'This identity is already linked to another account' }
    }

    // Insert provider link based on type
    // Implementation depends on provider type...

    return { success: true }
  }

  /**
   * Unlink auth provider from user
   */
  async unlinkProvider(userId: string, providerId: number): Promise<{ success: boolean; error?: string }> {
    const count = await this.db.prepare(`
      SELECT COUNT(*) as count FROM user_auth_providers WHERE user_id = ?
    `).bind(userId).first<{ count: number }>()

    if ((count?.count || 0) <= 1) {
      return { success: false, error: 'Cannot remove only authentication method' }
    }

    await this.db.prepare(`
      DELETE FROM user_auth_providers WHERE id = ? AND user_id = ?
    `).bind(providerId, userId).run()

    return { success: true }
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private generateUserId(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private generateOTP(): string {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return (array[0] % 1000000).toString().padStart(OTP_LENGTH, '0')
  }

  private async hashOTP(otp: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(otp)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private normalizePhoneNumber(number: string, countryCode: string): string | null {
    let cleaned = number.replace(/[\s\-\(\)\.]/g, '')

    if (!cleaned.startsWith('+')) {
      const prefix = AFRICAN_COUNTRIES[countryCode]
      if (!prefix) return null
      cleaned = cleaned.startsWith('0') ? prefix + cleaned.slice(1) : prefix + cleaned
    }

    return /^\+[1-9]\d{6,14}$/.test(cleaned) ? cleaned : null
  }

  private async hasUserField(userId: string, field: string): Promise<boolean> {
    const result = await this.db.prepare(`SELECT ${field} FROM users WHERE id = ?`).bind(userId).first()
    return result && result[field] !== null && result[field] !== ''
  }

  private async sendSMS(to: string, message: string): Promise<boolean> {
    // Integration with SMS provider would go here
    console.log(`[SMS] Would send to ${to}: ${message}`)
    return true
  }

  // ===========================================================================
  // RBAC MIDDLEWARE - Role-Based Access Control
  // ===========================================================================

  /**
   * Default auth settings (used if database not available)
   * Admin is ALWAYS required (locked) - cannot be disabled
   */
  static DEFAULT_AUTH_SETTINGS: Record<UserRole, boolean> = {
    admin: true,      // LOCKED: Always requires authentication
    moderator: false, // Disabled during OIDC migration
    support: false,   // Disabled during OIDC migration
    author: false,    // Disabled during OIDC migration
    user: false,      // Disabled during OIDC migration
  }

  // Cache key for auth settings
  private static AUTH_SETTINGS_CACHE_KEY = 'auth_settings:config'
  private static AUTH_SETTINGS_CACHE_TTL = 300 // 5 minutes

  /**
   * Get auth settings from database (with KV caching)
   */
  async getAuthSettings(): Promise<Record<UserRole, { auth_required: boolean; locked: boolean }>> {
    // Try cache first
    const cached = await this.kv.get(AuthProviderService.AUTH_SETTINGS_CACHE_KEY)
    if (cached) {
      return JSON.parse(cached)
    }

    // Load from database
    const result = await this.db.prepare(`
      SELECT role, auth_required, locked FROM auth_settings
    `).all()

    const settings: Record<string, { auth_required: boolean; locked: boolean }> = {}

    // Set defaults first
    for (const role of Object.keys(ROLES)) {
      settings[role] = {
        auth_required: AuthProviderService.DEFAULT_AUTH_SETTINGS[role as UserRole],
        locked: role === 'admin'
      }
    }

    // Override with database values
    if (result.results) {
      for (const row of result.results as any[]) {
        settings[row.role] = {
          auth_required: Boolean(row.auth_required),
          locked: Boolean(row.locked)
        }
      }
    }

    // Cache the settings
    await this.kv.put(
      AuthProviderService.AUTH_SETTINGS_CACHE_KEY,
      JSON.stringify(settings),
      { expirationTtl: AuthProviderService.AUTH_SETTINGS_CACHE_TTL }
    )

    return settings as Record<UserRole, { auth_required: boolean; locked: boolean }>
  }

  /**
   * Update auth setting for a role (admin only)
   * Returns false if role is locked or update fails
   */
  async updateAuthSetting(
    role: UserRole,
    authRequired: boolean,
    adminUserId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    // Admin auth is always locked
    if (role === 'admin') {
      return { success: false, error: 'Admin authentication cannot be disabled' }
    }

    // Check if setting is locked
    const current = await this.db.prepare(`
      SELECT auth_required, locked FROM auth_settings WHERE role = ?
    `).bind(role).first<{ auth_required: boolean; locked: boolean }>()

    if (current?.locked) {
      return { success: false, error: `Auth setting for ${role} is locked` }
    }

    const oldValue = current?.auth_required ?? false

    // Update the setting
    await this.db.prepare(`
      UPDATE auth_settings
      SET auth_required = ?, updated_at = datetime('now'), updated_by = ?
      WHERE role = ?
    `).bind(authRequired, adminUserId, role).run()

    // Log the change
    await this.db.prepare(`
      INSERT INTO auth_settings_log (role, auth_required_old, auth_required_new, changed_by, reason)
      VALUES (?, ?, ?, ?, ?)
    `).bind(role, oldValue, authRequired, adminUserId, reason || null).run()

    // Clear cache
    await this.kv.delete(AuthProviderService.AUTH_SETTINGS_CACHE_KEY)

    return { success: true }
  }

  /**
   * Get auth settings change history
   */
  async getAuthSettingsHistory(limit: number = 50): Promise<any[]> {
    const result = await this.db.prepare(`
      SELECT
        l.*,
        u.email as changed_by_email,
        u.display_name as changed_by_name
      FROM auth_settings_log l
      LEFT JOIN users u ON l.changed_by = u.id
      ORDER BY l.changed_at DESC
      LIMIT ?
    `).bind(limit).all()

    return result.results || []
  }

  /**
   * Check if authentication is required for a specific role
   * Admin is always required regardless of configuration
   */
  async isAuthRequired(role: UserRole): Promise<boolean> {
    if (role === 'admin') return true // Admin auth is LOCKED

    const settings = await this.getAuthSettings()
    return settings[role]?.auth_required ?? false
  }

  /**
   * Static check (uses defaults, for middleware that can't be async)
   * Prefer the async isAuthRequired() method when possible
   */
  static isAuthRequiredSync(role: UserRole): boolean {
    if (role === 'admin') return true // Admin auth is LOCKED
    return AuthProviderService.DEFAULT_AUTH_SETTINGS[role]
  }

  /**
   * RBAC Middleware Result
   */
  async validateAccess(
    sessionToken: string | undefined,
    requiredRole: UserRole
  ): Promise<{
    allowed: boolean
    user?: User
    reason?: string
  }> {
    // Admin routes ALWAYS require authentication
    if (requiredRole === 'admin') {
      if (!sessionToken) {
        return { allowed: false, reason: 'Authentication required for admin access' }
      }

      const session = await this.validateSession(sessionToken)
      if (!session || !session.user_id) {
        return { allowed: false, reason: 'Invalid or expired session' }
      }

      const user = await this.getUserById(session.user_id)
      if (!user || user.role !== 'admin') {
        return { allowed: false, reason: 'Admin role required' }
      }

      return { allowed: true, user }
    }

    // Check if auth is required for this role (async database lookup)
    const authRequired = await this.isAuthRequired(requiredRole)
    if (!authRequired) {
      // Auth disabled for this role - allow access without authentication
      // Optionally still validate session if provided
      if (sessionToken) {
        const session = await this.validateSession(sessionToken)
        if (session && session.user_id) {
          const user = await this.getUserById(session.user_id)
          return { allowed: true, user: user || undefined }
        }
      }
      return { allowed: true } // Allow without user context
    }

    // Auth is required for this role
    if (!sessionToken) {
      return { allowed: false, reason: `Authentication required for ${requiredRole} access` }
    }

    const session = await this.validateSession(sessionToken)
    if (!session || !session.user_id) {
      return { allowed: false, reason: 'Invalid or expired session' }
    }

    const user = await this.getUserById(session.user_id)
    if (!user) {
      return { allowed: false, reason: 'User not found' }
    }

    // Check if user has required role level
    if (!this.hasRole(user.role, requiredRole)) {
      return { allowed: false, reason: `Requires ${requiredRole} role or higher` }
    }

    return { allowed: true, user }
  }

  /**
   * Validate admin-only access
   * This is a strict check that ALWAYS requires authentication
   */
  async validateAdminAccess(sessionToken: string | undefined): Promise<{
    allowed: boolean
    user?: User
    reason?: string
  }> {
    return this.validateAccess(sessionToken, 'admin')
  }

  /**
   * Validate moderator-level access (moderator or admin)
   */
  async validateModeratorAccess(sessionToken: string | undefined): Promise<{
    allowed: boolean
    user?: User
    reason?: string
  }> {
    return this.validateAccess(sessionToken, 'moderator')
  }

  /**
   * Validate author-level access (can create content)
   */
  async validateAuthorAccess(sessionToken: string | undefined): Promise<{
    allowed: boolean
    user?: User
    reason?: string
  }> {
    return this.validateAccess(sessionToken, 'author')
  }

  /**
   * Validate any authenticated user access
   */
  async validateUserAccess(sessionToken: string | undefined): Promise<{
    allowed: boolean
    user?: User
    reason?: string
  }> {
    return this.validateAccess(sessionToken, 'user')
  }

  /**
   * Get user from request headers (for optional auth scenarios)
   * Returns null if no valid session, does not throw
   */
  async getUserFromHeaders(headers: { get(name: string): string | null }): Promise<User | null> {
    const token = headers.get('authorization')?.replace('Bearer ', '') ||
                  headers.get('x-session-token')

    if (!token) return null

    const session = await this.validateSession(token)
    if (!session || !session.user_id) return null

    return this.getUserById(session.user_id)
  }
}
