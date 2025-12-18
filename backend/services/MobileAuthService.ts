/**
 * Mobile Authentication Service
 * SMS and WhatsApp-based authentication for African markets
 *
 * Features:
 * - SMS OTP verification
 * - WhatsApp OTP verification
 * - USSD support (for feature phones)
 * - Rate limiting
 * - Multi-provider support (Africa's Talking, Twilio, etc.)
 *
 * African mobile carriers supported:
 * - Zimbabwe: Econet, NetOne, Telecel
 * - Kenya: Safaricom, Airtel, Telkom
 * - South Africa: Vodacom, MTN, Cell C
 * - Nigeria: MTN, Airtel, Glo, 9mobile
 * - And more...
 */

import { D1Database } from '@cloudflare/workers-types'

// Types
export interface MobileAuthBindings {
  DB: D1Database
  AFRICAS_TALKING_API_KEY?: string
  AFRICAS_TALKING_USERNAME?: string
  TWILIO_ACCOUNT_SID?: string
  TWILIO_AUTH_TOKEN?: string
  TWILIO_PHONE_NUMBER?: string
  SMS_PROVIDER?: 'africas_talking' | 'twilio' | 'infobip'
}

export interface SendOTPResult {
  success: boolean
  messageId?: string
  expiresAt?: string
  provider?: string
  error?: string
  remainingAttempts?: number
}

export interface VerifyOTPResult {
  success: boolean
  userId?: string
  isNewUser?: boolean
  error?: string
  attemptsRemaining?: number
}

interface MobileNumberInfo {
  number: string           // E.164 format
  countryCode: string      // ISO country code
  nationalNumber: string   // Without country code
  carrier?: string
  isValid: boolean
}

// African country codes and carriers
const AFRICAN_COUNTRIES: Record<string, { code: string; carriers: string[] }> = {
  ZW: { code: '+263', carriers: ['Econet', 'NetOne', 'Telecel'] },
  KE: { code: '+254', carriers: ['Safaricom', 'Airtel', 'Telkom'] },
  ZA: { code: '+27', carriers: ['Vodacom', 'MTN', 'Cell C', 'Telkom'] },
  NG: { code: '+234', carriers: ['MTN', 'Airtel', 'Glo', '9mobile'] },
  TZ: { code: '+255', carriers: ['Vodacom', 'Airtel', 'Tigo', 'Halotel'] },
  UG: { code: '+256', carriers: ['MTN', 'Airtel', 'Africell'] },
  GH: { code: '+233', carriers: ['MTN', 'Vodafone', 'AirtelTigo'] },
  RW: { code: '+250', carriers: ['MTN', 'Airtel'] },
  ZM: { code: '+260', carriers: ['MTN', 'Airtel', 'Zamtel'] },
  MW: { code: '+265', carriers: ['Airtel', 'TNM'] },
  BW: { code: '+267', carriers: ['Mascom', 'Orange', 'BTC'] },
  NA: { code: '+264', carriers: ['MTC', 'TN Mobile'] },
  MZ: { code: '+258', carriers: ['Vodacom', 'Movitel', 'Tmcel'] },
  ET: { code: '+251', carriers: ['Ethio Telecom'] },
  EG: { code: '+20', carriers: ['Vodafone', 'Orange', 'Etisalat', 'WE'] },
}

// OTP Configuration
const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10
const MAX_VERIFICATION_ATTEMPTS = 3
const RATE_LIMIT_WINDOW_MINUTES = 60
const MAX_OTP_PER_HOUR = 5

export class MobileAuthService {
  private db: D1Database
  private smsProvider: string
  private env: MobileAuthBindings

  constructor(env: MobileAuthBindings) {
    this.db = env.DB
    this.env = env
    this.smsProvider = env.SMS_PROVIDER || 'africas_talking'
  }

