import 'es6-promise/auto';
import { h, render } from 'preact';
import './styles/index.css';
import { getProductsIds } from './api';


const randomProductsUpdate = (products, count = 1) => {
  return getRandomProducts(products, count);
};

function init(allProducts, rp, appSettings, apiSettings, container) {
	let App = require('./components/app').default;
	render(<App products={allProducts} items={rp} count={appSettings.maxShown} title={appSettings.title} settings={apiSettings} rpUpdate={randomProductsUpdate} />, container);
}

// register ServiceWorker via OfflinePlugin, for prod only:
if (process.env.NODE_ENV==='production') {
	require('./pwa');
}

// in development, set up HMR:
if (module.hot) {
	require('preact/devtools');   // turn this on if you want to enable React DevTools!
	module.hot.accept('./components/app', () => requestAnimationFrame(init));
}

const Ecwid = window.Ecwid;

const getRandomProducts = (products, count = 1) => {
  let productsIds = products;
  let random = [];
  while (random.length < count && productsIds.length) {
    const rand = Math.floor(Math.random() * productsIds.length);
    const randId = productsIds[rand];
    random = [...random, ...randId];
    productsIds = [...productsIds.slice(0, rand), ...productsIds.slice(rand+1)];
  }
  return random;
};

const appInit = async (apiSettings, appSettings) => {
  const products = await getProductsIds(apiSettings.storeId, apiSettings.token);
  const randomProducts = getRandomProducts(products, appSettings.maxShown);

  if (!products || randomProducts.length === 0) {
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
    
    init(products, randomProducts, appSettings, apiSettings, randProductContainer);
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
  const settings = (!jsonConfig || jsonConfig === '') ? { maxShown: 1, place: 'above' } : JSON.parse(jsonConfig);
  
  appInit(apiSettings, settings);

});
