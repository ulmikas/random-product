import axios from 'axios';

const urlAPI = 'https://app.ecwid.com/api/v3/';
const maxProducts = 100;
const maxCategories = 100;

const getUrl = (storeId, token) => `${urlAPI}${storeId}/products?enabled=true&token=${token}`;

// const getTotalCount = async (storeId, token) => {
//   const total = await axios
//     .get(`${getUrl(storeId, token)}&limit=1`)
//     .then(response => response.data.total);
//   return total;
// };

const inCategories = (cats, ids, frontpage) => {
  console.log(cats, ids, frontpage);
  if (cats.indexOf(0) > -1 && frontpage > 0) {
    console.log('!');
    return true;
  }
  const intersection = cats.filter(i => ids.indexOf(i) > -1);
  return intersection.length > 0;
};

const getAllProducts = async (storeId, token, offstock) => {
  let offset = 0;
  let items = [];
  let promises = [];
  const inStock = (offstock) ? '' : '&inStock=true';
  const firstRequest = await axios
    .get(`${getUrl(storeId, token)}&offset=${offset}${inStock}&limit=${maxProducts}`)
    .then(response => response.data);

  if (firstRequest.total <= maxProducts) {
    return firstRequest.items;
  } else {

  }

  console.log('!!!!', firstRequest);

  // const totalProducts = await getTotalCount(storeId, token);
  
  // do {
  //   const products = axios
  //     .get(`${getUrl(storeId, token)}&offset=${offset}${inStock}&limit=${maxProducts}`)
  //     .then(response => response.data.items);
  //   promises = [...promises, ...products];
  //   offset += maxProducts;
  // } while (totalProducts > offset);
  // items = await Promise.all(promises);
  // return items.reduce((prev, cur) => [...prev, ...cur], []);
};

const getProductsIds = async (storeId, token, categories, offstock) => {
  try {
    const products = await getAllProducts(storeId, token, offstock)
      .then(products => console.log(products) || products.reduce((akk, cur) => {
        if (categories.length === 0 || inCategories(categories, cur.categoryIds, cur.showOnFrontpage)) {
          akk = [...akk, cur.id];
        }
        return akk;
      }, []));

    return products;
  } catch (err) {
    console.log(err);
  }
};





const getProducts = async (storeSettings, appSettings) => {
  let offset = 0;
  let items = [];
  let promises = [];
  const inStock = (appSettings.offstock) ? '' : '&inStock=true';
  const categoriesCount = (appSettings.categories === 'all') ? 0 : appSettings.categories.length;
  const cats = (appSettings.categories === 'all') ? [] : appSettings.categories.split(",").map(i => Number(i));
  const firstRequest = await axios
    .get(`${getUrl(storeSettings.storeId, storeSettings.token)}&offset=${offset}${inStock}&limit=${maxProducts}`)
    .then(response => response.data);

  items = (categoriesCount)
    ? firstRequest.items.filter(i => console.log(i) || inCategories(cats, i.categoryIds, i.showOnFrontpage))
    : firstRequest.items;

  console.log('!?!', items);

  // if (firstRequest.total <= maxProducts) {
  //   return firstRequest.items;
  // }

  if (categoriesCount) {

  }
  const maxRequests = Math.min(parseInt(appSettings.count, 10), categoriesCount);
  console.log(appSettings, requests);
};

export { getProductsIds, getProducts };
