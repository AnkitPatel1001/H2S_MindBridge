/**
 * Type-safe localStorage service.
 * All reads are SSR-safe (typeof window guard).
 * All writes/reads are wrapped in try/catch to handle storage quota errors.
 */
import type { JournalEntry, UserProfile, ChatMessage } from '@/types';

const KEYS = {
  PROFILE: 'mb_profile',
  ENTRIES: 'mb_entries',
  CHAT: 'mb_chat',
  DRAFT: 'mb_draft',
} as const;

const MAX_CHAT_MESSAGES = 50;

function safeRead<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error(`[Storage] Write failed for key: ${key}`);
  }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // silently ignore
  }
}

// ─── Profile ────────────────────────────────────────────────────────────────
export const profileStorage = {
  get: (): UserProfile | null => safeRead<UserProfile>(KEYS.PROFILE),
  set: (profile: UserProfile): void => safeWrite(KEYS.PROFILE, profile),
  clear: (): void => safeRemove(KEYS.PROFILE),
};

// ─── Journal Entries ─────────────────────────────────────────────────────────
export const entriesStorage = {
  getAll: (): JournalEntry[] => safeRead<JournalEntry[]>(KEYS.ENTRIES) ?? [],

  /** Prepends or updates an entry by ID, then persists. */
  addOrUpdate: (entry: JournalEntry): void => {
    const all = entriesStorage.getAll();
    const idx = all.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      all[idx] = entry;
    } else {
      all.unshift(entry);
    }
    safeWrite(KEYS.ENTRIES, all);
  },

  save: (entries: JournalEntry[]): void => safeWrite(KEYS.ENTRIES, entries),
};

// ─── Chat History ─────────────────────────────────────────────────────────────
export const chatStorage = {
  get: (): ChatMessage[] => safeRead<ChatMessage[]>(KEYS.CHAT) ?? [],
  /** Saves only the most recent messages to prevent unbounded growth. */
  save: (messages: ChatMessage[]): void =>
    safeWrite(KEYS.CHAT, messages.slice(-MAX_CHAT_MESSAGES)),
  clear: (): void => safeRemove(KEYS.CHAT),
};

// ─── Draft ────────────────────────────────────────────────────────────────────
export const draftStorage = {
  get: (): string => safeRead<string>(KEYS.DRAFT) ?? '',
  set: (text: string): void => safeWrite(KEYS.DRAFT, text),
  clear: (): void => safeRemove(KEYS.DRAFT),
};
