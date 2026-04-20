import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BasketService } from '../../services/basket.service';

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

  constructor(private basketService: BasketService) {}

  ngOnInit() {
    this.basketService.basket$.subscribe(items => {
      this.basketCount = items.length;
      this.basketTotal = items.reduce((total, item) => total + item.totalPrice, 0);
    });

    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.applyTheme();
    this.applyMenuState();
  }

  ngOnDestroy() {
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

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  private applyMenuState() {
    document.body.classList.toggle('menu-open', this.isOpen);
  }
}
