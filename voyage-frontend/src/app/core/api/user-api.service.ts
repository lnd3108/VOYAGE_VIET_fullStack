import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AvatarUploadResponse, UserMeResponse, UserProfileUpdateRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMe() {
    return this.http.get<ApiResponse<UserMeResponse>>(`${this.apiUrl}/users/me`);
  }

  updateMe(payload: UserProfileUpdateRequest) {
    return this.http.put<ApiResponse<UserMeResponse>>(`${this.apiUrl}/users/me`, payload);
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<AvatarUploadResponse | UserMeResponse>>(
      `${this.apiUrl}/users/me/avatar`,
      formData,
    );
  }
}
