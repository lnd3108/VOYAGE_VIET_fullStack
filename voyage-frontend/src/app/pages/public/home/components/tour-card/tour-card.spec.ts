import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCardResponse } from '../../../../../core/models/tour.model';
import { TourCard } from './tour-card';

describe('TourCard', () => {
  let component: TourCard;
  let fixture: ComponentFixture<TourCard>;

  const tour: TourCardResponse = {
    id: 1,
    title: 'Sample tour',
    slug: 'sample-tour',
    thumbnailUrl: '',
    originalPrice: 1000000,
    salePrice: 900000,
    durationDays: 3,
    durationNights: 2,
    departureLocation: 'Da Nang',
    availableSeats: 10,
    featured: true,
    status: 'PUBLISHED',
    categoryName: 'Domestic',
    categorySlug: 'domestic',
    destinationName: 'Da Nang',
    destinationSlug: 'da-nang',
    averageRating: 4.8,
    reviewCount: 12,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourCard],
    }).compileComponents();

    fixture = TestBed.createComponent(TourCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tour', tour);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
