/**
 * Rate Limiter
 * Prevents abuse by limiting request frequency
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitRecord> = new Map();

  /**
   * Check if request is within rate limit
   * @param key - Unique identifier (userId, IP, etc.)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   */
  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.limits.get(key);

    // No record or window expired - allow and create new record
    if (!record || now > record.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    // Within window - check count
    if (record.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    record.count++;
    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string, maxRequests: number): number {
    const record = this.limits.get(key);
    if (!record || Date.now() > record.resetTime) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - record.count);
  }

  /**
   * Get time until reset (in seconds)
   */
  getResetTime(key: string): number {
    const record = this.limits.get(key);
    if (!record || Date.now() > record.resetTime) {
      return 0;
    }
    return Math.ceil((record.resetTime - Date.now()) / 1000);
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Cleanup expired records (run periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication: 5 login attempts per 15 minutes
  AUTH_LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 },

  // Password reset: 3 attempts per hour
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 },

  // Payment: 5 payment attempts per hour
  PAYMENT: { maxRequests: 5, windowMs: 60 * 60 * 1000 },

  // Upload: 10 uploads per hour
  UPLOAD: { maxRequests: 10, windowMs: 60 * 60 * 1000 },

  // Messaging: 30 messages per minute
  MESSAGING: { maxRequests: 30, windowMs: 60 * 1000 },

  // API calls: 100 requests per minute
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 },
};

/**
 * React hook for rate limiting
 */
export function useRateLimit(
  key: string,
  config: { maxRequests: number; windowMs: number }
) {
  return {
    check: () => rateLimiter.check(key, config.maxRequests, config.windowMs),
    remaining: rateLimiter.getRemaining(key, config.maxRequests),
    resetTime: rateLimiter.getResetTime(key),
  };
}
