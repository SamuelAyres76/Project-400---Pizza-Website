import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/navbar/navbar';
import { FooterComponent } from './shared/footer/footer';
import { BasketService } from './services/basket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  title = 'pizza-website';
  basketCount = 0;
  basketTotal = 0;
  currentPath = '';

  private basketSub?: Subscription;
  private routeSub?: Subscription;

  constructor(
    private basketService: BasketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentPath = this.router.url;

    this.basketSub = this.basketService.basket$.subscribe(items => {
      this.basketCount = items.length;
      this.basketTotal = items.reduce((total, item) => total + item.totalPrice, 0);
    });

    this.routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPath = event.urlAfterRedirects;
      });
  }

  ngOnDestroy(): void {
    this.basketSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  get isCreateRoute(): boolean {
    return this.currentPath.startsWith('/create');
  }

  get isCheckoutRoute(): boolean {
    return this.currentPath.startsWith('/checkout');
  }

  goToCheckout(event?: Event): void {
    event?.preventDefault();
    this.router.navigateByUrl('/checkout');
  }
}
