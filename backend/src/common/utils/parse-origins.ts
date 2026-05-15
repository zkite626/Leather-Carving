/**
 * Parse a comma-separated origin string (from env vars) into a clean array.
 * Trims whitespace and strips trailing slashes so comparison with request origins is exact.
 */
export function parseOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}
