import { describe, it, expect, beforeEach } from 'vitest';
import { profileStorage, entriesStorage, chatStorage, draftStorage } from '@/lib/storage';
import type { UserProfile, JournalEntry, ChatMessage, MoodLevel } from '@/types';

const makeProfile = (): UserProfile => ({
  name: 'Ankit',
  exam: 'JEE',
  targetDate: '2026-04-01',
  createdAt: new Date().toISOString(),
});

const makeEntry = (id: string, mood: MoodLevel = 3): JournalEntry => ({
  id,
  text: `Entry ${id}`,
  mood,
  tags: [],
  timestamp: new Date().toISOString(),
});

beforeEach(() => {
  localStorage.clear();
});

describe('profileStorage', () => {
  it('returns null when nothing is stored', () => {
    expect(profileStorage.get()).toBeNull();
  });

  it('stores and retrieves a profile', () => {
    const p = makeProfile();
    profileStorage.set(p);
    expect(profileStorage.get()).toEqual(p);
  });

  it('clears the stored profile', () => {
    profileStorage.set(makeProfile());
    profileStorage.clear();
    expect(profileStorage.get()).toBeNull();
  });

  it('overwrites an existing profile', () => {
    profileStorage.set(makeProfile());
    const updated = { ...makeProfile(), name: 'Rahul' };
    profileStorage.set(updated);
    expect(profileStorage.get()?.name).toBe('Rahul');
  });
});

describe('entriesStorage', () => {
  it('returns empty array when nothing is stored', () => {
    expect(entriesStorage.getAll()).toEqual([]);
  });

  it('prepends a new entry', () => {
    entriesStorage.addOrUpdate(makeEntry('e1'));
    expect(entriesStorage.getAll()).toHaveLength(1);
  });

  it('updates an existing entry by id', () => {
    entriesStorage.addOrUpdate(makeEntry('e1', 2));
    entriesStorage.addOrUpdate({ ...makeEntry('e1', 5 as MoodLevel), text: 'updated' });
    const all = entriesStorage.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].mood).toBe(5);
    expect(all[0].text).toBe('updated');
  });

  it('prepends newer entries first', () => {
    entriesStorage.addOrUpdate(makeEntry('first'));
    entriesStorage.addOrUpdate(makeEntry('second'));
    expect(entriesStorage.getAll()[0].id).toBe('second');
  });

  it('saves a full array directly', () => {
    entriesStorage.save([makeEntry('a'), makeEntry('b')]);
    expect(entriesStorage.getAll()).toHaveLength(2);
  });
});

describe('chatStorage', () => {
  const makeMsg = (role: 'user' | 'assistant', n: number): ChatMessage => ({
    id: `m${n}`,
    role,
    content: `Message ${n}`,
    timestamp: new Date().toISOString(),
  });

  it('returns empty array when nothing is stored', () => {
    expect(chatStorage.get()).toEqual([]);
  });

  it('saves and retrieves messages', () => {
    chatStorage.save([makeMsg('user', 1), makeMsg('assistant', 2)]);
    expect(chatStorage.get()).toHaveLength(2);
  });

  it('caps stored messages at 50', () => {
    const msgs = Array.from({ length: 60 }, (_, i) => makeMsg('user', i));
    chatStorage.save(msgs);
    expect(chatStorage.get()).toHaveLength(50);
  });

  it('clears messages', () => {
    chatStorage.save([makeMsg('user', 1)]);
    chatStorage.clear();
    expect(chatStorage.get()).toEqual([]);
  });
});

describe('draftStorage', () => {
  it('returns empty string when nothing is stored', () => {
    expect(draftStorage.get()).toBe('');
  });

  it('stores and retrieves a draft string', () => {
    draftStorage.set('my draft');
    expect(draftStorage.get()).toBe('my draft');
  });

  it('clears the draft', () => {
    draftStorage.set('hello');
    draftStorage.clear();
    expect(draftStorage.get()).toBe('');
  });

  it('overwrites the previous draft', () => {
    draftStorage.set('first');
    draftStorage.set('second');
    expect(draftStorage.get()).toBe('second');
  });
});
