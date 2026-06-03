import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TourCardResponse } from '../../../../../core/models/tour.model';
import { TourCard } from '../tour-card/tour-card';

export type HomeTourSectionVariant = 'default' | 'highlight' | 'compact';

@Component({
  selector: 'app-home-tour-section',
  imports: [NgClass, NgFor, NgIf, RouterLink, TourCard],
  templateUrl: './home-tour-section.html',
  styleUrl: './home-tour-section.scss',
})
export class HomeTourSection {
  @Input() title = 'Tour nổi bật';
  @Input() subtitle?: string;
  @Input() tours: TourCardResponse[] = [];
  @Input() viewMoreLink = '/tours';
  @Input() variant: HomeTourSectionVariant = 'default';
  @Input() showViewMore = true;
  @Input() wishlistedTourIds: Set<number> | number[] = [];
  @Input() showWishlist = true;
  @Output() wishlistToggle = new EventEmitter<TourCardResponse>();

  isTourWishlisted(tour: TourCardResponse): boolean {
    return this.wishlistedTourIds instanceof Set
      ? this.wishlistedTourIds.has(tour.id)
      : this.wishlistedTourIds.includes(tour.id);
  }
}
