/**
 * Detects crisis-level language in text input.
 * Used on both client (pre-flight check) and server (secondary validation).
 * Returns true when the text warrants immediate safety intervention.
 */

const CRISIS_PATTERNS: RegExp[] = [
  /\b(suicid[ea]?|suicidal)\b/i,
  /\bkill\s+(my\s*self|myself)\b/i,
  /\bend\s+(my\s*life|it\s*all)\b/i,
  /\b(want\s+to|wanna)\s+(die|disappear\s+forever)\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive)\b/i,
  /\bself[\s-]?harm\b/i,
  /\bhurt\s+(my\s*self|myself)\b/i,
  /\bcut\s+(my\s*self|myself)\b/i,
  /\bno\s+(reason|point)\s+to\s+(live|go\s+on)\b/i,
  /\bbetter\s+off\s+(without\s+me|dead)\b/i,
  /\bburden\s+to\s+(every|any)one\b/i,
  /\bcannot\s+go\s+on\b/i,
  /\bgive\s+up\s+on\s+(life|living)\b/i,
];

/**
 * Returns true if the text contains crisis-level language that warrants
 * immediate display of safety resources.
 */
export function detectCrisisLanguage(text: string): boolean {
  const normalized = text.toLowerCase();
  return CRISIS_PATTERNS.some((pattern) => pattern.test(normalized));
}
