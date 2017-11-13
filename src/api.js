import axios from 'axios';

const urlAPI = 'https://app.ecwid.com/api/v3/';
const limit = 100;
const maxRequests = 5;

const getUrl = (storeId, token) => `${urlAPI}${storeId}/products?enabled=true&token=${token}`;
const getCatUrl = (storeId, token) => `${urlAPI}${storeId}/categories?token=${token}`;

const inCategories = (cats, ids, frontpage) => ((cats.indexOf(0) > -1 && frontpage > 0) ||
  cats.filter(i => ids.indexOf(i) > -1).length > 0);

// get random int in range
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// get random offset
const getRandomOffset = (total) => getRandomInt(limit + 1, total - limit);

// get random category
const getRandomCategory = (length) => getRandomInt(0, length - 1);

// shuffle array
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// remove duplicates
const normalize = arr => {
  return arr.reduce((acc, cur) => {
    const ids = acc.ids || [];
    if (!acc.hasOwnProperty(cur.id)) {
      acc = { ...acc, ids: [...ids, cur.id], [cur.id]: cur };
    }
    return acc;
  }, {});
};

const getAllCategories = async (storeSettings) => {
  let offset = 0;
  let cats = [];
  let promises = [];

  const firstRequest = await axios
    .get(`${getCatUrl(storeSettings.storeId, storeSettings.token)}&offset=${offset}`)
    .then(response => response.data);

  cats = [...cats, ...firstRequest.items];
  offset += limit;

  while (offset < firstRequest.total && offset < limit * maxRequests ) {
    const catsMore = axios
      .get(`${getCatUrl(storeSettings.storeId, storeSettings.token)}&offset=${offset}`);
    promises = [...promises, ...catsMore];
    offset += limit;
  }
  const allCategories = await axios.all(promises).then(res => {
    return res.reduce((acc, cur) => [...acc, ...cur.data.items], []);
  });
  return [...firstRequest.items, ...allCategories].map(i => i.id);
};

// get additional products
const getMoreProducts = async (storeId, token, offstock, total, categories) => {
  const loopEnd = a => (categories) ? a < total + 1 : a * limit < total;
  let Promises = [];
  let inStock = (offstock) ? '' : '&inStock=true';
  for (let i = 1; i < maxRequests && loopEnd(i); i++) {
    const offset = (categories) ? `category=${categories[i-1]}` : `offset=${limit * i}`;
    const products = axios
      .get(`${getUrl(storeId, token)}&${offset}${inStock}`);
    Promises = [...Promises, ...products];
  }
  const moreProducts = await axios.all(Promises).then(res => {
    return res.reduce((acc, cur) => [...acc, ...cur.data.items], []);
  });
  return moreProducts;
};

const getProducts = async (storeSettings, appSettings) => {
  let offset = 0;
  let items = [];
  let promises = [];
  const inStock = (appSettings.offstock) ? '' : '&inStock=true';
  const categories = (appSettings.categories === 'all') ? await getAllCategories(storeSettings) : appSettings.categories.split(",").map(i => Number(i));
  const firstRequest = await axios
    .get(`${getUrl(storeSettings.storeId, storeSettings.token)}&offset=${offset}${inStock}`)
    .then(response => response.data);

  items = [...items, ...firstRequest.items];
  
  if (firstRequest.total <= limit * maxRequests) {
    const restProducts = await getMoreProducts(storeSettings.storeId, storeSettings.token, appSettings.offstock, firstRequest.total);
    items = [...items, ...restProducts];
    if (categories.length) {
      items = [...items.filter(i => inCategories(categories, i.categoryIds, i.showOnFrontpage))];
    }
    return normalize(items);
  }

  if (categories.length) {
    const catsPorducts = await getMoreProducts(storeSettings.storeId, storeSettings.token, appSettings.offstock, categories.length, categories);
    return normalize([...items, ...catsPorducts].filter(i => inCategories(categories, i.categoryIds, i.showOnFrontpage)));
  }

  const secondRequest = await axios
    .get(`${getUrl(storeSettings.storeId, storeSettings.token)}&offset=${getRandomOffset(firstRequest.total)}${inStock}`)
    .then(response => response.data);
  return normalize([...items, ...secondRequest.items]);
};

export { getProducts };
