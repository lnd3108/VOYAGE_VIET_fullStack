import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminCategory,
  AdminCategoryCreateRequest,
  AdminCategoryUpdateRequest,
  CategoryBatchActionResponse,
  CategoryStatus,
} from '../models/category.model';
import { PageResponse } from '../models/page-response.model';

export interface AdminCategoryPatchRequest {
  name: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: number | boolean | null;
  displayOrder?: number | null;
}

export interface AdminCategoryRejectRequest {
  reason: string;
}

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
    return this.http.post<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories`,
      payload,
    );
  }

  createAndSubmitCategory(payload: AdminCategoryCreateRequest) {
    return this.http.post<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/submit-create`,
      payload,
    );
  }

  updateCategory(id: number, payload: AdminCategoryUpdateRequest) {
    return this.http.put<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}`,
      payload,
    );
  }

  patchCategory(id: number, payload: AdminCategoryPatchRequest) {
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}`,
      payload,
    );
  }

  updateCategoryStatus(id: number, status: CategoryStatus) {
    // Deprecated for PMH-style workflow UI. Keep for legacy compatibility only; do not call from action menu.
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}/status`,
      { status },
    );
  }

  submitCategory(id: number) {
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}/submit`,
      {},
    );
  }

  submitCategories(ids: number[]) {
    return this.http.patch<ApiResponse<CategoryBatchActionResponse> | CategoryBatchActionResponse>(
      `${this.apiUrl}/admin/categories/batch/submit`,
      { ids },
    );
  }

  approveCategory(id: number) {
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}/approve`,
      {},
    );
  }

  approveCategories(ids: number[]) {
    return this.http.patch<ApiResponse<CategoryBatchActionResponse> | CategoryBatchActionResponse>(
      `${this.apiUrl}/admin/categories/batch/approve`,
      { ids },
    );
  }

  rejectCategory(id: number, payload: AdminCategoryRejectRequest) {
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}/reject`,
      payload,
    );
  }

  rejectCategories(ids: number[], reason: string) {
    return this.http.patch<ApiResponse<CategoryBatchActionResponse> | CategoryBatchActionResponse>(
      `${this.apiUrl}/admin/categories/batch/reject`,
      { ids, reason },
    );
  }

  cancelApproveCategory(id: number) {
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}/cancel-approve`,
      {},
    );
  }

  cancelApproveCategories(ids: number[]) {
    return this.http.patch<ApiResponse<CategoryBatchActionResponse> | CategoryBatchActionResponse>(
      `${this.apiUrl}/admin/categories/batch/cancel-approve`,
      { ids },
    );
  }

  updateCategoryDisplay(id: number, isDisplay: 0 | 1) {
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}/display`,
      { isDisplay },
    );
  }

  updateCategoriesDisplay(ids: number[], isDisplay: 0 | 1) {
    return this.http.patch<ApiResponse<CategoryBatchActionResponse> | CategoryBatchActionResponse>(
      `${this.apiUrl}/admin/categories/batch/display`,
      { ids, isDisplay },
    );
  }

  updateCategoryImage(id: number, imageUrl: string) {
    return this.http.patch<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}/image`,
      { imageUrl },
    );
  }

  deleteCategory(id: number) {
    return this.http.delete<ApiResponse<unknown> | unknown>(
      `${this.apiUrl}/admin/categories/${id}`,
    );
  }

  copyCategory(id: number) {
    return this.http.post<ApiResponse<AdminCategory> | AdminCategory>(
      `${this.apiUrl}/admin/categories/${id}/copy`,
      {},
    );
  }
}
