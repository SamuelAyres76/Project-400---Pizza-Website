import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pizza-visual',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pizza-visual.html',
  styleUrl: './pizza-visual.css',
})
export class PizzaVisualComponent {
  @Input() toppings: any[] = [];
  @Input() divisions: number = 0;
  @Input() size: string = '12';

  allToppings = [
    'pepperoni',
    'bacon',
    'ham',
    'mushroom',
    'spicy_beef',
    'olive',
    'jalapeno',
  ];

  getPizzaImagePath(texture: string): string {
    return `/assets/images/pizzaTextures/pizza_${texture}.png`;
  }

  getPizzaScale(): number {
    switch (this.size) {
      case '10':
        return 0.9;
      case '14':
        return 1.1;
      default:
        return 1;
    }
  }

  hasToppingOnHalf(toppingValue: string, half: number): boolean {
    return this.toppings.some((topping: any) => {
      const value = typeof topping === 'string' ? topping : topping.value;
      return value === toppingValue;
    });
  }
}
