'use strict';

(() => {
  const form = document.querySelector('#catalog-filters');
  if (!form) return;
  const data = window.MTG_CATALOG;
  const categories = new Map(data.categories.map(category => [category.id, category.name]));
  const fields = { query: form.elements.query, category: form.elements.category, article: form.elements.article, manufacturer: form.elements.manufacturer };
  const results = document.querySelector('#catalog-results');
  const status = document.querySelector('#catalog-status');
  const empty = document.querySelector('#catalog-empty');
  const examples = document.querySelector('#catalog-placeholder-groups');
  const themeLinks = document.querySelectorAll('[data-filter-category]');
  let currentPage = 1;
  const pageSize = 12;
  const pagination = document.querySelector('#catalog-pagination');

  function addOption(select, value, label) {
    const option = document.createElement('option');
    option.value = value; option.textContent = label; select.append(option);
  }
  data.categories.forEach(category => addOption(fields.category, category.id, category.name));
  [...new Set([...data.manufacturers, ...data.products.map(product => product.manufacturer).filter(Boolean)])]
    .sort((a, b) => a.localeCompare(b, 'ru')).forEach(name => addOption(fields.manufacturer, name, name));

  const readFilters = () => Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value.trim()]));
  function readLocation() {
    const params = new URLSearchParams(location.search);
    for (const [key, field] of Object.entries(fields)) field.value = params.get(key === 'query' ? 'q' : key) || '';
    if (!params.has('category') && categories.has(location.hash.slice(1))) fields.category.value = location.hash.slice(1);
    currentPage = Math.max(1, Number.parseInt(params.get('page'), 10) || 1);
  }
  function updateLocation(filters) {
    const url = new URL(location.href);
    url.search = ''; url.hash = '';
    for (const [key, value] of Object.entries(filters)) if (value) url.searchParams.set(key === 'query' ? 'q' : key, value);
    if (currentPage > 1) url.searchParams.set('page', currentPage);
    try { history.replaceState(null, '', url); } catch { /* Фильтры работают и без History API. */ }
  }
  function safeUrl(value) {
    if (!value || typeof value !== 'string') return null;
    try {
      const url = new URL(value, location.href);
      if (!['http:', 'https:', 'file:'].includes(url.protocol)) return null;
      if (url.username || url.password || url.protocol === 'file:' && (location.protocol !== 'file:' || url.origin !== location.origin || !url.href.startsWith(new URL('.', location.href).href))) return null;
      return value;
    } catch { return null; }
  }
  function textElement(tag, text, className) {
    const element = document.createElement(tag); element.textContent = text;
    if (className) element.className = className; return element;
  }
  function productCard(product) {
    const card = document.createElement('article'); card.className = 'catalog-product';
    const image = document.createElement('img'); image.src = safeUrl(product.image) || 'assets/images/placeholder.svg'; image.alt = product.name; image.loading = 'lazy'; image.width = 320; image.height = 200;
    image.addEventListener('error', () => { image.src = 'assets/images/placeholder.svg'; }, { once: true });
    card.append(image, textElement('p', product.manufacturer || categories.get(product.category), 'catalog-product__brand'));
    const title = document.createElement('h3');
    const url = safeUrl(product.url);
    if (url) { const link = document.createElement('a'); link.href = url; link.textContent = product.name; title.append(link); } else title.textContent = product.name;
    card.append(title, textElement('p', 'Артикул: ' + (product.article || 'уточняется'), 'catalog-product__article'));
    if (product.description) card.append(textElement('p', product.description, 'catalog-product__description'));
    const button = textElement('button', 'Заказать →', 'button'); button.type = 'button';
    button.addEventListener('click', () => document.dispatchEvent(new CustomEvent('mtg:order', { detail: { title: [product.name, product.article].filter(Boolean).join(' · ') } })));
    card.append(button); return card;
  }
  function render(writeUrl = true) {
    const filters = readFilters();
    const matches = window.MTG_CATALOG_FILTER.filterProducts(data.products, filters);
    const totalPages = Math.max(1, Math.ceil(matches.length / pageSize)); currentPage = Math.min(currentPage, totalPages);
    results.replaceChildren(); pagination.replaceChildren();
    matches.slice((currentPage - 1) * pageSize, currentPage * pageSize).forEach(product => results.append(productCard(product)));
    const hasSpecificQuery = Boolean(filters.query || filters.article || filters.manufacturer);
    examples.hidden = data.products.length > 0 || hasSpecificQuery;
    examples.querySelectorAll('[data-placeholder-category]').forEach(group => { group.hidden = Boolean(filters.category && group.dataset.placeholderCategory !== filters.category); });
    results.hidden = matches.length === 0;
    empty.hidden = matches.length > 0 || !hasSpecificQuery && data.products.length === 0;
    empty.querySelector('h2').textContent = data.products.length ? 'По вашему запросу ничего не найдено' : 'Каталог пока наполняется';
    empty.querySelector('p').textContent = data.products.length ? 'Измените название, артикул, категорию или производителя. Также можно отправить запрос на подбор.' : 'Товарные данные ещё не добавлены. Мы можем помочь с подбором по телефону или через форму запроса.';
    status.textContent = data.products.length ? `Найдено товаров: ${matches.length}${matches.length ? `. Страница ${currentPage} из ${totalPages}` : ''}.` : `Товары готовятся к публикации.${filters.category ? ' Выбрана категория: ' + categories.get(filters.category) + '.' : ''}`;
    themeLinks.forEach(link => link.setAttribute('aria-pressed', String(link.dataset.filterCategory === filters.category)));
    if (totalPages > 1) {
      const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1].filter(page => page >= 1 && page <= totalPages));
      let previousPage = 0;
      for (const page of [...pages].sort((a, b) => a - b)) {
        if (page - previousPage > 1) pagination.append(textElement('span', '…'));
        const button = textElement('button', String(page), 'catalog-page'); button.type = 'button'; button.setAttribute('aria-label', 'Страница ' + page);
        if (page === currentPage) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', () => { currentPage = page; render(); status.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
        pagination.append(button); previousPage = page;
      }
    }
    if (writeUrl) updateLocation(filters);
  }
  form.addEventListener('submit', event => { event.preventDefault(); currentPage = 1; render(); });
  form.addEventListener('reset', () => { setTimeout(() => { currentPage = 1; render(); }, 0); });
  [fields.category, fields.manufacturer].forEach(field => field.addEventListener('change', () => { currentPage = 1; render(); }));
  themeLinks.forEach(link => link.addEventListener('click', () => { fields.category.value = link.dataset.filterCategory; currentPage = 1; render(); }));
  window.addEventListener('popstate', () => { readLocation(); render(false); });
  window.addEventListener('hashchange', () => { readLocation(); render(false); });
  readLocation(); render(false);
})();
