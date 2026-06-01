import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCard } from './tour-card';

describe('TourCard', () => {
  let component: TourCard;
  let fixture: ComponentFixture<TourCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TourCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
