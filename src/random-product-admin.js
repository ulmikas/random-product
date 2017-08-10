(() => {
  EcwidApp.init({
    app_id: 'random-products',
    autoloadedflag: true,
    autoheight: true,
  });

  const labels = {
    en: {
      'random-product-title': 'Random Products',
      'random-product-legend': 'Settings',
      'random-product-widget-title': 'Title',
      'random-product-max-shown': 'Max products shown (< 6)',
      'random-product-place': 'Place for Random Products',
      'random-product-save': 'Save',
      'random-product-above': 'Above Storefront',
      'random-product-under': 'Under Storefront',
      'random-product-custom': 'Custom container',
      'random-product-saved': 'Settings were successfully saved!',
      'random-product-custom-selector': 'CSS Selector',
    },
    ru: {
      'random-product-title': 'Случайные товары',
      'random-product-legend': 'Настройки',
      'random-product-widget-title': 'Заголовок',
      'random-product-max-shown': 'Максимальное количество (< 6)',
      'random-product-place': 'Размещение виджета',
      'random-product-save': 'Сохранить',
      'random-product-above': 'Над товарами',
      'random-product-under': 'Под товарами',
      'random-product-custom': 'Другой контейнер',
      'random-product-saved': 'Настройки успешно сохранены!',
      'random-product-custom-selector': 'CSS селектор',
    }
  };

  class Settings {
    constructor(title, limit, place, container) {
      this.maxItems = 5;
      this.maxShown = limit || this.maxItems;
      this.place = place || 'above';
      this.container = container || '.ecwid-productBrowser';
      this.title = title;
    }
  }

  const setLabel = sel => lbls => { document.querySelector('#' + sel).innerText = lbls[sel]; };

  const setLabels = (lbls) => {
    ['random-product-title', 'random-product-legend', 'random-product-max-shown',
    'random-product-place', 'random-product-save', 'random-product-custom-selector',
    'random-product-widget-title']
      .forEach(i => setLabel(i)(lbls));
    document.querySelector('#random-product-place-select').options[0].innerText = lbls['random-product-above'];
    document.querySelector('#random-product-place-select').options[1].innerText = lbls['random-product-under'];
    document.querySelector('#random-product-place-select').options[2].innerText = lbls['random-product-custom'];
  };

  const isBlockShown = el => (value) => {
    el.style.display = (value === 'custom') ?  'block' : 'none';
  };
  const rvpForm = document.forms['random-settings'];
  const customContainer = isBlockShown(document.querySelector('#random-product-custom-selector-container'));
  customContainer(rvpForm['random-product-place-select'].value);
  rvpForm['random-product-place-select'].addEventListener('change', (e) => {
    customContainer(rvpForm['random-product-place-select'].value);
  });

  EcwidApp.getAppStorage('public', (value) => {
    const param = JSON.parse(value);
    const rvpSettings = new Settings(param.title, param.maxShown, param.place, param.container);
    console.log(rvpSettings);

    rvpForm.title.value = rvpSettings.title;
    rvpForm.maximum.value = rvpSettings.maxShown;
    rvpForm.querySelector('#random-product-place-select').value = rvpSettings.place;
    rvpForm.selector.value = rvpSettings.container;
    customContainer(rvpSettings.place);

    rvpForm.maximum.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      rvpForm.maximum.value = (val > 0 && val < 5) ? val : rvpSettings.maxItems;
    });

    rvpForm.selector.addEventListener('change', (e) => {
      if (e.target.value === '') {
        rvpForm.selector.value = '.ecwid-productBrowser';
      }
    });
  });

  const lang = (EcwidApp.getPayload().lang === 'ru') ? 'ru' : 'en';
  setLabels(labels[lang]);

  rvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSettings = {
      title: e.target.title.value,
      maxShown: e.target.maximum.value,
      place: e.target.querySelector('#random-product-place-select').value,
      container: e.target.selector.value,
    };

    EcwidApp.setAppPublicConfig(JSON.stringify(newSettings), () => {
      let alertMsg = document.querySelector('#random-product-settings .random-product-settings-saved-alert');
      if (!alertMsg) {
        alertMsg = document.createElement('div');
        alertMsg.className = 'random-product-settings-saved-alert';
        alertMsg.innerHTML = '<br/><div>' + labels[lang]['random-product-saved'] + '</div>';
        document.querySelector('#random-settings').appendChild(alertMsg);
      }
      setTimeout(() => {
        alertMsg.remove();
      }, 5000);
    });
  });
})();
