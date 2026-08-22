export function extractFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!normalized.startsWith('---\n')) return '';
  const end = normalized.indexOf('\n---', 4);
  return end >= 0 ? normalized.slice(4, end) : '';
}
