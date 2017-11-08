import 'es6-promise/auto';
import { h, render } from 'preact';
import './styles/index.css';
import { getProductsIds } from './api';

const appInit = async (apiSettings, appSettings) => {
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

    let App = require('./components/app').default;
    render(<App appSettings={appSettings} apiSettings={apiSettings} callback={window.randprod && window.randprod.callback} />, randProductContainer);
  }
};

const Ecwid = window.Ecwid;
Ecwid.OnAPILoaded.add(() => {
	const apiSettings = {
		token: Ecwid.getAppPublicToken('random-products'),
		storeId: Ecwid.getOwnerId(),
		lang: Ecwid.getStorefrontLang()
  };

  const appId = 'random-products';
  const jsonConfig = Ecwid.getAppPublicConfig(appId);
  const defaultSettings = { title: '', categories: 'all', count: 5, offstock: false, thumbnail: 150, layout: '<a href="{link}">{img}{name}{price}</a>', place: 'above' };
  const settings = (!jsonConfig || jsonConfig === '')
    ? defaultSettings
    : { ...defaultSettings, ...JSON.parse(jsonConfig) };
  appInit(apiSettings, settings);
});
