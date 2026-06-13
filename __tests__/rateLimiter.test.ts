import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimitStore } from '@/lib/rateLimiter';

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('allows requests under the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('user-1', 5, 60_000)).toBe(true);
    }
  });

  it('blocks the request that exceeds the limit', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('user-1', 5, 60_000);
    }
    expect(checkRateLimit('user-1', 5, 60_000)).toBe(false);
  });

  it('tracks different identifiers independently', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('user-1', 5, 60_000);
    }
    // user-2 should still be allowed
    expect(checkRateLimit('user-2', 5, 60_000)).toBe(true);
  });

  it('allows requests again after window expires', () => {
    // Use a 0ms window so all timestamps are already expired on the next call
    for (let i = 0; i < 5; i++) {
      checkRateLimit('user-1', 5, 0);
    }
    // All timestamps are now expired (window = 0)
    expect(checkRateLimit('user-1', 5, 0)).toBe(true);
  });

  it('resets the store correctly', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('user-1', 5, 60_000);
    }
    resetRateLimitStore();
    // Should be allowed again after reset
    expect(checkRateLimit('user-1', 5, 60_000)).toBe(true);
  });
});
