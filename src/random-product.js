import 'es6-promise/auto';
import { h, render } from 'preact';
import './styles/index.css';
import { getProductsIds } from './api';

function init(allProducts, appSettings, apiSettings, container) {
  const getRandomProducts = (count = 1) => {
    let productsIds = allProducts;
    let random = [];
    while (random.length < count && productsIds.length) {
      const rand = Math.floor(Math.random() * productsIds.length);
      const randId = productsIds[rand];
      random = [...random, ...randId];
      productsIds = [...productsIds.slice(0, rand), ...productsIds.slice(rand+1)];
    }
    return random;
  };

  const randomProducts = getRandomProducts(appSettings.count);
  if (randomProducts.length === 0) {
    return;
  }

	let App = require('./components/app').default;
  render(<App items={randomProducts} appSettings={appSettings} apiSettings={apiSettings} rpUpdate={getRandomProducts} callback={window.randprod && window.randprod.callback} />, container);
}

const Ecwid = window.Ecwid;

const appInit = async (apiSettings, appSettings) => {
  const products = await getProductsIds(apiSettings.storeId, apiSettings.token, appSettings.category, appSettings.offstock);

  if (!products) {
    return;
  }

  const appTitle = appSettings.title || '';
  const appPlace = appSettings.place || 'above';
  const appContainer = (appSettings.place === 'custom' && appSettings.container) ? appSettings.container : '.ecwid-productBrowser';
  const randProductWrapper = document.querySelector(appContainer);

  if (randProductWrapper) {
    let randProductContainer = document.querySelector('#random-products');
    if (!randProductContainer) {
      randProductContainer = document.createElement('div');
      randProductContainer.id = 'random-products';
    } else {
      randProductContainer.parentElement.remove(randProductContainer);
    }

    if (appPlace === 'above') {
			randProductWrapper.insertBefore(randProductContainer, randProductWrapper.childNodes[0]);
		} else {
			randProductWrapper.appendChild(randProductContainer);
    }
    
    init(products, appSettings, apiSettings, randProductContainer);
  }
};

Ecwid.OnAPILoaded.add(() => {
	const apiSettings = {
		token: Ecwid.getAppPublicToken('random-products'),
		storeId: Ecwid.getOwnerId(),
		lang: Ecwid.getStorefrontLang()
  };

  const appId = 'random-products';
  const jsonConfig = Ecwid.getAppPublicConfig(appId);
  const settings = (!jsonConfig || jsonConfig === '')
    ? { title: '', category: 'all', count: 1, offstock: false, thumbSize: 150, layout: '', place: 'above' }
    : JSON.parse(jsonConfig);
  
  appInit(apiSettings, settings);

});
