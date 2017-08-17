import axios from 'axios';

const urlAPI = 'https://app.ecwid.com/api/v3/';
const maxProducts = 100;

const getUrl = (storeId, token) => `${urlAPI}${storeId}/products?token=${token}&enabled=true`;

const getTotalCount = async (storeId, token) => {
  const total = await axios
    .get(`${getUrl(storeId, token)}&limit=1`)
    .then(response => response.data.total);
  return total;
};

const getAllProducts = async (storeId, token, cat, offstock) => {
  let offset = 0;
  let items = [];
  let promises = [];
  const totalProducts = await getTotalCount(storeId, token);
  const category = (!cat || cat === 'all') ? '' : `&category=${cat}`;
  const inStock = (offstock) ? '' : '&inStock=true';
  do {
    const products = axios
      .get(`${getUrl(storeId, token)}&offset=${offset}${category}${inStock}&limit=${maxProducts}`)
      .then(response => response.data.items);
    promises = [...promises, ...products];
    offset += maxProducts;
  } while (totalProducts > offset);
  items = await Promise.all(promises);
  return items.reduce((prev, cur) => [...prev, ...cur], []);
};

const getProductsIds = async (storeId, token, cat, offstock) => {
  try {
    const products = await getAllProducts(storeId, token, cat, offstock).then(products => products.map(p => p.id));
    return products;
  } catch (err) {
    console.log(err);
  }
};

export { getAllProducts, getProductsIds };
