import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PizzaVisualComponent } from '../../shared/pizza-visual/pizza-visual';
import { BackendOrderRecord, OrderService, OrderStatus } from '../../services/order.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, PizzaVisualComponent],
  templateUrl: './employee.html',
  styleUrl: './employee.css',
})
export class EmployeeComponent implements OnInit, OnDestroy {
  /****************************************/
  /* Component State */
  /****************************************/
  orders: BackendOrderRecord[] = [];
  collectedOrders: BackendOrderRecord[] = [];
  isLoading = true;
  errorMessage = '';
  refreshCountdown = 30;
  private readonly autoRefreshSeconds = 30;
  private countdownId: ReturnType<typeof setInterval> | null = null;
  private updatingMap: { [orderId: string]: boolean } = {};

  readonly actionStatuses: Exclude<OrderStatus, 'received'>[] = ['making', 'cooking', 'collection', 'completed'];

  private readonly toppingLabels: { [key: string]: string } = {
    pepperoni: 'Pepperoni',
    bacon: 'Bacon',
    ham: 'Ham',
    mushroom: 'Mushrooms',
    spicy_beef: 'Spicy Beef',
    olive: 'Olives',
    jalapeno: 'Jalapenos'
  };

  constructor(private orderService: OrderService) {}

  /****************************************/
  /* Lifecycle */
  /****************************************/
  ngOnInit() {
    this.loadOrders();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.countdownId) {
      clearInterval(this.countdownId);
      this.countdownId = null;
    }
  }

  /****************************************/
  /* Data Loading */
  /****************************************/
  loadOrders() {
    this.isLoading = true;
    this.errorMessage = '';
    this.refreshCountdown = this.autoRefreshSeconds;

    forkJoin({
      inProgress: this.orderService.listEmployeeOrders('in-progress'),
      completed: this.orderService.listEmployeeOrders('completed')
    }).subscribe({
      next: ({ inProgress, completed }) => {
        this.orders = inProgress.orders;
        this.collectedOrders = completed.orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load employee orders:', error);
        this.errorMessage = 'Could not load live orders.';
        this.isLoading = false;
      }
    });
  }

  private startAutoRefresh() {
    if (this.countdownId) {
      clearInterval(this.countdownId);
    }

    this.countdownId = setInterval(() => {
      this.refreshCountdown -= 1;
      if (this.refreshCountdown <= 0) {
        this.loadOrders();
      }
    }, 1000);
  }

  /****************************************/
  /* Order Actions */
  /****************************************/
  updateStatus(order: BackendOrderRecord, status: Exclude<OrderStatus, 'received'>) {
    this.updatingMap[order.orderId] = true;
    this.orderService.updateOrderStatus(order.orderId, status).subscribe({
      next: () => {
        this.updatingMap[order.orderId] = false;
        this.loadOrders();
      },
      error: (error) => {
        console.error('Failed to update order status:', error);
        this.updatingMap[order.orderId] = false;
        this.errorMessage = 'Could not update order status.';
      }
    });
  }

  isUpdating(orderId: string): boolean {
    return !!this.updatingMap[orderId];
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  /****************************************/
  /* Toppings Helpers */
  /****************************************/
  getDisplayToppings(item: any): string {
    const source = item.divided
      ? { ...item.toppings?.left, ...item.toppings?.right }
      : item.toppings?.whole;

    if (!source || Object.keys(source).length === 0) {
      return 'No toppings';
    }

    return Object.entries(source)
      .map(([key, count]) => `${this.toppingLabels[key] || key} x${count}`)
      .join(', ');
  }

  getLeftOrWholeToppings(item: any): string[] {
    return item.divided
      ? this.expandToppingMap(item.toppings?.left)
      : this.expandToppingMap(item.toppings?.whole);
  }

  getRightToppings(item: any): string[] {
    return this.expandToppingMap(item.toppings?.right);
  }

  private expandToppingMap(map: { [key: string]: number } | undefined): string[] {
    if (!map) {
      return [];
    }

    return Object.entries(map)
      .filter(([_, count]) => count > 0)
      .flatMap(([key, count]) => Array(count).fill(key));
  }
}
