import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';
import { BackendOrderRecord, OrderService, OrderStatus } from '../../services/order.service';
import { PizzaVisualComponent } from '../../shared/pizza-visual/pizza-visual';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, PizzaVisualComponent],
  templateUrl: './tracker.html',
  styleUrl: './tracker.css',
})
export class TrackerComponent implements OnInit, OnDestroy {
  /****************************************/
  /* Component State */
  /****************************************/
  backendOrder: BackendOrderRecord | null = null;
  orderId = '';
  searchOrderId = '';
  isLoading = true;
  errorMessage = '';
  copyMessage = '';
  private pollId: ReturnType<typeof setInterval> | null = null;
  private routeSub?: Subscription;
  private copyMessageTimeoutId: ReturnType<typeof setTimeout> | null = null;
  readonly statusSteps: OrderStatus[] = ['received', 'making', 'cooking', 'collection', 'completed'];
  private readonly toppingLabels: { [key: string]: string } = {
    pepperoni: 'Pepperoni',
    bacon: 'Bacon',
    ham: 'Ham',
    mushroom: 'Mushrooms',
    spicy_beef: 'Spicy Beef',
    olive: 'Olives',
    jalapeno: 'Jalapenos'
  };

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /****************************************/
  /* Lifecycle */
  /****************************************/
  ngOnInit() {
    this.routeSub = this.route.queryParamMap.subscribe(params => {
      const paramOrderId = params.get('orderId');
      const storedOrderId = this.orderService.getCurrentBackendOrderId();
      const resolvedId = paramOrderId || storedOrderId || '';

      if (!resolvedId) {
        this.isLoading = false;
        this.errorMessage = 'No order ID found. Please place an order first.';
        return;
      }

      if (this.orderId === resolvedId) {
        return;
      }

      this.orderId = resolvedId;
      this.searchOrderId = resolvedId;
      this.startPolling();
    });
  }

  /****************************************/
  /* Polling */
  /****************************************/
  private startPolling() {
    if (this.pollId) {
      clearInterval(this.pollId);
    }
    this.loadOrder(true);
    this.pollId = setInterval(() => this.loadOrder(false), API_CONFIG.trackerPollMs);
  }

  private stopPolling() {
    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = null;
    }
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.stopPolling();
    if (this.copyMessageTimeoutId) {
      clearTimeout(this.copyMessageTimeoutId);
      this.copyMessageTimeoutId = null;
    }
  }

  /****************************************/
  /* Order Loading */
  /****************************************/
  loadOrder(showLoader: boolean) {
    if (showLoader) {
      this.isLoading = true;
    }

    this.errorMessage = '';
    this.orderService.getOrderFromApi(this.orderId).subscribe({
      next: (order) => {
        if (order.orderId !== this.orderId) {
          this.stopPolling();
          this.errorMessage = 'Tracker halted: backend returned a different order ID than requested.';
          this.isLoading = false;
          return;
        }

        this.backendOrder = order;
        this.orderService.syncFromBackend(order);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load order from API:', error);
        this.errorMessage = 'Could not load the order tracker right now. Please refresh soon.';
        this.isLoading = false;
      }
    });
  }

  refreshNow() {
    this.loadOrder(true);
  }

  /****************************************/
  /* Search And Copy */
  /****************************************/
  searchByOrderId() {
    const nextOrderId = this.searchOrderId.trim();
    if (!nextOrderId) {
      this.errorMessage = 'Enter an order ID to search.';
      return;
    }

    this.backendOrder = null;
    this.errorMessage = '';
    this.orderId = nextOrderId;
    this.router.navigate(['/tracker'], { queryParams: { orderId: nextOrderId } });
    this.startPolling();
  }

  async copyOrderId() {
    if (!this.backendOrder?.orderId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.backendOrder.orderId);
      this.copyMessage = 'Copied';
    } catch {
      this.copyMessage = 'Copy failed';
    }

    if (this.copyMessageTimeoutId) {
      clearTimeout(this.copyMessageTimeoutId);
    }

    this.copyMessageTimeoutId = setTimeout(() => {
      this.copyMessage = '';
      this.copyMessageTimeoutId = null;
    }, 1800);
  }

  backToHome() {
    this.orderService.clearOrder();
    this.router.navigate(['/']);
  }

  /****************************************/
  /* Display Helpers */
  /****************************************/
  formatStatus(status: OrderStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

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

  /****************************************/
  /* Status Progress */
  /****************************************/
  stepReached(status: OrderStatus): boolean {
    if (!this.backendOrder) {
      return false;
    }
    return this.statusSteps.indexOf(status) <= this.statusSteps.indexOf(this.backendOrder.status);
  }
}
