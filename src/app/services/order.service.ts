import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { BasketItem } from './basket.service';
import { API_CONFIG } from '../config/api.config';

interface CompactToppings {
  [key: string]: number;
}

export type OrderStatus = 'received' | 'making' | 'cooking' | 'collection' | 'completed';

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
}

interface OrderItem {
  name: string;
  size: string;
  sauce: string;
  cheese: string;
  divided: boolean;
  toppings: {
    whole?: CompactToppings;
    left?: CompactToppings;
    right?: CompactToppings;
  };
  pricing: {
    basePrice: number;
    toppingsCost: number;
    totalPrice: number;
  };
}

export interface Order {
  orderId: string;
  timestamp: string;
  customer: {
    fullName?: string;
    name?: string;
    orderNotes?: string;
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
  items: OrderItem[];
  pricing: {
    subtotal: number;
    discount: number;
    deliveryFee: number;
    tip: number;
    total: number;
  };
  estimatedTime: string;
  backendOrderId?: string;
  backendStatus?: OrderStatus;
  estimatedDeliveryAt?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  status: OrderStatus;
  estimatedDeliveryAt: string;
}

export interface BackendOrderRecord {
  orderId: string;
  status: OrderStatus;
  estimatedDeliveryAt: string;
  createdAt: string;
  statusHistory: StatusHistoryEntry[];
  orderJson: Order;
}

export interface EmployeeOrdersResponse {
  orders: BackendOrderRecord[];
  count: number;
}

export interface UpdateOrderResponse {
  orderId: string;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly STORAGE_KEY = 'pizza_order';
  private currentOrder = new BehaviorSubject<Order | null>(null);
  
  currentOrder$ = this.currentOrder.asObservable();

  constructor(private http: HttpClient) {
    this.loadOrder();
  }

  async placeOrder(
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
  ): Promise<CreateOrderResponse> {
    const localOrder = this.createLocalOrder(
      fullName,
      orderNotes,
      fulfillment,
      address,
      items,
      subtotal,
      discount,
      deliveryFee,
      tip,
      total
    );

    const response = await firstValueFrom(
      this.http.post<CreateOrderResponse>(`${API_CONFIG.baseUrl}/orders`, localOrder)
    );

    const syncedOrder: Order = {
      ...localOrder,
      backendOrderId: response.orderId,
      backendStatus: response.status,
      estimatedDeliveryAt: response.estimatedDeliveryAt
    };

    this.currentOrder.next(syncedOrder);
    this.saveOrder(syncedOrder);

    return response;
  }

  createLocalOrder(
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
    const compactItems = items.map(item => this.compactBasketItem(item));
    const customer = {
      fullName: fullName.trim(),
      ...(orderNotes.trim() ? { orderNotes: orderNotes.trim() } : {})
    };

    const order: Order = {
      orderId,
      timestamp,
      customer,
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
      items: compactItems,
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

  getCurrentBackendOrderId(): string | null {
    return this.currentOrder.value?.backendOrderId || null;
  }

  getOrderFromApi(orderId: string): Observable<BackendOrderRecord> {
    return this.http.get<BackendOrderRecord>(`${API_CONFIG.baseUrl}/orders/${orderId}`);
  }

  listEmployeeOrders(status: 'in-progress' | OrderStatus = 'in-progress'): Observable<EmployeeOrdersResponse> {
    return this.http.get<EmployeeOrdersResponse>(`${API_CONFIG.baseUrl}/employee/orders?status=${status}`);
  }

  updateOrderStatus(orderId: string, status: Exclude<OrderStatus, 'received'>): Observable<UpdateOrderResponse> {
    return this.http.patch<UpdateOrderResponse>(`${API_CONFIG.baseUrl}/orders/${orderId}`, { status });
  }

  syncFromBackend(backendOrder: BackendOrderRecord): void {
    const current = this.currentOrder.value;
    if (!current) {
      return;
    }

    if (current.backendOrderId !== backendOrder.orderId) {
      return;
    }

    const merged: Order = {
      ...current,
      backendStatus: backendOrder.status,
      estimatedDeliveryAt: backendOrder.estimatedDeliveryAt
    };

    this.currentOrder.next(merged);
    this.saveOrder(merged);
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

  private compactBasketItem(item: BasketItem): OrderItem {
    const half1 = this.stripZeroToppings(item.toppingsHalf1);
    const half2 = this.stripZeroToppings(item.toppingsHalf2);

    const toppings = item.divided
      ? {
          ...(Object.keys(half1).length ? { left: half1 } : {}),
          ...(Object.keys(half2).length ? { right: half2 } : {})
        }
      : {
          whole: this.mergeToppings(half1, half2)
        };

    return {
      name: item.name,
      size: item.size,
      sauce: item.sauce,
      cheese: item.cheese,
      divided: item.divided,
      toppings,
      pricing: {
        basePrice: item.basePrice,
        toppingsCost: item.toppingsCost,
        totalPrice: item.totalPrice
      }
    };
  }

  private stripZeroToppings(toppings: { [key: string]: number }): CompactToppings {
    return Object.entries(toppings).reduce((acc, [key, count]) => {
      if (count > 0) {
        acc[key] = count;
      }
      return acc;
    }, {} as CompactToppings);
  }

  private mergeToppings(left: CompactToppings, right: CompactToppings): CompactToppings {
    const merged: CompactToppings = { ...left };
    Object.entries(right).forEach(([key, count]) => {
      merged[key] = (merged[key] || 0) + count;
    });
    return merged;
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
