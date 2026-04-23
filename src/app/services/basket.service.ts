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

  // Observable that components subscribe to for live basket updates.
  basket$ = this.basketItems.asObservable();

  constructor() {
    // Save to storage whenever the basket changes
    this.basket$.subscribe(items => {
      this.saveToStorage(items);
    });
  }

  // Reads the saved basket from localStorage on startup.
  private loadFromStorage(): BasketItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading basket from storage:', error);
      return [];
    }
  }

  // Persists the current basket to localStorage.
  private saveToStorage(items: BasketItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving basket to storage:', error);
    }
  }

  // Appends a new item to the end of the basket.
  addItem(item: BasketItem): void {
    const currentItems = this.basketItems.value;
    this.basketItems.next([...currentItems, item]);
  }

  // Inserts an item at a specific position in the basket.
  insertItemAt(item: BasketItem, index: number): void {
    const currentItems = [...this.basketItems.value];
    const safeIndex = Math.max(0, Math.min(index, currentItems.length));
    currentItems.splice(safeIndex, 0, item);
    this.basketItems.next(currentItems);
  }

  // Removes an item from the basket by its ID.
  removeItem(id: string): void {
    const currentItems = this.basketItems.value;
    this.basketItems.next(currentItems.filter(item => item.id !== id));
  }

  // Returns the current list of basket items.
  getItems(): BasketItem[] {
    return this.basketItems.value;
  }

  // Returns how many items are in the basket.
  getItemCount(): number {
    return this.basketItems.value.length;
  }

  // Sums up the price of every item in the basket.
  getTotalPrice(): number {
    return this.basketItems.value.reduce((total, item) => total + item.totalPrice, 0);
  }

  // Empties the basket.
  clearBasket(): void {
    this.basketItems.next([]);
  }

  // Generates a unique ID for a new basket item.
  generateItemId(): string {
    return `pizza_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
