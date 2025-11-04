import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePizza } from './create-pizza';

describe('CreatePizza', () => {
  let component: CreatePizza;
  let fixture: ComponentFixture<CreatePizza>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePizza]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePizza);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
