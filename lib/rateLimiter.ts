/**
 * In-memory sliding-window rate limiter.
 *
 * Note: In serverless environments each cold-start resets the store.
 * For a local demo or single-process deployment this provides solid protection.
 * Production deployments should use Redis-backed rate limiting.
 */

interface WindowEntry {
  timestamps: number[];
}

const store = new Map<string, WindowEntry>();

const DEFAULT_LIMIT = 20;
const DEFAULT_WINDOW_MS = 60_000; // 1 minute

/**
 * Returns true when the request is within the allowed rate limit.
 * Returns false when the identifier has exceeded the threshold.
 */
export function checkRateLimit(
  identifier: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS,
): boolean {
  const now = Date.now();
  const entry = store.get(identifier) ?? { timestamps: [] };

  // Evict timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    store.set(identifier, entry);
    return false;
  }

  entry.timestamps.push(now);
  store.set(identifier, entry);
  return true;
}

/** Clears the rate-limit store — intended for tests only. */
export function resetRateLimitStore(): void {
  store.clear();
}
