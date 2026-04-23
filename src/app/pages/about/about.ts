import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CarouselItem {
  id: string;
  name: string;
  role: string;
  src: string;
  class: string;
}

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit, OnDestroy, AfterViewInit {
  /****************************************/
  /* Component State */
  /****************************************/
  @ViewChild('carouselList', { static: false }) carouselList!: ElementRef;
  
  private autoPlayInterval: any;
  private touchStartX = 0;
  private touchEndX = 0;
  
  employees = [
    { id: '1', name: 'Sammy Ayres', role: 'Employee', src: 'assets/images/Employee1.png' },
    { id: '2', name: 'Samson Ayres', role: 'Employee', src: 'assets/images/Employee2.png' },
    { id: '3', name: 'Samantha Ayres', role: 'Employee', src: 'assets/images/Employee3.png' },
    { id: '4', name: 'John Ayres', role: 'Employee', src: 'assets/images/Employee4.png' },
    { id: '5', name: 'Samuel Ayres', role: 'Owner', src: 'assets/images/Owner.png' },
    { id: '6', name: 'Sam Ayres', role: 'CEO', src: 'assets/images/CEO.png' }
  ];

  currentIndex = 0;
  carouselItems: CarouselItem[] = [];

  /****************************************/
  /* Lifecycle */
  /****************************************/
  ngOnInit() {
    this.initializeCarousel();
    this.startAutoPlay();
  }

  ngAfterViewInit() {
    this.setupTouchListeners();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  /****************************************/
  /* Carousel Navigation */
  /****************************************/
  initializeCarousel() {
    const total = this.employees.length;
    this.carouselItems = [
      { ...this.employees[(this.currentIndex - 2 + total) % total], class: 'hide' },
      { ...this.employees[(this.currentIndex - 1 + total) % total], class: 'prev' },
      { ...this.employees[this.currentIndex], class: 'act' },
      { ...this.employees[(this.currentIndex + 1) % total], class: 'next' },
      { ...this.employees[(this.currentIndex + 2) % total], class: 'next new-next' }
    ];
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.employees.length;

    this.carouselItems[0].class = 'hide';
    this.carouselItems[1].class = 'prev';
    this.carouselItems[2].class = 'act';
    this.carouselItems[3].class = 'next';

    const newIndex = (this.currentIndex + 2) % this.employees.length;
    const newItem = {
      ...this.employees[newIndex],
      class: 'new-next'
    };

    this.carouselItems.push(newItem);

    setTimeout(() => {
      this.carouselItems.shift();
    }, 1000);
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.employees.length) % this.employees.length;

    const newIndex = (this.currentIndex - 2 + this.employees.length) % this.employees.length;
    const newItem = {
      ...this.employees[newIndex],
      class: 'hide'
    };

    this.carouselItems.unshift(newItem);

    this.carouselItems[1].class = 'prev';
    this.carouselItems[2].class = 'act';
    this.carouselItems[3].class = 'next';
    this.carouselItems[4].class = 'new-next';

    setTimeout(() => {
      this.carouselItems.pop();
    }, 1000);
  }

  /****************************************/
  /* User Interaction */
  /****************************************/
  onSlideClick(item: CarouselItem) {
    return;
  }

  setupTouchListeners() {
    const element = this.carouselList?.nativeElement;
    if (!element) return;

    element.addEventListener('touchstart', (e: TouchEvent) => {
      this.touchStartX = e.changedTouches[0].screenX;
    });

    element.addEventListener('touchend', (e: TouchEvent) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });
  }

  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.next();
      } else {
        this.prev();
      }
      this.resetAutoPlay();
    }
  }

  /****************************************/
  /* Auto Play */
  /****************************************/
  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.next();
    }, 2000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  /****************************************/
  /* Template Helpers */
  /****************************************/
  trackByFn(index: number, item: CarouselItem) {
    return `${item.id}-${index}`;
  }
}
