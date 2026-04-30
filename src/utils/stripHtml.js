// Map of the HTML entities we expect in medical API text responses.
// Decoded in a single pass so that double-encoded sequences like &amp;lt;
// are only unwrapped one level (producing &lt; in the output, not <).
const ENTITY_MAP = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  nbsp: ' ',
};

export function stripHtml(str) {
  if (!str) return null;
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/gi, (_, e) => ENTITY_MAP[e.toLowerCase()] ?? `&${e};`)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim() || null;
}
