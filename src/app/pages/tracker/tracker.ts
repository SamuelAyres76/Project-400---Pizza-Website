import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracker.html',
  styleUrl: './tracker.css',
})
export class TrackerComponent implements OnInit {
  order: Order | null = null;
  orderJson: string = '';

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.order = this.orderService.getOrder();
    if (this.order) {
      this.orderJson = JSON.stringify(this.order, null, 2);
    } else {
      // If no order found, redirect to checkout
      this.router.navigate(['/checkout']);
    }
  }

  backToHome() {
    this.orderService.clearOrder();
    this.router.navigate(['/home']);
  }
}
