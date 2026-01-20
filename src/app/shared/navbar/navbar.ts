import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BasketService } from '../../services/basket.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent implements OnInit {
  isOpen = false;
  basketCount = 0;
  basketTotal = 0;

  constructor(private basketService: BasketService) {}

  ngOnInit() {
    this.basketService.basket$.subscribe(items => {
      this.basketCount = items.length;
      this.basketTotal = items.reduce((total, item) => total + item.totalPrice, 0);
    });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  closeMenu() {
    this.isOpen = false;
  }

  logout() {
    // Implement logout logic here
    console.log('Logout clicked');
    this.closeMenu();
  }
}
