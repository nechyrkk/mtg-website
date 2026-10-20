'use strict';

// Заполняется данными из утверждённой выгрузки. Файл работает и при открытии file://.
window.MTG_CATALOG = {
  categories: [
    { id: 'filters', name: 'Фильтры' },
    { id: 'oils', name: 'Масла и технические жидкости' },
    { id: 'engine', name: 'Детали двигателя' },
    { id: 'hydraulics', name: 'Гидравлика' },
    { id: 'undercarriage', name: 'Ходовая часть' },
    { id: 'electrics', name: 'Электрика' }
  ],
  // Справочник производителей со старого сайта; наличие товаров не заявляется.
  manufacturers: ['AIRTECH', 'AL-KO', 'Aircomfort', 'BERAL', 'Baldwin', 'Cummins', 'Deutz', 'Donaldson', 'FLEETGUARD', 'FORTIR', 'Firestone', 'HOLA', 'Hifi', 'LUBERFINER', 'LUMAG', 'MANN', 'MERITOR', 'MONARK DIESEL', 'MONROE', 'MOOG', 'Magneti Marelli', 'NEOTEC', 'OPTIBELT', 'Pagid', 'Perkins', 'Phantom', 'SF', 'Separ', 'TRUCKTECHNIC'],
  // { id, name, article, manufacturer, category, description, image, url }
  // category — ID из справочника, image/url — относительный адрес или https URL.
  products: []
};
