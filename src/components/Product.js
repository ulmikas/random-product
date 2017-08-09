import {h, Component} from 'preact';
import axios from 'axios';

class Product extends Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      url: '',
      img: '',
      price: '',
      visible: true,
    };
  }

  componentWillMount() {
    const self = this;
    axios.get(this.props.url)
      .then(({ data }) => {
        self.setState({
          visible: !!data.name || !!data.priceInProductList,
          name: data.name,
          url: data.url,
          dataurl: ((typeof Wix === 'undefined') ? "#" : "") + "!/p/" + data.id,
          img: data.thumbnailUrl,
          price: Ecwid.formatCurrency(data.priceInProductList),
        });
      });
  }

  render() {
    const visibility = (this.state.visible)? '' : 'display: none;';
    const cln = `random-product random-product--${this.props.id}`;
    return (
      <div className={cln} style={visibility}>
        <a className="random-product__url" data-url={this.state.dataurl} href={this.state.url} onClick={this.onClick}>
          <div className="random-product__thumb">
            <img alt="" src={this.state.img} />
          </div>
          <div className="random-product__name">{this.state.name}</div>
          <div className="random-product__price ecwid-productBrowser-price">
            {this.state.price}
          </div>
        </a>
      </div>
    );
  }

  onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof Wix === 'undefined') {
      document.location.hash = e.currentTarget.dataset.url;
    } else {
      Wix.pushState(e.currentTarget.dataset.url);
    }
  }
}

export default Product;
