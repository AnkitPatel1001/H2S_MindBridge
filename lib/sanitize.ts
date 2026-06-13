/**
 * Input sanitization utilities.
 * All user input must pass through these before being used in API calls or storage.
 */

export const MAX_JOURNAL_LENGTH = 5000;
export const MAX_CHAT_LENGTH = 2000;
export const MAX_NAME_LENGTH = 100;

const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_PROTO_RE = /javascript\s*:/gi;
const NULL_BYTE_RE = /\0/g;

/** Strips HTML tags, script protocols, and null bytes from a string. */
export function stripDangerous(input: string): string {
  return input.replace(HTML_TAG_RE, '').replace(SCRIPT_PROTO_RE, '').replace(NULL_BYTE_RE, '');
}

/** Sanitize and length-cap journal entry text. */
export function sanitizeJournalText(text: string): string {
  return stripDangerous(text.trim()).slice(0, MAX_JOURNAL_LENGTH);
}

/** Sanitize and length-cap a chat message. */
export function sanitizeChatMessage(text: string): string {
  return stripDangerous(text.trim()).slice(0, MAX_CHAT_LENGTH);
}

/** Sanitize a user display name. */
export function sanitizeName(name: string): string {
  return stripDangerous(name.trim()).slice(0, MAX_NAME_LENGTH);
}

/** Sanitize a generic short tag or label string. */
export function sanitizeTag(tag: string): string {
  return stripDangerous(tag.trim()).slice(0, 50);
}
