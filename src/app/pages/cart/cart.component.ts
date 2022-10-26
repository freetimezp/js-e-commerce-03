import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { Cart, CartItem } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html' 
})
export class CartComponent implements OnInit {
  cart: Cart = { items: [{
    product: 'https://via.placeholder.com/150',
    name: 'snikers',
    price: 150,
    quantity: 1,
    id: 1,
  }] };

  dataSource: Array<CartItem> = [];
  
  displayedColumns: Array<string> = [
    'product',
    'name',
    'price',
    'quantity',
    'total',
    'action',
  ];

  constructor(private cartService: CartService, private http: HttpClient) { }
  handler:any = null;


  ngOnInit(): void {
    this.cartService.cart.subscribe((_cart: Cart) => {
      this.cart = _cart;
      this.dataSource = this.cart.items;
    });
    this.loadStripe();
  }

  getTotal(items: Array<CartItem>): number {
    return this.cartService.getTotal(items);
  }

  onClearCart(): void {
    this.cartService.clearCart();
  }

  onRemoveFromCart(item: CartItem): void {
    this.cartService.removeFromCart(item);
  }

  onAddQuanity(item: CartItem): void {
    this.cartService.addToCart(item);
  }

  onRemoveQuantity(item: CartItem): void {
    this.cartService.removeQuantity(item);
  }

  //for local stripe checkout
  onCheckout(): void {
    this.http.post('http://localhost:4242/checkout', {
      items: this.cart.items
    }).subscribe(async(res: any) => {
      let stripe = await loadStripe('pk_test_51LefgQDPAfLGIsDnKSAzk6wz0foRt6xpAV7WAVXe74rMplMOCxiMrTc7tWzLhibr57XgbwWtZLS0LlwCHoNosF1J00wwHrORNH');
      stripe?.redirectToCheckout({
        sessionId: res.id
      });
    });
  }


  //for online stripe checkout
  pay(amount: any): void {
    var handler = (<any>window).StripeCheckout.configure({
      key: 'pk_test_51LefgQDPAfLGIsDnKSAzk6wz0foRt6xpAV7WAVXe74rMplMOCxiMrTc7tWzLhibr57XgbwWtZLS0LlwCHoNosF1J00wwHrORNH',
      locale: 'auto',
      token: function (token: any) {
        // You can access the token ID with `token.id`.
        // Get the token ID to your server-side code for use.
        alert('We get your payment. Wait a call!');
      }
    });
 
    handler.open({
      name: 'Demo Site',
      description: '2 widgets',
      amount: amount * 100,
    });
  }

  loadStripe() {
    if(!window.document.getElementById('stripe-script')) {
      var s = window.document.createElement("script");
      s.id = "stripe-script";
      s.type = "text/javascript";
      s.src = "https://checkout.stripe.com/checkout.js";
      s.onload = () => {
        this.handler = (<any>window).StripeCheckout.configure({
          key: 'pk_test_51LefgQDPAfLGIsDnKSAzk6wz0foRt6xpAV7WAVXe74rMplMOCxiMrTc7tWzLhibr57XgbwWtZLS0LlwCHoNosF1J00wwHrORNH',
          locale: 'auto',
          token: function (token: any) {
            // You can access the token ID with `token.id`.
            // Get the token ID to your server-side code for use.
            alert('Payment Success!!');
          },
        });
      }
       
      window.document.body.appendChild(s);
    }
  }
}
