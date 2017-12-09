import {h, Component } from 'preact';
import Product from './Product';
import { getProducts } from '../api';

const Ecwid = window.Ecwid;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      prooductsIds: [],
      rp: []
    };
  }

  componentWillMount() {
    const count = parseInt(this.props.appSettings.count, 10);
    const categories = (this.props.appSettings.categories === 'all' || !this.props.appSettings.categories || this.props.appSettings.categories === '')
      ? []
      : this.props.appSettings.categories.split(',').map(i => Number(i));

      getProducts(this.props.apiSettings, this.props.appSettings).then(res => {      
        Ecwid.OnPageLoad.add((page) => {
          this.setState({
            rp: this.getRandomProducts(res, count)
          });
        });
      });
  }

  render() {
    const title = this.props.appSettings.title || '';
    return (
      <div id="random-products-wrapper" className={(this.state.rp.length) ? 'random-products-wrapper' : 'random-products-wrapper--empty'}>
        { (title)
          ? <div className="random-products__title">{title}</div>
          : ''
        }
        <div id="random-products__list">
          {this.state.rp.map(item =>
            <Product
              key={item.id}
              item={item}
              layout={this.props.appSettings.layout}
              thumbSize={this.props.appSettings.thumbnail}
              callback={this.props.callback}
            />)}
        </div>
      </div>
    );
  }

  getRandomProducts = (products = {}, count = 5) => {
    let random = [];
    let pIds = [...products.ids] || [];
    while (random.length < count && pIds.length) {
      const rand = Math.floor(Math.random() * pIds.length);
      const randId = pIds[rand];
      random = [...random, ...products[randId]];
      pIds = [...pIds.slice(0, rand), ...pIds.slice(rand+1)];
    }
    return random;
  };
}

export default App;
