import { describe, it, expect } from 'vitest';
import { cn, generateId, formatTimestamp, daysUntil } from '@/lib/utils';

describe('cn', () => {
  it('joins multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, 0, 'b')).toBe('a b');
  });

  it('returns empty string for all falsy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  it('handles a single class', () => {
    expect(cn('only')).toBe('only');
  });
});

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('returns unique values on successive calls', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId));
    expect(ids.size).toBe(100);
  });

  it('contains a hyphen separator', () => {
    expect(generateId()).toContain('-');
  });
});

describe('formatTimestamp', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatTimestamp('2025-06-13T10:30:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the year in the output', () => {
    const result = formatTimestamp('2025-06-13T10:30:00.000Z');
    expect(result).toMatch(/2025/);
  });
});

describe('daysUntil', () => {
  it('returns 0 for a past date', () => {
    expect(daysUntil('2000-01-01')).toBe(0);
  });

  it('returns a positive number for a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(daysUntil(future.toISOString())).toBeGreaterThan(0);
  });

  it('never returns a negative value', () => {
    expect(daysUntil('1990-01-01')).toBeGreaterThanOrEqual(0);
  });
});