  /**
   * Parse and validate a mobile number
   */
  parsePhoneNumber(input: string, defaultCountry?: string): MobileNumberInfo {
    // Clean the input
    let cleaned = input.replace(/[\s\-\(\)\.]/g, '')

    // Handle different formats
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2)
    } else if (!cleaned.startsWith('+')) {
      // Try to add country code
      if (defaultCountry && AFRICAN_COUNTRIES[defaultCountry]) {
        const countryInfo = AFRICAN_COUNTRIES[defaultCountry]
        if (cleaned.startsWith('0')) {
          cleaned = countryInfo.code + cleaned.substring(1)
        } else {
          cleaned = countryInfo.code + cleaned
        }
      }
    }

    // Detect country from number
    let detectedCountry: string | undefined
    for (const [country, info] of Object.entries(AFRICAN_COUNTRIES)) {
      if (cleaned.startsWith(info.code)) {
        detectedCountry = country
        break
      }
    }

    // Validate format (E.164: + followed by 7-15 digits)
    const isValid = /^\+[1-9]\d{6,14}$/.test(cleaned)

    return {
      number: cleaned,
      countryCode: detectedCountry || defaultCountry || 'ZW',
      nationalNumber: detectedCountry
        ? cleaned.replace(AFRICAN_COUNTRIES[detectedCountry]?.code || '', '')
        : cleaned.replace(/^\+\d{1,3}/, ''),
      isValid,
    }
  }

  /**
   * Generate a secure OTP
   */
  private generateOTP(): string {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    const otp = (array[0] % 1000000).toString().padStart(OTP_LENGTH, '0')
    return otp
  }

  /**
   * Hash OTP for storage
   */
  private async hashOTP(otp: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(otp)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(mobileNumber: string): Promise<{ allowed: boolean; remainingAttempts: number }> {
    const result = await this.db.prepare(`
      SELECT COUNT(*) as count
      FROM mobile_verification_log
      WHERE mobile_number = ?
        AND sent_at > datetime('now', '-${RATE_LIMIT_WINDOW_MINUTES} minutes')
        AND status IN ('sent', 'delivered')
    `).bind(mobileNumber).first<{ count: number }>()

    const count = result?.count || 0
    const remaining = MAX_OTP_PER_HOUR - count

    return {
      allowed: count < MAX_OTP_PER_HOUR,
      remainingAttempts: Math.max(0, remaining)
    }
  }

  /**
   * Send OTP via SMS
   */
  async sendOTP(
    mobileNumber: string,
    countryCode?: string,
    verificationType: 'sms' | 'whatsapp' = 'sms'
  ): Promise<SendOTPResult> {
    // Parse and validate number
    const phoneInfo = this.parsePhoneNumber(mobileNumber, countryCode)
    if (!phoneInfo.isValid) {
      return { success: false, error: 'Invalid mobile number format' }
    }

    // Check rate limit
    const rateLimit = await this.checkRateLimit(phoneInfo.number)
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: 'Too many OTP requests. Please wait before trying again.',
        remainingAttempts: 0
      }
    }

    // Generate OTP
    const otp = this.generateOTP()
    const otpHash = await this.hashOTP(otp)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

    // Find or create auth provider record
    let userId: string | null = null
    const existingProvider = await this.db.prepare(`
      SELECT user_id FROM user_auth_providers
      WHERE provider_type = 'mobile' AND mobile_number = ?
    `).bind(phoneInfo.number).first<{ user_id: string }>()

    userId = existingProvider?.user_id || null

    // Update or create provider record
    if (userId) {
      await this.db.prepare(`
        UPDATE user_auth_providers
        SET mobile_verification_code = ?,
            mobile_verification_expires = ?,
            mobile_verification_attempts = 0,
            mobile_last_otp_sent = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE provider_type = 'mobile' AND mobile_number = ?
      `).bind(otpHash, expiresAt, phoneInfo.number).run()
    }

    // Send SMS via provider
    let sendResult: { success: boolean; messageId?: string; error?: string }
    try {
      sendResult = await this.sendSMSViaProvider(
        phoneInfo.number,
        `Your Mukoko News verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
        verificationType
      )
    } catch (error) {
      sendResult = { success: false, error: String(error) }
    }

    // Log the verification attempt
    await this.db.prepare(`
      INSERT INTO mobile_verification_log (
        user_id, mobile_number, country_code, verification_type,
        verification_code_hash, status, sms_provider, provider_message_id,
        expires_at, ip_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      phoneInfo.number,
      phoneInfo.countryCode,
      verificationType,
      otpHash,
      sendResult.success ? 'sent' : 'failed',
      this.smsProvider,
      sendResult.messageId || null,
      expiresAt,
      null // IP would come from request context
    ).run()

    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error || 'Failed to send verification code'
      }
    }

    return {
      success: true,
      messageId: sendResult.messageId,
      expiresAt,
      provider: this.smsProvider,
      remainingAttempts: rateLimit.remainingAttempts - 1
    }
  }

  /**
   * Send SMS via configured provider
   */
  private async sendSMSViaProvider(
    to: string,
    message: string,
    type: 'sms' | 'whatsapp'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (this.smsProvider === 'africas_talking' && this.env.AFRICAS_TALKING_API_KEY) {
      return this.sendViaAfricasTalking(to, message)
    } else if (this.smsProvider === 'twilio' && this.env.TWILIO_ACCOUNT_SID) {
      return this.sendViaTwilio(to, message, type)
    }

    // Fallback: log for development
    console.log(`[MobileAuth] Would send to ${to}: ${message}`)
    return { success: true, messageId: `dev-${Date.now()}` }
  }

  /**
   * Send via Africa's Talking (popular in East/West Africa)
   */
  private async sendViaAfricasTalking(
    to: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const apiKey = this.env.AFRICAS_TALKING_API_KEY
    const username = this.env.AFRICAS_TALKING_USERNAME || 'sandbox'

    try {
      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'apiKey': apiKey!,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          username,
          to,
          message,
          from: 'MUKOKO'
        })
      })

      const result = await response.json() as {
        SMSMessageData?: { Recipients?: Array<{ messageId: string; status: string }> }
      }

      if (result.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        return {
          success: true,
          messageId: result.SMSMessageData.Recipients[0].messageId
        }
      }

      return { success: false, error: 'Failed to send SMS' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Send via Twilio
   */
  private async sendViaTwilio(
    to: string,
    message: string,
    type: 'sms' | 'whatsapp'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const accountSid = this.env.TWILIO_ACCOUNT_SID
    const authToken = this.env.TWILIO_AUTH_TOKEN
    const from = type === 'whatsapp'
      ? `whatsapp:${this.env.TWILIO_PHONE_NUMBER}`
      : this.env.TWILIO_PHONE_NUMBER

    const toNumber = type === 'whatsapp' ? `whatsapp:${to}` : to

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: toNumber,
            From: from!,
            Body: message
          })
        }
      )

      const result = await response.json() as { sid?: string; error_message?: string }

      if (result.sid) {
        return { success: true, messageId: result.sid }
      }

      return { success: false, error: result.error_message || 'Failed to send SMS' }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(mobileNumber: string, code: string, countryCode?: string): Promise<VerifyOTPResult> {
    // Parse number
    const phoneInfo = this.parsePhoneNumber(mobileNumber, countryCode)
    if (!phoneInfo.isValid) {
      return { success: false, error: 'Invalid mobile number format' }
    }

    // Get provider record
    const provider = await this.db.prepare(`
      SELECT user_id, mobile_verification_code, mobile_verification_expires,
             mobile_verification_attempts
      FROM user_auth_providers
      WHERE provider_type = 'mobile' AND mobile_number = ?
    `).bind(phoneInfo.number).first<{
      user_id: string | null
      mobile_verification_code: string
      mobile_verification_expires: string
      mobile_verification_attempts: number
    }>()

    // Check if there's a pending verification
    if (!provider?.mobile_verification_code) {
      return { success: false, error: 'No pending verification. Please request a new code.' }
    }

    // Check expiry
    if (new Date(provider.mobile_verification_expires) < new Date()) {
      return { success: false, error: 'Verification code has expired. Please request a new one.' }
    }

    // Check attempts
    if (provider.mobile_verification_attempts >= MAX_VERIFICATION_ATTEMPTS) {
      return {
        success: false,
        error: 'Too many failed attempts. Please request a new code.',
        attemptsRemaining: 0
      }
    }

    // Verify code
    const codeHash = await this.hashOTP(code)
    if (codeHash !== provider.mobile_verification_code) {
      // Increment attempts
      await this.db.prepare(`
        UPDATE user_auth_providers
        SET mobile_verification_attempts = mobile_verification_attempts + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE provider_type = 'mobile' AND mobile_number = ?
      `).bind(phoneInfo.number).run()

      const remaining = MAX_VERIFICATION_ATTEMPTS - provider.mobile_verification_attempts - 1
      return {
        success: false,
        error: 'Invalid verification code',
        attemptsRemaining: Math.max(0, remaining)
      }
    }

    // Success! Create or update user
    let userId = provider.user_id
    let isNewUser = false

    if (!userId) {
      // Create new user
      userId = crypto.randomUUID().replace(/-/g, '').toLowerCase()
      isNewUser = true

      await this.db.prepare(`
        INSERT INTO users (id, email, mobile_number, mobile_verified, mobile_country_code, role, status)
        VALUES (?, ?, ?, TRUE, ?, 'creator', 'active')
      `).bind(
        userId,
        `${phoneInfo.number.replace('+', '')}@mobile.mukoko.news`, // Placeholder email
        phoneInfo.number,
        phoneInfo.countryCode
      ).run()

      // Create provider link
      await this.db.prepare(`
        INSERT INTO user_auth_providers (
          user_id, provider_type, provider_name, mobile_number, mobile_country_code,
          mobile_verified, is_primary, verified_at
        ) VALUES (?, 'mobile', 'sms', ?, ?, TRUE, TRUE, CURRENT_TIMESTAMP)
      `).bind(userId, phoneInfo.number, phoneInfo.countryCode).run()
    } else {
      // Update existing provider
      await this.db.prepare(`
        UPDATE user_auth_providers
        SET mobile_verified = TRUE,
            mobile_verification_code = NULL,
            mobile_verification_expires = NULL,
            mobile_verification_attempts = 0,
            verified_at = CURRENT_TIMESTAMP,
            last_used_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE provider_type = 'mobile' AND mobile_number = ?
      `).bind(phoneInfo.number).run()

      // Update user
      await this.db.prepare(`
        UPDATE users
        SET mobile_verified = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(userId).run()
    }

    // Update verification log
    await this.db.prepare(`
      UPDATE mobile_verification_log
      SET status = 'verified', verified_at = CURRENT_TIMESTAMP
      WHERE mobile_number = ? AND status = 'sent'
      ORDER BY sent_at DESC LIMIT 1
    `).bind(phoneInfo.number).run()

    return {
      success: true,
      userId,
      isNewUser
    }
  }

  /**
   * Link mobile number to existing user
   */
  async linkMobileToUser(
    userId: string,
    mobileNumber: string,
    countryCode?: string
  ): Promise<{ success: boolean; error?: string }> {
    const phoneInfo = this.parsePhoneNumber(mobileNumber, countryCode)
    if (!phoneInfo.isValid) {
      return { success: false, error: 'Invalid mobile number format' }
    }

    // Check if number is already linked to another user
    const existing = await this.db.prepare(`
      SELECT user_id FROM user_auth_providers
      WHERE provider_type = 'mobile' AND mobile_number = ? AND user_id != ?
    `).bind(phoneInfo.number, userId).first()

    if (existing) {
      return { success: false, error: 'Mobile number is already linked to another account' }
    }

    // Create or update provider link
    await this.db.prepare(`
      INSERT INTO user_auth_providers (
        user_id, provider_type, provider_name, mobile_number, mobile_country_code
      ) VALUES (?, 'mobile', 'sms', ?, ?)
      ON CONFLICT(mobile_number) DO UPDATE SET
        user_id = excluded.user_id,
        updated_at = CURRENT_TIMESTAMP
    `).bind(userId, phoneInfo.number, phoneInfo.countryCode).run()

    return { success: true }
  }

  /**
   * Get user by mobile number
   */
  async getUserByMobile(mobileNumber: string, countryCode?: string): Promise<{ userId: string; verified: boolean } | null> {
    const phoneInfo = this.parsePhoneNumber(mobileNumber, countryCode)
    if (!phoneInfo.isValid) return null

    const result = await this.db.prepare(`
      SELECT user_id, mobile_verified
      FROM user_auth_providers
      WHERE provider_type = 'mobile' AND mobile_number = ?
    `).bind(phoneInfo.number).first<{ user_id: string; mobile_verified: boolean }>()

    if (!result) return null

    return {
      userId: result.user_id,
      verified: result.mobile_verified
    }
  }
}
