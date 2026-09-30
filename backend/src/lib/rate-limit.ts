export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private cache: Map<string, { count: number; expiresAt: number }>;

  constructor(options: { windowMs: number; maxRequests: number }) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.cache = new Map();
  }

  /**
   * Checks if the given key has exceeded the rate limit.
   * @param key - The identifier to rate limit (e.g., IP address).
   * @returns An object with `success` indicating if the request is allowed,
   *          and `limit` info for headers.
   */
  public check(key: string): { success: boolean; limit: number; remaining: number; reset: Date } {
    const now = Date.now();
    const record = this.cache.get(key);

    if (record) {
      if (now > record.expiresAt) {
        // Window expired, reset
        record.count = 1;
        record.expiresAt = now + this.windowMs;
      } else {
        // Increment count
        record.count++;
      }
    } else {
      // First request
      this.cache.set(key, {
        count: 1,
        expiresAt: now + this.windowMs,
      });
    }

    const currentRecord = this.cache.get(key)!;
    const remaining = Math.max(0, this.maxRequests - currentRecord.count);
    const reset = new Date(currentRecord.expiresAt);

    return {
      success: currentRecord.count <= this.maxRequests,
      limit: this.maxRequests,
      remaining,
      reset,
    };
  }

  /**
   * Cleanup interval to prevent memory leaks in long-running processes.
   * Can be called periodically or manually.
   */
  public cleanup() {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (now > record.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global instances for login and signup to persist across HMR in development
// and across invocations in serverless (best effort).
const globalForRateLimit = global as unknown as {
  loginRateLimiter?: RateLimiter;
  signupRateLimiter?: RateLimiter;
};

export const loginRateLimiter =
  globalForRateLimit.loginRateLimiter ||
  new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,          // 10 requests per 15 minutes per IP
  });

export const signupRateLimiter =
  globalForRateLimit.signupRateLimiter ||
  new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,           // 5 requests per hour per IP
  });

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.loginRateLimiter = loginRateLimiter;
  globalForRateLimit.signupRateLimiter = signupRateLimiter;
}
