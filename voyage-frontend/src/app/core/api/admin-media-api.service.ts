import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AdminMediaItem, AdminMediaListParams, AdminMediaUploadResponse } from '../models/media.model';
import { PageResponse } from '../models/page-response.model';

export type AdminMediaListResponse =
  | ApiResponse<PageResponse<AdminMediaItem> | AdminMediaItem[]>
  | PageResponse<AdminMediaItem>
  | AdminMediaItem[];

@Injectable({
  providedIn: 'root',
})
export class AdminMediaApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMedia(params: AdminMediaListParams = {}) {
    return this.http.get<AdminMediaListResponse>(`${this.apiUrl}/admin/media`, {
      params: this.buildParams(params),
    });
  }

  uploadMedia(file: File, module: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', module);

    return this.http.post<ApiResponse<AdminMediaUploadResponse | AdminMediaItem> | AdminMediaUploadResponse | AdminMediaItem>(
      `${this.apiUrl}/admin/media/upload`,
      formData,
    );
  }

  deleteMedia(id: number) {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/admin/media/${id}`);
  }

  private buildParams(params: AdminMediaListParams): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
