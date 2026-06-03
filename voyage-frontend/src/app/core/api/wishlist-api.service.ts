import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PageResponse } from '../models/page-response.model';
import { WishlistItem, WishlistListParams, WishlistToggleResponse } from '../models/wishlist.model';

@Injectable({
  providedIn: 'root',
})
export class WishlistApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMyWishlist(params: WishlistListParams = {}) {
    return this.http.get<ApiResponse<PageResponse<WishlistItem> | WishlistItem[]>>(
      `${this.apiUrl}/users/me/wishlist`,
      {
        params: this.buildParams(params),
      },
    );
  }

  toggleWishlist(tourId: number) {
    return this.http.post<ApiResponse<WishlistToggleResponse | WishlistItem>>(
      `${this.apiUrl}/users/me/wishlist/${tourId}`,
      {},
    );
  }

  private buildParams(params: object): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
