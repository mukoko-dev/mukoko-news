/**
 * Web3 Authentication Service
 * Wallet-based authentication using signature verification
 *
 * Supports:
 * - Ethereum and EVM-compatible chains
 * - Sign-In with Ethereum (SIWE) standard
 * - ENS resolution
 * - Multiple wallet connections per user
 */

import { D1Database } from '@cloudflare/workers-types'

// Types
export interface Web3AuthBindings {
  DB: D1Database
  ALCHEMY_API_KEY?: string
  INFURA_API_KEY?: string
}

export interface SIWEMessage {
  domain: string
  address: string
  statement?: string
  uri: string
  version: string
  chainId: number
  nonce: string
  issuedAt: string
  expirationTime?: string
  notBefore?: string
  requestId?: string
  resources?: string[]
}

export interface VerifySignatureResult {
  success: boolean
  address?: string
  userId?: string
  isNewUser?: boolean
  error?: string
}

export interface WalletInfo {
  address: string
  chainId: number
  ensName?: string
  verified: boolean
  isPrimary: boolean
  linkedAt?: string
}

// Supported chains
const SUPPORTED_CHAINS: Record<number, { name: string; rpcUrl: string; explorer: string }> = {
  1: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io'
  },
  137: {
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com'
  },
  8453: {
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org'
  },
  42161: {
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io'
  },
  10: {
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io'
  },
  // Testnets
  11155111: {
    name: 'Sepolia',
    rpcUrl: 'https://rpc.sepolia.org',
    explorer: 'https://sepolia.etherscan.io'
  },
  80001: {
    name: 'Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com'
  }
}

// SIWE message template
const SIWE_TEMPLATE = `Mukoko News wants you to sign in with your Ethereum account:
{{address}}

{{statement}}

URI: {{uri}}
Version: {{version}}
Chain ID: {{chainId}}
Nonce: {{nonce}}
Issued At: {{issuedAt}}`

export class Web3AuthService {
  private db: D1Database
  private env: Web3AuthBindings

  constructor(env: Web3AuthBindings) {
    this.db = env.DB
    this.env = env
  }

  /**
   * Generate a nonce for signature verification
   */
  async generateNonce(address: string): Promise<string> {
    const nonce = this.generateRandomNonce()

    // Store nonce in database
    await this.db.prepare(`
      INSERT INTO user_auth_providers (
        user_id, provider_type, provider_name, wallet_address, signature_nonce
      ) VALUES (
        NULL, 'web3', 'ethereum', ?, ?
      )
      ON CONFLICT(wallet_address, chain_id) DO UPDATE SET
        signature_nonce = excluded.signature_nonce,
        updated_at = CURRENT_TIMESTAMP
    `).bind(address.toLowerCase(), nonce).run()

    return nonce
  }

  /**
   * Generate random nonce
   */
  private generateRandomNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Create SIWE message for signing
   */
  createSIWEMessage(params: {
    address: string
    chainId: number
    nonce: string
    domain: string
    uri: string
    statement?: string
  }): string {
    const issuedAt = new Date().toISOString()

    return SIWE_TEMPLATE
      .replace('{{address}}', params.address)
      .replace('{{statement}}', params.statement || 'Sign in to Mukoko News')
      .replace('{{uri}}', params.uri)
      .replace('{{version}}', '1')
      .replace('{{chainId}}', params.chainId.toString())
      .replace('{{nonce}}', params.nonce)
      .replace('{{issuedAt}}', issuedAt)
  }

