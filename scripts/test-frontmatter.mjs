import assert from 'node:assert/strict';

import { extractFrontmatter } from './frontmatter.mjs';

const expected = 'model: opencode-go/muse-spark-1.2-contributor';

for (const newline of ['\n', '\r\n', '\r']) {
  const document = ['---', expected, '---', 'body'].join(newline);
  assert.equal(extractFrontmatter(document), expected);
  assert.equal(extractFrontmatter(`\uFEFF${document}`), expected);
}

assert.equal(extractFrontmatter('body only'), '');
assert.equal(extractFrontmatter('---\nmodel: incomplete'), '');

console.log('Frontmatter newline/BOM regression tests passed.');
