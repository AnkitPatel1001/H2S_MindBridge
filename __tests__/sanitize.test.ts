import { describe, it, expect } from 'vitest';
import {
  stripDangerous,
  sanitizeJournalText,
  sanitizeChatMessage,
  sanitizeName,
  MAX_JOURNAL_LENGTH,
  MAX_CHAT_LENGTH,
} from '@/lib/sanitize';

describe('stripDangerous', () => {
  it('removes HTML tags', () => {
    expect(stripDangerous('<b>bold</b> text')).toBe('bold text');
  });

  it('removes script protocol', () => {
    expect(stripDangerous('javascript:alert(1)')).toBe('alert(1)');
  });

  it('removes null bytes', () => {
    expect(stripDangerous('hello\0world')).toBe('helloworld');
  });

  it('leaves safe text unchanged', () => {
    const text = 'I feel overwhelmed with my JEE preparation today.';
    expect(stripDangerous(text)).toBe(text);
  });
});

describe('sanitizeJournalText', () => {
  it('trims whitespace', () => {
    expect(sanitizeJournalText('  hello  ')).toBe('hello');
  });

  it('caps at MAX_JOURNAL_LENGTH', () => {
    const long = 'a'.repeat(MAX_JOURNAL_LENGTH + 100);
    expect(sanitizeJournalText(long)).toHaveLength(MAX_JOURNAL_LENGTH);
  });

  it('strips dangerous HTML from journal entry', () => {
    expect(sanitizeJournalText('<script>evil()</script>My feelings')).toBe('evil()My feelings');
  });
});

describe('sanitizeChatMessage', () => {
  it('caps at MAX_CHAT_LENGTH', () => {
    const long = 'x'.repeat(MAX_CHAT_LENGTH + 50);
    expect(sanitizeChatMessage(long)).toHaveLength(MAX_CHAT_LENGTH);
  });

  it('trims and strips tags', () => {
    expect(sanitizeChatMessage('  <em>hi</em>  ')).toBe('hi');
  });
});

describe('sanitizeName', () => {
  it('trims and strips HTML from name', () => {
    expect(sanitizeName('  <b>Priya</b>  ')).toBe('Priya');
  });

  it('caps at 100 characters', () => {
    expect(sanitizeName('a'.repeat(200))).toHaveLength(100);
  });
});
