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
  toppings: string[];
  divisions: number;
  image: string;
}

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, PizzaVisualComponent],
  templateUrl: './browse.html',
  styleUrls: ['./browse.css'],
})
export class BrowseComponent implements OnInit {
  pizzas: Pizza[] = [];
  displayCount: number = 8;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadPizzas();
  }

  loadPizzas() {
    fetch('assets/data/pizzas.json')
      .then(response => response.json())
      .then(data => {
        this.pizzas = data;
      })
      .catch(error => console.error('Error loading pizzas:', error));
  }

  getDisplayedPizzas(): Pizza[] {
    return this.pizzas.slice(0, this.displayCount);
  }

  showMore() {
    this.displayCount += 8;
  }

  hasMorePizzas(): boolean {
    return this.displayCount < this.pizzas.length;
  }

  editPizza(pizza: Pizza) {
    this.router.navigate(['/create'], {
      state: { preset: pizza }
    });
  }
}
