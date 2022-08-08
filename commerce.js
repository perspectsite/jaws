import {loadStripe} from '@stripe/stripe-js';

export class CartItem {
    constructor(stripeProdId, productName, productPrice, productImage) {

        this.stripeProdId = stripeProdId;
        this.productName = productName;
        this.productPrice = productPrice;
        this.productImage = productImage;
        var cartProductsLoc = getCartProduct();
        var cartProductsStr = localStorage.getItem(cartProductsLoc);
        if (!cartProductsStr) {
            var cartProducts = {};
        }
        else {
            var cartProducts = JSON.parse(cartProductsStr);
        }

        var itemInCart = this.stripeProdId in cartProducts;
        if (itemInCart) {
            let existingQuantity = Number(cartProducts[this.stripeProdId]['quantity'])
            cartProducts[this.stripeProdId]['quantity'] = existingQuantity + 1;
        }
        else {
            cartProducts[this.stripeProdId] = {};
            cartProducts[this.stripeProdId]['product'] = this.productName;
            cartProducts[this.stripeProdId]['quantity'] = 1;
            cartProducts[this.stripeProdId]['productPrice'] = this.productPrice;
            cartProducts[this.stripeProdId]['productImage'] = this.productImage; 
        }

        SaveItem(cartProductsLoc, JSON.stringify(cartProducts));
        var cartCount = Object.keys(cartProducts).length;
    }
};


export async function checkout(checkoutOrder) {

    let sk = "";
    let perspect = JSON.parse(localStorage.getItem('perspect'));
    if (perspect.site_env == 'live') {
        sk = perspect.spkl;
    }
    else {
        sk = perspect.spkt;
    }

    let said = perspect.said;
    var stripe = await loadStripe(sk, {
        stripeAccount: said,
        });

    const headers = new Headers({
        "content-type": "application/json",
        "content-length": JSON.stringify(checkoutOrder).length
    })

    fetch('/checkout', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({"products" : checkoutOrder}) 
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(session) {

        return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(function(result) {
    // If `redirectToCheckout` fails due to a browser or network
    // error, you should display the localized error message to your
    // customer using `error.message`.
    if (result.error) {
        alert(result.error.message);
    }
    })
    .catch(function(error) {
    console.error('Error:', error);
    });
};


export function updateCartQuantity(stripeProdId, newQuantity) {

    let cartProductsLoc = getCartProduct();
    let cartProductsStr = localStorage.getItem(cartProductsLoc);

    if (!cartProductsStr) {
        var cartProducts = {};
    }
    else {
        var cartProducts = JSON.parse(cartProductsStr);
    }

    var itemInCart = stripeProdId in cartProducts;
    if (itemInCart) {

        if (newQuantity == 0) {
            delete cartProducts[stripeProdId];
        }
        else {
            cartProducts[stripeProdId]['quantity'] = newQuantity;
        }


        SaveItem(cartProductsLoc, JSON.stringify(cartProducts));
    }

}

function SaveItem(name, data) {
    localStorage.setItem(name, data);
};



function getCartProduct() {

    const cartProducts = "cartProducts-live"
    return cartProducts;

}


export function getProductByStripeId(stripeProdId) {

    var local_products =  localStorage.getItem("products");
    var products = JSON.parse(local_products);
    var product = products[stripeProdId];

    return product

}

export function deleteProductsInCartAfterCheckout() {

    var productsInCart = localStorage.removeItem("cartProducts-live");

    return "ok"
}

export function getProductsInCartToCheckout() {

    var products = [];
    var productsInCart = JSON.parse(localStorage.getItem("cartProducts-live"));

    for (var key in productsInCart) {
        var item = {};
        item['stripe_product_id'] = key
        item['quantity'] = productsInCart[key]['quantity'];
        products.push( item );
    }
    return products
}

export function getProductsInCart() {

    var products = [];
    var productsInCart = JSON.parse(localStorage.getItem("cartProducts-live"));

    for (var key in productsInCart) {
        var item = {};
        item['product'] = productsInCart[key]['product'];
        item['quantity'] = productsInCart[key]['quantity'];
        item['image'] = productsInCart[key]['productImage'];
        item['price'] = formatCurrency(productsInCart[key]['productPrice']);
        item['stripeProdId'] = key;
        products.push( item );

    }
    return products
}


export function formatCurrency(num) {
    
    const dollars = new Intl.NumberFormat(`en-US`, {
        currency: `USD`,
        style: 'currency',
    }).format(num);

    return dollars
}

export function getOrderTotals() {

    let order = {};
    order['subtotal'] = 0;
    order['shipping'] = 0.0;
    order['totalItems'] = 0
    
    var productsInCart = JSON.parse(localStorage.getItem("cartProducts-live"));
    for (var key in productsInCart) {
        var itemSubtotal = productsInCart[key]['productPrice'] * productsInCart[key]['quantity'];
        order['subtotal'] += itemSubtotal;
        order['totalItems'] += Number(productsInCart[key]['quantity']);
    }

    // The order of the following is important.
    order['total'] = order['subtotal'] + order['shipping'];
    order['total'] = formatCurrency(order['total']);
    order['subtotal'] = formatCurrency(order['subtotal']);
    order['shipping'] = formatCurrency(0.0);
    return order

}
