import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { VietnamProvince } from '../models/vietnam-province.model';

@Injectable({
  providedIn: 'root',
})
export class VietnamProvinceApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getProvinces() {
    return this.http.get<VietnamProvince[]>(`${this.apiUrl}/admin/locations/provinces`);
  }
}
