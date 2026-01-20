import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BasketItem } from './basket.service';

export interface Order {
  orderId: string;
  timestamp: string;
  customer: {
    fullName: string;
    orderNotes: string;
  };
  fulfillment: {
    type: 'pickup' | 'delivery';
    address?: {
      line1: string;
      line2?: string;
      line3?: string;
      city: string;
      postalCode: string;
    };
  };
  items: BasketItem[];
  pricing: {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    tip: number;
    total: number;
  };
  estimatedTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly STORAGE_KEY = 'pizza_order';
  private currentOrder = new BehaviorSubject<Order | null>(null);
  
  currentOrder$ = this.currentOrder.asObservable();

  constructor() {
    this.loadOrder();
  }

  createOrder(
    fullName: string,
    orderNotes: string,
    fulfillment: 'pickup' | 'delivery',
    address: any,
    items: BasketItem[],
    subtotal: number,
    discount: number,
    deliveryFee: number,
    tip: number,
    total: number
  ): Order {
    const orderId = this.generateOrderId();
    const timestamp = new Date().toISOString();
    const estimatedTime = this.calculateEstimatedTime(fulfillment);

    const order: Order = {
      orderId,
      timestamp,
      customer: {
        fullName,
        orderNotes
      },
      fulfillment: {
        type: fulfillment,
        ...(fulfillment === 'delivery' && {
          address: {
            line1: address.line1,
            line2: address.line2,
            line3: address.line3,
            city: address.city,
            postalCode: address.postalCode
          }
        })
      },
      items,
      pricing: {
        subtotal,
        discount,
        deliveryFee,
        tip,
        total
      },
      estimatedTime
    };

    this.currentOrder.next(order);
    this.saveOrder(order);
    return order;
  }

  getOrder(): Order | null {
    return this.currentOrder.value;
  }

  private generateOrderId(): string {
    return 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  private calculateEstimatedTime(fulfillment: 'pickup' | 'delivery'): string {
    const now = new Date();
    const eta = new Date(now.getTime() + (fulfillment === 'pickup' ? 20 : 30) * 60000);
    return eta.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private saveOrder(order: Order): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(order));
  }

  private loadOrder(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.currentOrder.next(JSON.parse(stored));
    }
  }

  clearOrder(): void {
    this.currentOrder.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
