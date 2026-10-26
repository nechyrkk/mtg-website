const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const { filterProducts } = require('../assets/js/catalog-filter.js');
const context = { window: {} };
vm.runInNewContext(readFileSync(join(__dirname, '../assets/js/catalog-data.js'), 'utf8'), context);
const data = context.window.MTG_CATALOG;
const report = JSON.parse(readFileSync(join(__dirname, '../catalog-import-report.json'), 'utf8'));

test('импорт сверяется с отчётом без потерянных и повторных ID', () => {
  assert.equal(data.products.length, report.totalProducts);
  assert.equal(report.sourceRows - report.excludedRows.length, report.fullProducts);
  assert.equal(report.fullProducts + report.supplementalProducts, data.products.length);
  assert.equal(new Set(data.products.map(p => p.id)).size, data.products.length);
  assert.equal(data.products.filter(p => !p.article).length, report.missingArticle);
  for (const product of data.products) {
    assert(data.categories.some(category => category.id === product.category));
    assert.equal(typeof product.article, 'string');
    assert(product.name);
    assert(!('price' in product) && !('stock' in product), 'В исходниках нет цен и остатков');
  }
});

test('артикулы полной базы сохраняют ведущие нули и разделители', () => {
  const result = filterProducts(data.products, { article: '02700110002', manufacturer: 'CARMIX' });
  assert.equal(result.length, 1);
  assert.equal(result[0].article, '027.0011.0002');
  assert.equal(result[0].id, 'ЦБ009044');
});
