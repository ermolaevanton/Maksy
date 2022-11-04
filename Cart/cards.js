'use strict';

const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

class List {
    constructor(url, container, list = list2) {
        this.container = container;
        this.list = list;
        this.url = url;
        this.goods = [];
        this.allProducts = [];
        this._init();
    }

    getJson(url) {
        return fetch(url ? url : `${API + this.url}`)
            .then(result => result.json())
            .catch(error => {
                console.log(error);
            })
    }

    handleData(data) {
        this.goods = data;
        this.render();
    }

    calcSum() {
        let sum = 0;
        this.allProducts.forEach(item => {
            sum += item.price;
        });
        console.log(sum);
    }

    render() {
        console.log(this.constructor.name);
        const block = document.querySelector(this.container);
        for (let product of this.goods) {
            const productObj = new this.list[this.constructor.name](product);
            console.log(productObj);
            this.allProducts.push(productObj);
            block.insertAdjacentHTML('beforeend', productObj.render());
        }
    }
}

class Item {
    constructor(el, img = 'https://via.placeholder.com/520x400') {
        this.product_name = el.product_name;
        this.price = el.price;
        this.id_product = el.id_product;
        this.img = img;
    }

    render() {
        return `<div class="product__item" data-id="${this.id_product}">
                    <h3 class="item__header">${this.product_name}</h3>
                    <div class="item__img">
                        <img src="${this.img}" alt="${this.product_name}">
                    </div>
                    <p class="item__price">${this.price}$</p>
                    <button class="item__button"
                        data-id="${this.id_product}"
                        data-name="${this.product_name}"
                        data-price="${this.price}">Купить</button>
                </div>`
    }
}

class ProductsList extends List {
    constructor(cart, container = '.products', url = '/catalogData.json') {
        super(url, container);
        this.cart = cart;
        this.getJson()
            .then(data => this.handleData(data));
    }

    _init() {
        document.querySelector(this.container).addEventListener('click', e => {
            if (e.target.classList.contains('item__button')) {
                this.cart.addProduct(e.target);
            }
        });
    }
}

class ProductItem extends Item { }

class Cart extends List {
    constructor(container = '.cart-block', url = '/getBasket.json') {
        super(url, container);
        this.getJson()
            .then(data => {
                this.handleData(data.contents);
            });
    }

    addProduct(element) {
        this.getJson(`${API}/addToBasket.json`)
            .then(data => {
                if (data.result === 1) {
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product =>
                        product.id_product === productId);
                    if (find) {
                        find.quantity++;
                        this._updateCart(find);
                    } else {
                        let product = {
                            id_product: productId,
                            price: +element.dataset['price'],
                            product_name: element.dataset['name'],
                            quantity: 1
                        }
                        this.goods = [product];
                        this.render();
                    }
                } else {
                    alert('Доступ запрещен!');
                }
            })
    }

    removeProduct(element) {
        this.getJson(`${API}/deleteFromBasket.json`)
            .then(data => {
                if (data.result === 1) {
                    let productId = +element.dataset['id'];
                    let find = this.allProducts
                        .find(product => product.id_product === productId);
                    if (find.quantity > 1) {
                        find.quantity--;
                        this._updateCart(find);
                    } else {
                        this.allProducts
                            .splice(this.allProducts.indexOf(find), 1);
                        document.querySelector(
                            `.cart-item[data-id="${productId}"]`).remove();
                    }
                } else {
                    alert('Error!');
                }
            });
    }

    _updateCart(product) {
        let block = document
            .querySelector(`.cart-item[data-id="${product.id_product}"]`);
        block.querySelector('.product-quantity')
            .textContent = `Quantity: ${product.quantity}`;
        block.querySelector('.product-price')
            .textContent = `${product.quantity * product.price}`;
    }

    _init() {
        document.querySelector('.btn-cart').addEventListener('click', () => {
            document.querySelector(this.container).classList.toggle('hidden');
        });
        document.querySelector(this.container).addEventListener('click', e => {
            if (e.target.classList.contains('cart__x')) {
                this.removeProduct(e.target);
            }
        });
    }
}

class CartItem extends Item {
    constructor(el, img = 'https://via.placeholder.com/520x400') {
        super(el, img);
        this.quantity = el.quantity;
    }

    render() {
        return `<div class="cart-item" data-id="${this.id_product}">
                    <div class="cart__img">
                        <img src="${this.img}" alt="img">
                    </div>
                    <div class="cart__info">
                        <h2 class="cart__title">${this.product_name}</h2>
                        <p class="product-quantity">Count: ${this.quantity}</p>
                        <p>Price: ${this.price}$</p>
                    </div>
                    <div class="cart__right">
                        <button class="cart__x" data-id="${this.id_product}">X</button>
                        <p class="product-price">${this.price * this.quantity}$</p>
                    </div>
                </div>`
    }
}

const list2 = {
    ProductsList: ProductItem,
    Cart: CartItem
};

let cart = new Cart();
let products = new ProductsList(cart);









