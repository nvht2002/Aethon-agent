/**
 * AETHON API Key Management
 * 
 * Manages API keys for external integrations and programmatic access.
 * Supports key generation, validation, revocation, and usage tracking.
 */

import crypto from 'crypto';

// ─── Types ───────────────────────────────────────────────────────────────────────
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string; // Hashed version for storage
  prefix: string; // First 8 chars for display
  permissions: ApiKeyPermission[];
  rateLimit: number; // Requests per minute
  expiresAt?: Date;
  createdAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isActive: boolean;
}

export type ApiKeyPermission = 
  | 'chat:send'
  | 'chat:stream'
  | 'agents:read'
  | 'agents:write'
  | 'tasks:read'
  | 'tasks:write'
  | 'webhooks:read'
  | 'webhooks:write'
  | 'memory:read'
  | 'memory:write'
  | 'admin';

export interface CreateApiKeyRequest {
  name: string;
  permissions: ApiKeyPermission[];
  rateLimit?: number;
  expiresInDays?: number; // Optional expiration
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  permissions: ApiKeyPermission[];
  rateLimit: number;
  expiresAt?: string;
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
  isActive: boolean;
}

export interface ApiKeyWithSecret extends ApiKeyResponse {
  secret: string; // Only returned once at creation time
}

// ─── Constants ───────────────────────────────────────────────────────────────────
const KEY_PREFIX = 'aethon_';
const KEY_LENGTH = 32; // 32 bytes = 64 hex characters
const HASH_ALGORITHM = 'sha256';

// Default permissions
const DEFAULT_PERMISSIONS: ApiKeyPermission[] = ['chat:send'];
const DEFAULT_RATE_LIMIT = 60; // 60 requests per minute
const MAX_KEYS_PER_USER = 10;

// ─── Key Generation Functions ─────────────────────────────────────────────────

/**
 * Generate a new API key
 */
export function generateApiKey(): { secret: string; hash: string; prefix: string } {
  const buffer = crypto.randomBytes(KEY_LENGTH);
  const secret = KEY_PREFIX + buffer.toString('hex');
  const hash = crypto.createHash(HASH_ALGORITHM).update(secret).digest('hex');
  const prefix = secret.substring(0, 12); // First 12 chars for display
  
  return { secret, hash, prefix };
}

/**
 * Hash an API key for storage/comparison
 */
export function hashApiKey(secret: string): string {
  return crypto.createHash(HASH_ALGORITHM).update(secret).digest('hex');
}

/**
 * Validate API key format
 */
export function validateApiKeyFormat(key: string): boolean {
  if (!key.startsWith(KEY_PREFIX)) return false;
  if (key.length !== KEY_PREFIX.length + KEY_LENGTH * 2) return false;
  
  // Check if it's valid hex
  const hexPart = key.substring(KEY_PREFIX.length);
  return /^[a-f0-9]+$/.test(hexPart);
}

/**
 * Mask API key for display (show only prefix)
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 12) return '****';
  return key.substring(0, 12) + '****' + key.substring(key.length - 4);
}

// ─── Permission Checking ───────────────────────────────────────────────────────

/**
 * Check if a permission is allowed for a given set of permissions
 */
export function hasPermission(
  userPermissions: ApiKeyPermission[], 
  required: ApiKeyPermission
): boolean {
  // Admin has all permissions
  if (userPermissions.includes('admin')) return true;
  return userPermissions.includes(required);
}

/**
 * Check multiple permissions at once
 */
export function hasAllPermissions(
  userPermissions: ApiKeyPermission[],
  required: ApiKeyPermission[]
): boolean {
  return required.every(p => hasPermission(userPermissions, p));
}

/**
 * Get human-readable permission descriptions
 */
export function getPermissionDescriptions(permissions: ApiKeyPermission[]): Record<string, string> {
  const descriptions: Record<string, string> = {
    'chat:send': 'Send chat messages',
    'chat:stream': 'Stream chat responses',
    'agents:read': 'Read agent information',
    'agents:write': 'Create/modify agents',
    'tasks:read': 'Read task information',
    'tasks:write': 'Create/modify tasks',
    'webhooks:read': 'Read webhook configurations',
    'webhooks:write': 'Create/modify webhooks',
    'memory:read': 'Read from semantic memory',
    'memory:write': 'Write to semantic memory',
    'admin': 'Full administrative access'
  };
  
  return permissions.reduce((acc, p) => {
    acc[p] = descriptions[p] || p;
    return acc;
  }, {} as Record<string, string>);
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

/**
 * Simple in-memory rate limiter (in production, use Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for API key
 */
export function checkRateLimit(
  keyId: string, 
  limit: number, 
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const key = `ratelimit:${keyId}`;
  const stored = rateLimitStore.get(key);
  
  if (!stored || stored.resetTime < now) {
    // First request or window expired
    rateLimitStore.set(key, { count: 1, resetTime: now + windowSeconds * 1000 });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowSeconds * 1000
    };
  }
  
  if (stored.count >= limit) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: stored.resetTime
    };
  }
  
  // Increment counter
  stored.count++;
  return {
    allowed: true,
    remaining: limit - stored.count,
    resetAt: stored.resetTime
  };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// ─── API Key Validation Middleware ───────────────────────────────────────────

export interface ValidatedApiKey {
  id: string;
  userId: string;
  permissions: ApiKeyPermission[];
  rateLimit: number;
}

/**
 * Validate API key from request header
 * In production, this would query the database
 */
export async function validateApiKey(
  key: string
): Promise<{ valid: boolean; key?: ValidatedApiKey; error?: string }> {
  // Validate format
  if (!validateApiKeyFormat(key)) {
    return { valid: false, error: 'Invalid API key format' };
  }
  
  // In production: lookup key in database and verify hash
  // For now, return a mock response (would be replaced with DB lookup)
  /*
  const hashedKey = hashApiKey(key);
  const apiKey = await db.query('SELECT * FROM api_keys WHERE key = $1 AND is_active = true', [hashedKey]);
  if (!apiKey) {
    return { valid: false, error: 'API key not found or inactive' };
  }
  */
  
  // Mock validation for development
  return {
    valid: true,
    key: {
      id: 'mock-key-id',
      userId: 'mock-user-id',
      permissions: DEFAULT_PERMISSIONS,
      rateLimit: DEFAULT_RATE_LIMIT
    }
  };
}

// ─── External Integration Helpers ───────────────────────────────────────────

/**
 * Generate integration URL for external services
 */
export function generateIntegrationUrl(
  baseUrl: string,
  keyId: string,
  service: string
): string {
  const params = new URLSearchParams({
    key: keyId,
    service,
    ts: Date.now().toString()
  });
  return `${baseUrl}/api/integrate?${params.toString()}`;
}

/**
 * Generate webhook signature for API key validation
 */
export function generateSignature(
  payload: string,
  secret: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// ─── Key Rotation ─────────────────────────────────────────────────────────────

/**
 * Generate a replacement key while keeping the same permissions
 */
export function rotateApiKey(
  existingKey: ApiKey
): { secret: string; hash: string; prefix: string } {
  return generateApiKey();
}

/**
 * Revoke an API key (soft delete)
 */
export function revokeApiKey(key: ApiKey): ApiKey {
  return {
    ...key,
    isActive: false,
    expiresAt: new Date() // Set expiration to now
  };
}
