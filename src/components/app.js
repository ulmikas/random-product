import {h, Component } from 'preact';
import Product from './Product';
// import { titles } from '../texts';

const Ecwid = window.Ecwid;

class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      rp: this.props.items,
    };
  }

  componentWillMount() {
    Ecwid.OnPageLoad.add((page) => {
      this.setState({
        rp: this.props.rpUpdate(this.props.products, this.props.count)
      });
    });
  }

  render() {
    const title = this.props.title || '';
    return (
      <div id="random-products-wrapper" className={(this.state.rp.length) ? 'random-products-wrapper' : 'random-products-wrapper--empty'}>
        <div className="random-products__title">{title}</div>
        <div id="random-products__list">
          {this.state.rp.map(item =>
            <Product
              key={item}
              url={`https://app.ecwid.com/api/v3/${this.props.settings.storeId}/products/${item}?token=${this.props.settings.token}`}
              id={item}
            />)}
        </div>
      </div>
    );
  }

}

export default App;
