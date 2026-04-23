import { TestBed } from '@angular/core/testing';
import { BasketService, BasketItem } from './basket.service';

function makeItem(overrides: Partial<BasketItem> = {}): BasketItem {
  return {
    id: 'test-id',
    name: 'Margherita',
    size: 'medium',
    sauce: 'tomato',
    cheese: 'mozzarella',
    divided: false,
    toppingsHalf1: {},
    toppingsHalf2: {},
    totalToppings: 0,
    toppingsCost: 0,
    basePrice: 10,
    totalPrice: 10,
    ...overrides,
  };
}

describe('BasketService', () => {
  let service: BasketService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasketService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty basket when localStorage is empty', () => {
    expect(service.getItems()).toEqual([]);
    expect(service.getItemCount()).toBe(0);
  });

  describe('addItem', () => {
    it('should add an item to the basket', () => {
      const item = makeItem({ id: 'a1' });
      service.addItem(item);
      expect(service.getItemCount()).toBe(1);
      expect(service.getItems()[0]).toEqual(item);
    });

    it('should append multiple items in order', () => {
      service.addItem(makeItem({ id: 'a1', name: 'Margherita' }));
      service.addItem(makeItem({ id: 'a2', name: 'Pepperoni' }));
      const items = service.getItems();
      expect(items.length).toBe(2);
      expect(items[0].name).toBe('Margherita');
      expect(items[1].name).toBe('Pepperoni');
    });
  });

  describe('removeItem', () => {
    it('should remove an item by id', () => {
      service.addItem(makeItem({ id: 'r1' }));
      service.addItem(makeItem({ id: 'r2' }));
      service.removeItem('r1');
      expect(service.getItemCount()).toBe(1);
      expect(service.getItems()[0].id).toBe('r2');
    });

    it('should do nothing if the id does not exist', () => {
      service.addItem(makeItem({ id: 'r1' }));
      service.removeItem('nonexistent');
      expect(service.getItemCount()).toBe(1);
    });
  });

  describe('clearBasket', () => {
    it('should remove all items', () => {
      service.addItem(makeItem({ id: 'c1' }));
      service.addItem(makeItem({ id: 'c2' }));
      service.clearBasket();
      expect(service.getItems()).toEqual([]);
      expect(service.getItemCount()).toBe(0);
    });
  });

  describe('getTotalPrice', () => {
    it('should return 0 for an empty basket', () => {
      expect(service.getTotalPrice()).toBe(0);
    });

    it('should sum the totalPrice of all items', () => {
      service.addItem(makeItem({ id: 'p1', totalPrice: 9.99 }));
      service.addItem(makeItem({ id: 'p2', totalPrice: 12.50 }));
      expect(service.getTotalPrice()).toBeCloseTo(22.49);
    });
  });

  describe('insertItemAt', () => {
    it('should insert an item at the specified index', () => {
      service.addItem(makeItem({ id: 'i1', name: 'First' }));
      service.addItem(makeItem({ id: 'i3', name: 'Third' }));
      service.insertItemAt(makeItem({ id: 'i2', name: 'Second' }), 1);
      const items = service.getItems();
      expect(items[0].name).toBe('First');
      expect(items[1].name).toBe('Second');
      expect(items[2].name).toBe('Third');
    });

    it('should clamp index to 0 when a negative index is given', () => {
      service.addItem(makeItem({ id: 'i1', name: 'Existing' }));
      service.insertItemAt(makeItem({ id: 'i0', name: 'Clamped' }), -99);
      expect(service.getItems()[0].name).toBe('Clamped');
    });

    it('should clamp index to end when index exceeds basket length', () => {
      service.addItem(makeItem({ id: 'i1', name: 'Only' }));
      service.insertItemAt(makeItem({ id: 'i2', name: 'Last' }), 999);
      const items = service.getItems();
      expect(items[items.length - 1].name).toBe('Last');
    });
  });

  describe('generateItemId', () => {
    it('should return a string starting with "pizza_"', () => {
      expect(service.generateItemId()).toMatch(/^pizza_/);
    });

    it('should generate unique ids on successive calls', () => {
      const id1 = service.generateItemId();
      const id2 = service.generateItemId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('basket$ observable', () => {
    it('should emit the updated list when an item is added', (done) => {
      const item = makeItem({ id: 'obs1' });
      service.basket$.subscribe(items => {
        if (items.length === 1) {
          expect(items[0]).toEqual(item);
          done();
        }
      });
      service.addItem(item);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist items to localStorage when an item is added', () => {
      service.addItem(makeItem({ id: 'ls1' }));
      const stored = JSON.parse(localStorage.getItem('pizza_basket') || '[]');
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe('ls1');
    });

    it('should clear localStorage when the basket is cleared', () => {
      service.addItem(makeItem({ id: 'ls2' }));
      service.clearBasket();
      const stored = JSON.parse(localStorage.getItem('pizza_basket') || '[]');
      expect(stored.length).toBe(0);
    });
  });
});
