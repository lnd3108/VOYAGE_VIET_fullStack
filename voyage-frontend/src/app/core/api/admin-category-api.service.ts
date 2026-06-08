import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminCategory,
  AdminCategoryCreateRequest,
  AdminCategoryOrderSwapItem,
  AdminCategoryUpdateRequest,
  CategoryStatus,
} from '../models/category.model';
import { PageResponse } from '../models/page-response.model';

export type AdminCategoryListResponse =
  | ApiResponse<AdminCategory[] | PageResponse<AdminCategory>>
  | AdminCategory[]
  | PageResponse<AdminCategory>;

@Injectable({
  providedIn: 'root',
})
export class AdminCategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getCategories() {
    return this.http.get<AdminCategoryListResponse>(`${this.apiUrl}/admin/categories`);
  }

  createCategory(payload: AdminCategoryCreateRequest) {
    return this.http.post<ApiResponse<AdminCategory> | AdminCategory>(`${this.apiUrl}/admin/categories`, payload);
  }

  updateCategory(id: number, payload: AdminCategoryUpdateRequest) {
    return this.http.put<ApiResponse<AdminCategory> | AdminCategory>(`${this.apiUrl}/admin/categories/${id}`, payload);
  }

  swapCategoryOrder(first: AdminCategoryOrderSwapItem, second: AdminCategoryOrderSwapItem) {
    return forkJoin([
      this.updateCategory(first.id, first.payload),
      this.updateCategory(second.id, second.payload),
    ]);
  }

  updateCategoryStatus(id: number, status: CategoryStatus) {
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(`${this.apiUrl}/admin/categories/${id}/status`, {
      status,
    });
  }

  updateCategoryImage(id: number, imageUrl: string) {
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(`${this.apiUrl}/admin/categories/${id}/image`, {
      imageUrl,
    });
  }

  deleteCategory(id: number) {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/admin/categories/${id}`);
  }
}
