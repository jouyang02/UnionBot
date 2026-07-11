// String formatting utils

export function normalizeWhitespace(s: string): string {
    return s.trim().replace(/\s+/g, ' ');
}