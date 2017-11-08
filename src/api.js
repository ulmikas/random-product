import axios from 'axios';

const urlAPI = 'https://app.ecwid.com/api/v3/';
const maxProducts = 100;
const maxCategories = 100;

const getUrl = (storeId, token) => `${urlAPI}${storeId}/products?enabled=true&token=${token}`;

const getTotalCount = async (storeId, token) => {
  const total = await axios
    .get(`${getUrl(storeId, token)}&limit=1`)
    .then(response => response.data.total);
  return total;
};

const inCategories = (cats, ids, frontpage) => {
  if (cats.indexOf(0) > -1 && frontpage > 0) {
    return true;
  }
  const intersection = cats.filter(i => ids.indexOf(i) > -1);
  return intersection.length > 0;
};

const getAllProducts = async (storeId, token, offstock) => {
  let offset = 0;
  let items = [];
  let promises = [];
  const totalProducts = await getTotalCount(storeId, token);
  const inStock = (offstock) ? '' : '&inStock=true';
  do {
    const products = axios
      .get(`${getUrl(storeId, token)}&offset=${offset}${inStock}&limit=${maxProducts}`)
      .then(response => response.data.items);
    promises = [...promises, ...products];
    offset += maxProducts;
  } while (totalProducts > offset);
  items = await Promise.all(promises);
  return items.reduce((prev, cur) => [...prev, ...cur], []);
};

const getProductsIds = async (storeId, token, categories, offstock) => {
  try {
    const products = await getAllProducts(storeId, token, offstock)
      .then(products => products.reduce((akk, cur) => {
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

export { getProductsIds };
