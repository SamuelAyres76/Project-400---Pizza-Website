import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BasketService } from '../../services/basket.service';

interface PizzaState {
  size: string;
  sauce: string;
  cheese: string;
  divided: boolean;
  toppingsHalf1: { [key: string]: number };
  toppingsHalf2: { [key: string]: number };
}

interface Topping {
  label: string;
  value: string;
  countHalf1: number;
  countHalf2: number;
}

@Component({
  selector: 'app-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './create.html',
  styleUrl: './create.css',
})
export class CreateComponent implements OnInit {
  /****************************************/
  /* Component State */
  /****************************************/
  pizza: PizzaState = {
    size: '12',
    sauce: 'margharita',
    cheese: 'mozzarella',
    divided: false,
    toppingsHalf1: {
      pepperoni: 0,
      bacon: 0,
      ham: 0,
      mushroom: 0,
      spicy_beef: 0,
      olive: 0,
      jalapeno: 0,
    },
    toppingsHalf2: {
      pepperoni: 0,
      bacon: 0,
      ham: 0,
      mushroom: 0,
      spicy_beef: 0,
      olive: 0,
      jalapeno: 0,
    },
  };

  isBouncing = false;

  sizes = [
    { label: '10"', value: '10', price: '€8.99' },
    { label: '12"', value: '12', price: '€9.99' },
    { label: '14"', value: '14', price: '€11.99' },
  ];

  sauces = [
    { label: 'Margherita', value: 'margharita' },
    { label: 'BBQ', value: 'bbq' },
    { label: 'White Garlic', value: 'white' },
  ];

  cheeses = [
    { label: 'Mozzarella', value: 'mozzarella' },
    { label: 'Parmesan', value: 'parmesan' },
    { label: 'Cheddar', value: 'cheddar' },
  ];

  allToppings: Topping[] = [
    { label: 'Pepperoni', value: 'pepperoni', countHalf1: 0, countHalf2: 0 },
    { label: 'Bacon', value: 'bacon', countHalf1: 0, countHalf2: 0 },
    { label: 'Ham', value: 'ham', countHalf1: 0, countHalf2: 0 },
    { label: 'Mushrooms', value: 'mushroom', countHalf1: 0, countHalf2: 0 },
    { label: 'Spicy Beef', value: 'spicy_beef', countHalf1: 0, countHalf2: 0 },
    { label: 'Olives', value: 'olive', countHalf1: 0, countHalf2: 0 },
    { label: 'Jalapeños', value: 'jalapeno', countHalf1: 0, countHalf2: 0 },
  ];

  constructor(private router: Router, private basketService: BasketService) {}

  /****************************************/
  /* Lifecycle */
  /****************************************/
  ngOnInit() {
    this.loadPreset();
  }

  /****************************************/
  /* Preset Loading */
  /****************************************/
  loadPreset() {
    const state = window.history.state;
    if (state && state.preset) {
      const preset = state.preset;
      if (preset.toppings && Array.isArray(preset.toppings)) {
        preset.toppings.forEach((topping: any) => {
          const toppingValue = typeof topping === 'string' ? topping : topping.value;
          const count = typeof topping === 'string' ? 1 : (topping.count || 1);
          this.pizza.toppingsHalf1[toppingValue] = count;
          const toppingObj = this.allToppings.find(t => t.value === toppingValue);
          if (toppingObj) {
            toppingObj.countHalf1 = count;
          }
        });
      }
      this.triggerBounce();
    }
  }

  /****************************************/
  /* Builder Actions */
  /****************************************/
  selectSize(size: string) {
    this.pizza.size = size;
    this.triggerBounce();
  }

  selectSauce(sauce: string) {
    this.pizza.sauce = sauce;
    this.triggerBounce();
  }

  selectCheese(cheese: string) {
    this.pizza.cheese = cheese;
    this.triggerBounce();
  }

  toggleDivided() {
    this.pizza.divided = !this.pizza.divided;
    this.triggerBounce();
  }

  updateToppingCount(toppingValue: string, newCount: number, half: number = 1) {
    if (newCount >= 0 && newCount <= 3) {
      if (half === 1) {
        this.pizza.toppingsHalf1[toppingValue] = newCount;
      } else {
        this.pizza.toppingsHalf2[toppingValue] = newCount;
      }
      
      const topping = this.allToppings.find((t) => t.value === toppingValue);
      if (topping) {
        if (half === 1) {
          topping.countHalf1 = newCount;
        } else {
          topping.countHalf2 = newCount;
        }
      }
      this.triggerBounce();
    }
  }

  triggerBounce() {
    this.isBouncing = true;
    setTimeout(() => {
      this.isBouncing = false;
    }, 600);
  }

  /****************************************/
  /* Pricing And Display Helpers */
  /****************************************/
  getPizzaScale(): number {
    switch (this.pizza.size) {
      case '10':
        return 0.9;
      case '14':
        return 1.1;
      default:
        return 1;
    }
  }

  getPizzaImagePath(texture: string): string {
    return `assets/images/pizzaTextures/pizza_${texture}.png`;
  }

  getTotalToppings(): number {
    const half1Total = Object.values(this.pizza.toppingsHalf1).reduce((sum, count) => sum + count, 0);
    const half2Total = Object.values(this.pizza.toppingsHalf2).reduce((sum, count) => sum + count, 0);
    
    if (this.pizza.divided) {
      return half1Total + half2Total;
    }
    return half1Total;
  }

  getToppingsCost(): number {
    const totalToppings = this.getTotalToppings();
    if (totalToppings <= 3) {
      return 0;
    }
    return (totalToppings - 3) * 0.8;
  }

  hasToppingOnHalf(toppingValue: string, half: number): boolean {
    if (half === 1) {
      return this.pizza.toppingsHalf1[toppingValue] > 0;
    }
    return this.pizza.toppingsHalf2[toppingValue] > 0;
  }

  getSizePrice(): number {
    switch (this.pizza.size) {
      case '10':
        return 8.99;
      case '14':
        return 11.99;
      default:
        return 9.99;
    }
  }

  getTotalPrice(): number {
    return this.getSizePrice() + this.getToppingsCost();
  }

  /****************************************/
  /* Basket Action */
  /****************************************/
  addToBasket() {
    const basketItem = {
      id: this.basketService.generateItemId(),
      name: 'Custom Pizza',
      size: this.pizza.size,
      sauce: this.pizza.sauce,
      cheese: this.pizza.cheese,
      divided: this.pizza.divided,
      toppingsHalf1: { ...this.pizza.toppingsHalf1 },
      toppingsHalf2: { ...this.pizza.toppingsHalf2 },
      totalToppings: this.getTotalToppings(),
      toppingsCost: this.getToppingsCost(),
      basePrice: this.getSizePrice(),
      totalPrice: this.getTotalPrice(),
    };

    this.basketService.addItem(basketItem);
    this.router.navigate(['/checkout']);
  }
}
