/**
 * Rate limiting utility for API endpoints
 * Uses in-memory storage with IP tracking
 * For production, consider using Vercel KV, Redis, or a database
 */

const usage = new Map();
const REQUEST_LIMIT = 30;
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Clean up old entries to prevent memory leaks
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, data] of usage.entries()) {
    if (now - data.windowStart > WINDOW_MS) {
      usage.delete(key);
    }
  }
}

/**
 * Get unique identifier for the request
 * @param {Object} req - Request object
 * @returns {string} Unique identifier
 */
function getIdentifier(req) {
  // Get IP address from various possible headers (Vercel provides x-forwarded-for)
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim()
    || req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || req.socket?.remoteAddress
    || 'unknown';

  // Get month key for monthly limits
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return `${ip}-${monthKey}`;
}

/**
 * Check if request should be rate limited
 * @param {Object} req - Request object
 * @returns {Object} Rate limit status
 */
export function checkRateLimit(req) {
  // Clean up old entries periodically (every 100 requests)
  if (Math.random() < 0.01) {
    cleanupOldEntries();
  }

  const identifier = getIdentifier(req);
  const now = Date.now();

  // Get or create usage record
  if (!usage.has(identifier)) {
    usage.set(identifier, {
      count: 0,
      windowStart: now
    });
  }

  const record = usage.get(identifier);

  // Check if we're still in the same window
  if (now - record.windowStart > WINDOW_MS) {
    // Reset counter for new window
    record.count = 0;
    record.windowStart = now;
  }

  const remaining = Math.max(0, REQUEST_LIMIT - record.count);
  const isLimited = record.count >= REQUEST_LIMIT;

  return {
    isLimited,
    remaining,
    limit: REQUEST_LIMIT,
    resetAt: new Date(record.windowStart + WINDOW_MS).toISOString()
  };
}

/**
 * Increment usage counter
 * @param {Object} req - Request object
 */
export function incrementUsage(req) {
  const identifier = getIdentifier(req);
  const record = usage.get(identifier);

  if (record) {
    record.count++;
  }
}

/**
 * Get current usage statistics
 * @param {Object} req - Request object
 * @returns {Object} Usage stats
 */
export function getUsageStats(req) {
  const identifier = getIdentifier(req);
  const record = usage.get(identifier);

  if (!record) {
    return {
      used: 0,
      remaining: REQUEST_LIMIT,
      limit: REQUEST_LIMIT,
      resetAt: new Date(Date.now() + WINDOW_MS).toISOString()
    };
  }

  return {
    used: record.count,
    remaining: Math.max(0, REQUEST_LIMIT - record.count),
    limit: REQUEST_LIMIT,
    resetAt: new Date(record.windowStart + WINDOW_MS).toISOString()
  };
}
