import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BasketService, BasketItem } from '../../services/basket.service';
import { OrderService } from '../../services/order.service';
import { PizzaVisualComponent } from '../../shared/pizza-visual/pizza-visual';

interface CheckoutForm {
  fullName: string;
  orderNotes: string;
  tip: number;
  fulfillment: 'pickup' | 'delivery';
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  postalCode: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, PizzaVisualComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  basketItems: BasketItem[] = [];
  form: CheckoutForm = {
    fullName: '',
    orderNotes: '',
    tip: 0,
    fulfillment: 'pickup',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    postalCode: '',
  };

  subtotal = 0;
  tip = 0;
  discountAmount = 0;
  deliveryFee = 0;
  total = 0;
  selectedTip: number | null = null;
  tipOptions = [0, 1, 2, 5];
  readonly DELIVERY_FEE = 2.50;

  constructor(
    private basketService: BasketService,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.basketService.basket$.subscribe(items => {
      this.basketItems = items;
      this.calculateTotals();
    });
  }

  calculateTotals() {
    this.subtotal = this.basketService.getTotalPrice();
    this.tip = this.form.tip;
    this.deliveryFee = this.form.fulfillment === 'delivery' ? this.DELIVERY_FEE : 0;
    
    // 100% off interim demo discount
    this.discountAmount = this.subtotal;
    this.total = this.subtotal - this.discountAmount + this.deliveryFee + this.tip;
  }

  setFulfillment(type: 'pickup' | 'delivery') {
    this.form.fulfillment = type;
    this.calculateTotals();
  }

  selectTip(amount: number) {
    this.selectedTip = this.selectedTip === amount ? null : amount;
    this.form.tip = this.selectedTip || 0;
    this.calculateTotals();
  }

  removeItem(id: string) {
    this.basketService.removeItem(id);
  }

  getSizeLabel(size: string): string {
    return size + '"';
  }

  getToppingsList(toppings: { [key: string]: number }, divided: boolean): string {
    const toppingNames: { [key: string]: string } = {
      pepperoni: 'Pepperoni',
      bacon: 'Bacon',
      ham: 'Ham',
      mushroom: 'Mushrooms',
      spicy_beef: 'Spicy Beef',
      olive: 'Olives',
      jalapeno: 'Jalapeños',
    };

    const activeToppings = Object.entries(toppings)
      .filter(([_, count]) => count > 0)
      .map(([key, count]) => `${toppingNames[key]} [x${count}]`)
      .join(', ');

    return activeToppings || 'No toppings';
  }

  convertToppingsToArray(toppings: { [key: string]: number }): string[] {
    return Object.entries(toppings)
      .filter(([_, count]) => count > 0)
      .flatMap(([key, count]) => Array(count).fill(key));
  }

  submitOrder() {
    if (!this.form.fullName.trim()) {
      alert('Please enter your full name');
      return;
    }

    if (this.form.fulfillment === 'delivery') {
      if (!this.form.addressLine1.trim() || !this.form.city.trim() || !this.form.postalCode.trim()) {
        alert('Please fill in all required address fields');
        return;
      }
    }

    this.orderService.createOrder(
      this.form.fullName,
      this.form.orderNotes,
      this.form.fulfillment,
      {
        line1: this.form.addressLine1,
        line2: this.form.addressLine2,
        line3: this.form.addressLine3,
        city: this.form.city,
        postalCode: this.form.postalCode
      },
      this.basketItems,
      this.subtotal,
      this.discountAmount,
      this.deliveryFee,
      this.form.tip,
      this.total
    );

    this.router.navigate(['/tracker']);
  }
}
