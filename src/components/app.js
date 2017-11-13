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


  // favorites:{count: 0, displayedCount: "0"}
  // hdThumbnailUrl:"https://dqzrr9k4bjpzk.cloudfront.net/images/7022058/464713340.jpg"
  // id:49734742
  // imageUrl:"https://dqzrr9k4bjpzk.cloudfront.net/default-store/00002-sq.jpg"
  // inStock:true
  // name:"Peach"
  // originalImage:{url: "https://dqzrr9k4bjpzk.cloudfront.net/default-store/00002-sq.jpg", width: 425, height: 425}
  // originalImageUrl:"https://dqzrr9k4bjpzk.cloudfront.net/default-store/00002-sq.jpg"
  // price:8.99
  // priceInProductList:8.99
  // smallThumbnailUrl:"https://dqzrr9k4bjpzk.cloudfront.net/images/7022058/464713335.jpg"
  // thumbnailUrl:"https://dqzrr9k4bjpzk.cloudfront.net/images/7022058/464713328.jpg"
  // url:"https://store7022058.ecwid.com/#!/Peach/p/49734742"

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
