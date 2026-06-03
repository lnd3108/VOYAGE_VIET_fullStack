import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../../core/auth/auth.service';
import { TourCardResponse } from '../../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-card',
  imports: [NgIf, RouterLink],
  templateUrl: './tour-card.html',
  styleUrl: './tour-card.scss',
})
export class TourCard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @Input({ required: true }) tour!: TourCardResponse;
  @Input() showWishlist = true;
  @Input() isWishlisted = false;
  @Output() wishlistToggle = new EventEmitter<TourCardResponse>();

  readonly fallbackImage = '/hero/bg-home.png';

  get detailLink(): string[] {
    return ['/tours', this.tour.slug];
  }

  get displayPrice(): number {
    return this.tour.salePrice || this.tour.originalPrice;
  }

  get hasDiscount(): boolean {
    return !!this.tour.salePrice && this.tour.salePrice < this.tour.originalPrice;
  }

  get statusLabel(): string | null {
    const labels: Record<TourCardResponse['status'], string> = {
      DRAFT: 'Bản nháp',
      PUBLISHED: 'Đang mở bán',
      INACTIVE: 'Tạm dừng',
      SOLD_OUT: 'Hết chỗ',
    };

    return this.tour.status ? labels[this.tour.status] : null;
  }

  toggleWishlist(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url,
        },
      });
      return;
    }

    this.wishlistToggle.emit(this.tour);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;

    if (image.src.endsWith(this.fallbackImage)) {
      return;
    }

    image.src = this.fallbackImage;
  }
}
