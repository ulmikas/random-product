import {h, Component} from 'preact';
import axios from 'axios';

class Product extends Component {

  constructor(props) {
    super(props);

  }

  componentDidUpdate() {
    const event = document.createEvent('Event');
    event.initEvent('productRendered', true, true);
    this.base.dispatchEvent(event);
  }

  render() {
    const visibility = (!!this.props.item.name || !!this.props.item.priceInProductList)? '' : 'display: none;';
    const cln = `random-product random-product--${this.props.id}`;
  
    return (
      <div className={cln} style={visibility}>
        <div onClick={this.onClick} dangerouslySetInnerHTML={this.makeLayout()} />
      </div>
    );
  }

  makeLayout = () => {
    const values = {
      img: `<span class="random-product__thumb" style="width:${this.props.thumbSize}px; height:${this.props.thumbSize}px;"><img alt="" src=${this.props.item.thumbnailUrl} /></span>`,
      link: this.props.item.url,
      data_link: ((typeof Wix === 'undefined') ? "#" : "") + "!/p/" + this.props.item.id,
      name: `<span class="random-product__name">${this.props.item.name}</span>`,
      price: `<span class="random-product__price ecwid-productBrowser-price">${Ecwid.formatCurrency(this.props.item.priceInProductList)}</span>`,
      click: this.onClick
    };
    
    const classNames = this.props.layout.match(/^<a.*class="(.*?)"/);
    const newClassNames = (classNames) ? `${classNames} random-product__url` : 'random-product__url';
    const layout = this.props.layout.replace(/<a/, `<a class="${newClassNames}" data-url="{data_link}" href="{link}" `);
    const replaceValue = (str, match) => (values[match] || '');

    return { __html: layout.replace(/\{(.*?)\}/g, replaceValue) };
  }

  onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const link = e.currentTarget.querySelector('a.random-product__url');
    if (link) {
      if (typeof Wix === 'undefined') {
        document.location.hash = link.dataset.url;
      } else {
        Wix.pushState(link.dataset.url);
      }
    }
  }
}

export default Product;
