(() => {
	EcwidApp.init({
		app_id: 'random-products',
		autoloadedflag: true,
		autoheight: true
	});

	const lang = EcwidApp.getPayload().lang === 'ru' ? 'ru' : 'en';

	const labels = {
		en: {
			'random-product-title': 'Random Products',
			'random-product-widget-title': 'Title',
			'random-product-widget-placeholder': 'Widget title',
			'random-product-count': 'Number of products shown',
			'random-product-offstock': 'Show out of stock products',
			'random-product-thumbnail': 'Thumbnail size',
			'random-product-place': 'Place for Random Products',
			'random-product-layout': 'Product layout template',
			'random-product-save': 'Save',
			'random-product-above': 'Above Storefront',
			'random-product-under': 'Under Storefront',
			'random-product-custom': 'Custom container',
			'random-product-saved': 'Settings were successfully saved!',
			'random-product-custom-selector': 'CSS Selector',
			'random-product-all-categories': 'All categories',
			'random-product-choose-categories': 'Please choose categories'
		},
		ru: {
			'random-product-title': 'Случайные товары',
			'random-product-widget-title': 'Заголовок',
			'random-product-widget-placeholder': 'Заголовок виджета',
			'random-product-count': 'Количество показываемых товаров',
			'random-product-offstock': 'Показвать товары, которых нет в наличии',
			'random-product-thumbnail': 'Размер картинок',
			'random-product-place': 'Размещение виджета',
			'random-product-layout': 'Шаблон виждета',
			'random-product-save': 'Сохранить',
			'random-product-above': 'Над товарами',
			'random-product-under': 'Под товарами',
			'random-product-custom': 'Другой контейнер',
			'random-product-saved': 'Настройки успешно сохранены!',
			'random-product-custom-selector': 'CSS селектор',
			'random-product-all-categories': 'Все категории',
			'random-product-choose-categories': 'Пожалуйста, выберите категории'
		}
	};

	const settings = {
		title: 'Other cool products',
		categories: 'all',
		count: 5,
		offstock: false,
		thumbnail: 150,
		place: 'above',
		container: '.ecwid-productBrowser',
		layout: '<a href="{link}">\n\t{img}\n\t{name}\n\t{price}\n</a>'
	};

	const createCatItem = cat =>
		`<li><label for='${cat.id}'><input type='checkbox' name='${cat.name}' id='${cat.id}' ${cat.checked ? 'checked' : ''} /> ${cat.name}</label></li>`;

	const syncCategories = (value) => {
		const inputs = [].slice.call(document.querySelectorAll('.selected-categories .list-dropdown input'));
		const valArr = value.split(',');
		if (inputs && inputs.length) {
			inputs.forEach(i => {
				i.checked = valArr.indexOf('' + i.id) > -1 || value === 'all';
			});
			document.querySelector('.selected-categories__status').innerHTML =
				(inputs[0].checked) ? labels[lang]['random-product-all-categories'] : inputs.map(j => (j.checked) ? j.name : '').filter(i => i !== '').join(', ');
		}
	};

	const createSelectorCategories = cats => {
		const selectAll = (onOff) => {
			inputs.map(i => i.checked = onOff);
		};
		const setAllSelected = () => {
			inputs[0].checked = inputs.filter(i => i.id !== 'all' && !i.checked).length === 0;
		};
		const setCatsStatus = () => {
			if (inputs[0].checked) {
				selectorCategoriesStatus.innerHTML =  labels[lang]['random-product-all-categories'];
			} else {
				let cats = inputs.map(j => (j.checked) ? j.name : '').filter(i => i !== '');
				if (cats.length) {
					selectorCategoriesStatus.innerHTML = cats.join(', ');
				} else {
					selectorCategoriesStatus.innerHTML = `<b style="color: red;">${labels[lang]['random-product-choose-categories']}</b>`;
				}
			}
			catsInput.value = (inputs[0].checked) ? 'all' : inputs.map(j => (j.checked) ? j.id : '').filter(i => i !== '').join(',');
		};
		const updateStatus = (e) => {
			if (e.target.id === 'all') {
				selectAll(e.target.checked);
			} else {
				setAllSelected();
			}
			setCatsStatus();
		};
	
		const catsInput = document.querySelector('#random-settings input[name=categories]');
		const selectorCategories = document.querySelector('.selected-categories');
		const selectorCategoriesStatus = document.createElement('div');
		selectorCategoriesStatus.className = 'selected-categories__status';
		selectorCategories.appendChild(selectorCategoriesStatus);

		const categoriesList = document.createElement('div');
		categoriesList.className = 'list-dropdown';
		
		let allCategoriesToggler = createCatItem({ id: 'all', name: labels[lang]['random-product-all-categories'], checked: true });
		let categoriesItems = createCatItem({ id: 0, name: 'Store Front Page' });
		for (const catId in cats) {
			if (cats.hasOwnProperty(catId)) {
				categoriesItems += createCatItem(cats[catId]);
			}
		}

		const setOutsideClick = () => {
			const catList = document.querySelector('.list-dropdown');
			const outsideClick = (e) => {
				if (!e.target.closest('.selected-categories')) {
					catList.classList.remove('opened');
					document.body.removeEventListener('click', outsideClick);
				}
			};
			document.body.addEventListener('click', outsideClick);
		};

		categoriesList.innerHTML = '<ul>' + allCategoriesToggler + categoriesItems + '</ul>';
		selectorCategories.appendChild(categoriesList);

		const inputs = [].slice.call(categoriesList.querySelectorAll('input'));
		inputs.forEach((i) => {
			i.addEventListener('change', updateStatus);
		});

		selectorCategoriesStatus.addEventListener('click', () => {
			categoriesList.classList.toggle('opened');
			if (categoriesList.classList.contains('opened')) {
				setOutsideClick();
			}
		});

		selectAll(inputs, true);
		setCatsStatus();
	};

	const getStoreId = () => EcwidApp.getPayload().store_id;
	const getToken = () => EcwidApp.getPayload().access_token;
	const urlAPI = (offset, maxCategories) =>
		`https://app.ecwid.com/api/v3/${getStoreId()}/categories?token=${getToken()}&productIds=true&offset=${offset}&limit=${maxCategories}`;

	const parseCategories = cats =>
		cats.reduce((p, c) => {
			if (!c.productIds) {
				return p;
			}
			return {
				...p,
				[c.id]: {
					id: c.id,
					name: c.name,
					pIds: c.productIds || []
				}
			};
		}, {});

	const getCategories = (offset, maxCategories) =>
		axios.get(urlAPI(offset, maxCategories));

	const maxCategories = 100;
	
	getCategories(0, maxCategories).then(response => {
		let offset = 0;
		let catsRest = [];
		const firstPart = parseCategories(response.data.items);
		const totalCategories = response.data.total;
		while (totalCategories > offset) {
			offset += maxCategories;
			if (offset < totalCategories) {
				catsRest = [...catsRest, ...getCategories(offset, maxCategories)];
			}
		}
		axios.all(catsRest).then(res => {
			const restCats = res.reduce(
				(prev, cur) => ({ ...prev, ...parseCategories(cur.data.items) }),
				{}
			);
			const allCategories = { ...firstPart, ...restCats };
			const data = {
				cats: JSON.stringify(allCategories)
			};
			createSelectorCategories(allCategories);
		});
	});

	const setLabel = sel => lbls => {
		document.querySelector('#' + sel).innerText = lbls[sel];
	};

	const setLabels = lbls => {
		[
			'random-product-title',
			'random-product-widget-title',
			'random-product-count',
			'random-product-offstock',
			'random-product-thumbnail',
			'random-product-place',
			'random-product-layout',
			// 'random-product-save',
			'random-product-custom-selector'
		].forEach(i => setLabel(i)(lbls));
		document.querySelector('#random-product-widget-placeholder').placeholder =
			lbls['random-product-widget-placeholder'];
		document.querySelector(
			'#random-product-place-select'
		).options[0].innerText =
			lbls['random-product-above'];
		document.querySelector(
			'#random-product-place-select'
		).options[1].innerText =
			lbls['random-product-under'];
		document.querySelector(
			'#random-product-place-select'
		).options[2].innerText =
			lbls['random-product-custom'];
	};

	const isBlockShown = el => value => {
		el.style.display = value === 'custom' ? 'block' : 'none';
	};

	const saveSettings = (newSettings, showAlert) => {
		EcwidApp.setAppPublicConfig(JSON.stringify(newSettings), () => {
			if (!showAlert) return;
			const alertMsg = document.querySelector(
				'.random-settings-container .random-product-settings-saved-alert'
			);
			alertMsg.querySelector('.title').innerHTML =
				labels[lang]['random-product-saved'];
			alertMsg.classList.add('random-product-settings-saved-alert--shown');
			setTimeout(() => {
				alertMsg.classList.remove('random-product-settings-saved-alert--shown');
			}, 3000);
		});
	};

	const rvpForm = document.forms['random-settings'];
	const customContainer = isBlockShown(
		document.querySelector('#random-product-custom-selector-container')
	);
	customContainer(rvpForm['random-product-place-select'].value);
	rvpForm['random-product-place-select'].addEventListener('change', e => {
		customContainer(rvpForm['random-product-place-select'].value);
	});
	

	EcwidApp.getAppStorage('public', value => {
		const param = (value && JSON.parse(value)) || {};
		const rvpSettings = Object.assign({}, settings, param);

		saveSettings(rvpSettings, false);

		rvpForm.title.value = rvpSettings.title;
		rvpForm.categories.value = rvpSettings.categories || 'all';
		rvpForm.count.value = rvpSettings.count;
		rvpForm.offstock.checked = rvpSettings.offstock;
		rvpForm.thumbnail.value = rvpSettings.thumbnail;
		rvpForm.layout.value = rvpSettings.layout;
		rvpForm.querySelector('#random-product-place-select').value = rvpSettings.place;
		rvpForm.container.value = rvpSettings.container;
		customContainer(rvpSettings.place);

		syncCategories(rvpForm.categories.value);

		['count', 'thumbnail', 'layout', 'container'].map(i => {
			rvpForm[i].addEventListener('change', e => {
				if (e.target.value === '') {
					e.target.value = settings[i];
				}
			});
		});

		document
			.querySelector('.random-settings-container.loading')
			.classList.remove('loading');
	});

	setLabels(labels[lang]);

	rvpForm.addEventListener('submit', e => {
		e.preventDefault();
		const newSettings = {
			title: rvpForm.title.value,
			categories: rvpForm.categories.value,
			count: rvpForm.count.value,
			offstock: rvpForm.offstock.checked,
			thumbnail: rvpForm.thumbnail.value,
			layout: rvpForm.layout.value,
			place: rvpForm.querySelector('#random-product-place-select').value,
			container: rvpForm.container.value
		};
		saveSettings(newSettings, true);
	});
})();