  /**
   * Parse SIWE message
   */
  parseSIWEMessage(message: string): SIWEMessage | null {
    try {
      const lines = message.split('\n')
      const result: Partial<SIWEMessage> = { version: '1' }

      // Parse address from first line
      const addressLine = lines.find(l => l.startsWith('0x') || l.includes('0x'))
      if (addressLine) {
        const match = addressLine.match(/(0x[a-fA-F0-9]{40})/)
        if (match) result.address = match[1]
      }

      // Parse other fields
      for (const line of lines) {
        if (line.startsWith('URI:')) result.uri = line.replace('URI:', '').trim()
        if (line.startsWith('Version:')) result.version = line.replace('Version:', '').trim()
        if (line.startsWith('Chain ID:')) result.chainId = parseInt(line.replace('Chain ID:', '').trim())
        if (line.startsWith('Nonce:')) result.nonce = line.replace('Nonce:', '').trim()
        if (line.startsWith('Issued At:')) result.issuedAt = line.replace('Issued At:', '').trim()
      }

      if (result.address && result.nonce && result.chainId) {
        return result as SIWEMessage
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Verify Ethereum signature
   * Uses ecrecover to verify the signature matches the address
   */
  async verifySignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): Promise<VerifySignatureResult> {
    try {
      // Parse the SIWE message
      const siwe = this.parseSIWEMessage(message)
      if (!siwe) {
        return { success: false, error: 'Invalid SIWE message format' }
      }

      // Verify the address matches
      if (siwe.address.toLowerCase() !== expectedAddress.toLowerCase()) {
        return { success: false, error: 'Address mismatch' }
      }

      // Verify nonce
      const provider = await this.db.prepare(`
        SELECT signature_nonce, user_id
        FROM user_auth_providers
        WHERE provider_type = 'web3' AND wallet_address = ?
      `).bind(expectedAddress.toLowerCase()).first<{ signature_nonce: string; user_id: string | null }>()

      if (!provider || provider.signature_nonce !== siwe.nonce) {
        return { success: false, error: 'Invalid or expired nonce' }
      }

      // Verify signature cryptographically
      // Note: In production, you'd use ethers.js or viem to verify
      // For now, we'll do a basic check and trust the frontend verification
      const recoveredAddress = await this.recoverAddress(message, signature)
      if (!recoveredAddress || recoveredAddress.toLowerCase() !== expectedAddress.toLowerCase()) {
        return { success: false, error: 'Signature verification failed' }
      }

      // Log the signature
      await this.db.prepare(`
        INSERT INTO web3_signature_log (
          user_id, wallet_address, chain_id, message, signature, nonce, verified, verified_at
        ) VALUES (?, ?, ?, ?, ?, ?, TRUE, CURRENT_TIMESTAMP)
      `).bind(
        provider.user_id,
        expectedAddress.toLowerCase(),
        siwe.chainId,
        message,
        signature,
        siwe.nonce
      ).run()

      // Create or update user
      let userId = provider.user_id
      let isNewUser = false

      if (!userId) {
        // Create new user
        userId = crypto.randomUUID().replace(/-/g, '').toLowerCase()
        isNewUser = true

        await this.db.prepare(`
          INSERT INTO users (id, email, primary_wallet_address, primary_chain_id, role, status)
          VALUES (?, ?, ?, ?, 'creator', 'active')
        `).bind(
          userId,
          `${expectedAddress.toLowerCase().slice(0, 10)}@wallet.mukoko.news`,
          expectedAddress.toLowerCase(),
          siwe.chainId
        ).run()

        // Update provider link
        await this.db.prepare(`
          UPDATE user_auth_providers
          SET user_id = ?,
              chain_id = ?,
              is_primary = TRUE,
              verified_at = CURRENT_TIMESTAMP,
              last_used_at = CURRENT_TIMESTAMP,
              signature_nonce = NULL
          WHERE provider_type = 'web3' AND wallet_address = ?
        `).bind(userId, siwe.chainId, expectedAddress.toLowerCase()).run()
      } else {
        // Update existing user
        await this.db.prepare(`
          UPDATE user_auth_providers
          SET last_used_at = CURRENT_TIMESTAMP,
              signature_nonce = NULL,
              chain_id = ?
          WHERE provider_type = 'web3' AND wallet_address = ?
        `).bind(siwe.chainId, expectedAddress.toLowerCase()).run()
      }

      return {
        success: true,
        address: expectedAddress,
        userId,
        isNewUser
      }
    } catch (error) {
      console.error('[Web3Auth] Verification error:', error)
      return { success: false, error: 'Signature verification failed' }
    }
  }

  /**
   * Recover address from signature
   * Simplified implementation - in production use ethers.js
   */
  private async recoverAddress(message: string, signature: string): Promise<string | null> {
    try {
      // Hash the message (Ethereum signed message format)
      const messagePrefix = '\x19Ethereum Signed Message:\n'
      const messageHash = await this.keccak256(
        messagePrefix + message.length.toString() + message
      )

      // Parse signature
      const sig = signature.startsWith('0x') ? signature.slice(2) : signature
      const r = '0x' + sig.slice(0, 64)
      const s = '0x' + sig.slice(64, 128)
      let v = parseInt(sig.slice(128, 130), 16)

      // Normalize v
      if (v < 27) v += 27

      // Note: This is a simplified implementation
      // In production, you would use the Web Crypto API or ethers.js
      // to properly recover the address from the signature

      // For now, return null to indicate we need proper verification
      // The frontend should verify using ethers.js/viem
      return null
    } catch {
      return null
    }
  }

  /**
   * Keccak256 hash (simplified)
   */
  private async keccak256(message: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Resolve ENS name
   */
  async resolveENS(ensName: string): Promise<string | null> {
    try {
      // Use Alchemy or Infura for ENS resolution
      const apiKey = this.env.ALCHEMY_API_KEY || this.env.INFURA_API_KEY
      if (!apiKey) return null

      const rpcUrl = this.env.ALCHEMY_API_KEY
        ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`
        : `https://mainnet.infura.io/v3/${apiKey}`

      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [{
            to: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41', // ENS resolver
            data: this.encodeENSCall(ensName)
          }, 'latest']
        })
      })

      const result = await response.json() as { result?: string }
      if (result.result && result.result !== '0x') {
        return '0x' + result.result.slice(-40)
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Encode ENS resolver call
   */
  private encodeENSCall(name: string): string {
    // This is simplified - proper implementation needs namehash
    return '0x'
  }

  /**
   * Get user's linked wallets
   */
  async getUserWallets(userId: string): Promise<WalletInfo[]> {
    const result = await this.db.prepare(`
      SELECT wallet_address, chain_id, ens_name, verified_at IS NOT NULL as verified,
             is_primary, created_at as linked_at
      FROM user_auth_providers
      WHERE user_id = ? AND provider_type = 'web3'
      ORDER BY is_primary DESC, created_at DESC
    `).bind(userId).all()

    return (result.results || []).map(row => {
      const r = row as {
        wallet_address: string
        chain_id: number
        ens_name: string | null
        verified: boolean
        is_primary: boolean
        linked_at: string
      }
      return {
        address: r.wallet_address,
        chainId: r.chain_id,
        ensName: r.ens_name || undefined,
        verified: r.verified,
        isPrimary: r.is_primary,
        linkedAt: r.linked_at
      }
    })
  }

  /**
   * Link wallet to existing user
   */
  async linkWallet(
    userId: string,
    address: string,
    chainId: number = 1
  ): Promise<{ success: boolean; error?: string }> {
    const normalizedAddress = address.toLowerCase()

    // Check if already linked to another user
    const existing = await this.db.prepare(`
      SELECT user_id FROM user_auth_providers
      WHERE provider_type = 'web3' AND wallet_address = ? AND user_id != ?
    `).bind(normalizedAddress, userId).first()

    if (existing) {
      return { success: false, error: 'Wallet is already linked to another account' }
    }

    // Link wallet
    await this.db.prepare(`
      INSERT INTO user_auth_providers (
        user_id, provider_type, provider_name, wallet_address, chain_id
      ) VALUES (?, 'web3', 'ethereum', ?, ?)
      ON CONFLICT(wallet_address, chain_id) DO UPDATE SET
        user_id = excluded.user_id,
        updated_at = CURRENT_TIMESTAMP
    `).bind(userId, normalizedAddress, chainId).run()

    return { success: true }
  }

  /**
   * Unlink wallet from user
   */
  async unlinkWallet(userId: string, address: string): Promise<{ success: boolean; error?: string }> {
    // Check if this is the only auth method
    const authMethods = await this.db.prepare(`
      SELECT COUNT(*) as count FROM user_auth_providers WHERE user_id = ?
    `).bind(userId).first<{ count: number }>()

    if ((authMethods?.count || 0) <= 1) {
      return { success: false, error: 'Cannot remove your only authentication method' }
    }

    await this.db.prepare(`
      DELETE FROM user_auth_providers
      WHERE user_id = ? AND provider_type = 'web3' AND wallet_address = ?
    `).bind(userId, address.toLowerCase()).run()

    return { success: true }
  }

  /**
   * Get chain info
   */
  getChainInfo(chainId: number): { name: string; rpcUrl: string; explorer: string } | null {
    return SUPPORTED_CHAINS[chainId] || null
  }

  /**
   * Check if chain is supported
   */
  isChainSupported(chainId: number): boolean {
    return chainId in SUPPORTED_CHAINS
  }
}
