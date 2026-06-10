import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '../models/auth.model';
import { RoleCode, UserResponse } from '../models/user.model';

const ACCESS_TOKEN_KEY = 'voyage_viet_access_token';
const CURRENT_USER_KEY = 'voyage_viet_current_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  private readonly accessTokenSignal = signal<string | null>(this.getStoredToken());
  private readonly currentUserSignal = signal<UserResponse | null>(this.getStoredUser());

  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();

  readonly isLoggedIn = computed(() => !!this.accessTokenSignal());
  readonly currentRole = computed(() => this.currentUserSignal()?.role ?? null);

  login(request: LoginRequest) {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, request);
  }

  register(request: RegisterRequest) {
    return this.http.post<ApiResponse<UserResponse>>(`${this.apiUrl}/auth/register`, request);
  }

  forgotPassword(email: string) {
    const request: ForgotPasswordRequest = { email };
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/auth/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest) {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/auth/reset-password`, request);
  }

  verifyEmail(token: string) {
    const request: VerifyEmailRequest = { token };
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/auth/verify-email`, request);
  }

  me() {
    return this.http.get<ApiResponse<UserResponse>>(`${this.apiUrl}/users/me`);
  }

  saveSession(loginResponse: LoginResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, loginResponse.accessToken);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loginResponse.user));

    this.accessTokenSignal.set(loginResponse.accessToken);
    this.currentUserSignal.set(loginResponse.user);
  }

  updateCurrentUser(user: UserResponse): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);

    this.accessTokenSignal.set(null);
    this.currentUserSignal.set(null);

    this.router.navigateByUrl('/login');
  }

  hasRole(...roles: RoleCode[]): boolean {
    const role = this.currentUserSignal()?.role;
    return !!role && roles.includes(role);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN', 'SUPER_ADMIN');
  }

  isStaff(): boolean {
    return this.hasRole('STAFF', 'ADMIN', 'SUPER_ADMIN');
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private getStoredUser(): UserResponse | null {
    const rawUser = localStorage.getItem(CURRENT_USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as UserResponse;
    } catch {
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
  }
}
