const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('локальные ссылки и ресурсы всех публичных страниц существуют', () => {
  const missing = [];
  function check(filename, reference) {
    if (!reference || /^(?:[a-z]+:|#|\/\/)/i.test(reference)) return;
    const relative = decodeURIComponent(reference.split(/[?#]/)[0]);
    if (relative && !fs.existsSync(path.resolve(path.dirname(filename), relative))) {
      missing.push(path.relative(root, filename) + ': ' + reference);
    }
  }
  for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
    const filename = path.join(root, name);
    const html = fs.readFileSync(filename, 'utf8');
    for (const match of html.matchAll(/(?:href|src|data-certificate)="([^"]+)"/g)) check(filename, match[1]);
    for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
      for (const candidate of match[1].split(',')) check(filename, candidate.trim().split(/\s+/)[0]);
    }
  }
  const cssRoot = path.join(root, 'assets/css');
  for (const name of fs.readdirSync(cssRoot).filter(name => name.endsWith('.css'))) {
    const filename = path.join(cssRoot, name);
    for (const match of fs.readFileSync(filename, 'utf8').matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) check(filename, match[1]);
  }
  assert.deepEqual(missing, []);
});
