import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PizzaVisualComponent } from '../../shared/pizza-visual/pizza-visual';

interface Pizza {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  toppings: any[];
  divisions: number;
  image: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PizzaVisualComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  pizzas: Pizza[] = [];
  popularPizzas: Pizza[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadPizzas();
  }

  loadPizzas() {
    fetch('assets/data/pizzas.json')
      .then(response => response.json())
      .then(data => {
        this.pizzas = data;
        this.popularPizzas = this.pizzas.slice(0, 3);
      })
      .catch(error => console.error('Error loading pizzas:', error));
  }

  navigateToCreate() {
    this.router.navigate(['/create']);
  }

  navigateToBrowse() {
    this.router.navigate(['/browse']);
  }

  editPizza(pizza: Pizza) {
    this.router.navigate(['/create'], {
      state: { preset: pizza }
    });
  }
}
