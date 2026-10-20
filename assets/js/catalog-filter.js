'use strict';

// Чистые функции фильтрации: используются интерфейсом и проверяются отдельно.
(function (root) {
  const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase('ru').replace(/ё/g, 'е').trim();
  const normalizeArticle = value => normalize(value).replace(/[^\p{L}\p{N}]/gu, '');
  function filterProducts(products, filters) {
    const words = normalize(filters.query).split(/\s+/).filter(Boolean);
    const article = normalizeArticle(filters.article);
    return products.filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.manufacturer && normalize(product.manufacturer) !== normalize(filters.manufacturer)) return false;
      if (article && !normalizeArticle(product.article).includes(article)) return false;
      const text = normalize([product.name, product.article, product.manufacturer].join(' '));
      return words.every(word => text.includes(word) || normalizeArticle(product.article).includes(normalizeArticle(word)) && normalizeArticle(word));
    });
  }
  const api = { normalize, normalizeArticle, filterProducts };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MTG_CATALOG_FILTER = api;
})(typeof window !== 'undefined' ? window : globalThis);
