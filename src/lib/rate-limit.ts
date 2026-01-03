/**
 * Rate Limiting Utility
 *
 * Simple in-memory rate limiter for API endpoints.
 * Uses sliding window algorithm for request counting.
 */

interface RateLimitConfig {
  interval: number; // Time window in ms
  limit: number;    // Max requests per window
}

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

// In-memory store for rate limiting (production should use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries(interval: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.timestamp > interval) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed boolean and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Cleanup old entries occasionally
  cleanupExpiredEntries(config.interval);

  // No previous requests or window expired
  if (!entry || now - entry.timestamp > config.interval) {
    rateLimitStore.set(identifier, { count: 1, timestamp: now });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetIn: config.interval
    };
  }

  // Within the window - check count
  if (entry.count >= config.limit) {
    const resetIn = config.interval - (now - entry.timestamp);
    return {
      allowed: false,
      remaining: 0,
      resetIn
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetIn: config.interval - (now - entry.timestamp)
  };
}

/**
 * Extract client identifier from request
 * Uses X-Forwarded-For header (for proxied requests) or falls back to generic key
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (common for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in case of multiple proxies
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback for local development
  return 'anonymous';
}

// Pre-configured rate limiters
export const RATE_LIMITS = {
  // AI Chat - more restrictive due to API costs
  chat: { interval: 60000, limit: 20 }, // 20 requests per minute

  // Data endpoints - reasonable limits
  data: { interval: 60000, limit: 60 }, // 60 requests per minute

  // Health check - more permissive
  health: { interval: 60000, limit: 120 }, // 120 requests per minute
} as const;
