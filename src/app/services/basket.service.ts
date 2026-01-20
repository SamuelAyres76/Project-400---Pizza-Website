import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BasketItem {
  id: string;
  name: string;
  size: string;
  sauce: string;
  cheese: string;
  divided: boolean;
  toppingsHalf1: { [key: string]: number };
  toppingsHalf2: { [key: string]: number };
  totalToppings: number;
  toppingsCost: number;
  basePrice: number;
  totalPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private readonly STORAGE_KEY = 'pizza_basket';
  private basketItems = new BehaviorSubject<BasketItem[]>(this.loadFromStorage());
  
  basket$ = this.basketItems.asObservable();

  constructor() {
    // Save to storage whenever basket changes
    this.basket$.subscribe(items => {
      this.saveToStorage(items);
    });
  }

  private loadFromStorage(): BasketItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading basket from storage:', error);
      return [];
    }
  }

  private saveToStorage(items: BasketItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving basket to storage:', error);
    }
  }

  addItem(item: BasketItem): void {
    const currentItems = this.basketItems.value;
    this.basketItems.next([...currentItems, item]);
  }

  removeItem(id: string): void {
    const currentItems = this.basketItems.value;
    this.basketItems.next(currentItems.filter(item => item.id !== id));
  }

  getItems(): BasketItem[] {
    return this.basketItems.value;
  }

  getItemCount(): number {
    return this.basketItems.value.length;
  }

  getTotalPrice(): number {
    return this.basketItems.value.reduce((total, item) => total + item.totalPrice, 0);
  }

  clearBasket(): void {
    this.basketItems.next([]);
  }

  generateItemId(): string {
    return `pizza_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
