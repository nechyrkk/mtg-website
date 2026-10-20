const { test } = require('node:test');
const assert = require('node:assert/strict');
const { filterProducts } = require('../assets/js/catalog-filter.js');
// Изолированные тестовые записи; они не загружаются на сайт.
const products = [
  {name:'Фильтр воздушный',article:'AF-123 45',manufacturer:'Fleetguard',category:'filters'},
  {name:'Фильтр масляный',article:'AB100',manufacturer:'MANN',category:'filters'},
  {name:'Насос гидравлический',article:'HYD-9',manufacturer:'OTHER',category:'hydraulics'}
];
test('сочетание названия, категории, артикула и производителя', () => {
  const result = filterProducts(products,{query:'ФИЛЬТР fleetguard',category:'filters',article:'af12345',manufacturer:'FLEETGUARD'});
  assert.deepEqual(result,[products[0]]);
});
test('несовместимые фильтры не дают ложного совпадения', () => {
  assert.equal(filterProducts(products,{query:'насос',category:'filters'}).length,0);
  assert.equal(filterProducts(products,{article:'AF12345',manufacturer:'MANN'}).length,0);
});
test('сброс возвращает все записи, пустая база не создаёт товары', () => {
  assert.deepEqual(filterProducts(products,{}),products);
  assert.deepEqual(filterProducts([],{query:'Фильтр'}),[]);
});
test('поиск нескольких слов, артикула с разделителями и неизвестных значений', () => {
  assert.deepEqual(filterProducts(products,{query:'AF12345'}),[products[0]]);
  assert.deepEqual(filterProducts(products,{query:'фильтр масляный'}),[products[1]]);
  assert.equal(filterProducts(products,{category:'unknown'}).length,0);
});
