import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BasketService } from '../../services/basket.service';
import { EmployeeAuthService } from '../../services/employee-auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isOpen = false;
  basketCount = 0;
  basketTotal = 0;
  isDarkMode = false;
  isEmployeeAuthenticated = false;
  private basketSub?: Subscription;
  private authSub?: Subscription;

  constructor(
    private basketService: BasketService,
    private employeeAuthService: EmployeeAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.basketSub = this.basketService.basket$.subscribe(items => {
      this.basketCount = items.length;
      this.basketTotal = items.reduce((total, item) => total + item.totalPrice, 0);
    });

    this.authSub = this.employeeAuthService.authState$.subscribe(isAuthenticated => {
      this.isEmployeeAuthenticated = isAuthenticated;
    });

    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.applyTheme();
    this.applyMenuState();
  }

  ngOnDestroy() {
    this.basketSub?.unsubscribe();
    this.authSub?.unsubscribe();
    document.body.classList.remove('menu-open');
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.applyMenuState();
  }

  closeMenu() {
    this.isOpen = false;
    this.applyMenuState();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  logoutEmployee() {
    this.employeeAuthService.logout();
    this.closeMenu();
    this.router.navigate(['/employee-login']);
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  private applyMenuState() {
    document.body.classList.toggle('menu-open', this.isOpen);
  }
}
