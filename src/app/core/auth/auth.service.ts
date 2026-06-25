import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';

export interface UserProfileData {
  displayName?: string;
  avatarUrl?: string;
  levelResult?: string;
  industryTrack?: string;
  dailyGoalMinutes?: number;
  learningGoal?: string;
  targetLevel?: string;
  streakCount?: number;
  longestStreak?: number;
  totalXp?: number;
  credits: number;
  onboardingCompleted?: boolean;
  roadmapJson?: any;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  tier: string;
  profile?: UserProfileData;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
  message?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly apiUrl = 'http://localhost:3001/api/v1';
  private readonly isBrowser: boolean;
  private accessToken: string | null = null;
  
  // Auth signals
  currentUser = signal<UserProfile | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  isEmailVerified = computed(() => this.currentUser()?.isEmailVerified ?? false);

  constructor() {
    const platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.initAuth();
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // ── API Operations ────────────────────────────────────────────────────────
  
  login(email: string, password: string): Observable<ApiResponse<TokenPair>> {
    return this.http.post<ApiResponse<TokenPair>>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        this.saveTokens(res.data);
      }),
      switchMap(() => this.fetchCurrentUser()),
      map((userRes) => {
        // Return original login response formatted for consumer
        return {
          success: true,
          data: { accessToken: this.accessToken!, refreshToken: this.getStoredRefreshToken()! },
          timestamp: new Date().toISOString(),
          path: '/auth/login'
        };
      })
    );
  }

  register(email: string, password: string, displayName: string): Observable<ApiResponse<TokenPair>> {
    return this.http.post<ApiResponse<TokenPair>>(`${this.apiUrl}/auth/register`, { email, password, displayName }).pipe(
      tap((res) => {
        this.saveTokens(res.data);
      }),
      switchMap(() => this.fetchCurrentUser()),
      map(() => {
        return {
          success: true,
          data: { accessToken: this.accessToken!, refreshToken: this.getStoredRefreshToken()! },
          timestamp: new Date().toISOString(),
          path: '/auth/register'
        };
      })
    );
  }

  refreshToken(): Observable<TokenPair> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<ApiResponse<TokenPair>>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      map((res) => res.data),
      tap((tokens) => {
        this.saveTokens(tokens);
      }),
      catchError((err) => {
        this.logoutAndRedirect();
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<ApiResponse<void>> {
    const refreshToken = this.getStoredRefreshToken();
    const clearSession = () => {
      this.accessToken = null;
      this.currentUser.set(null);
      if (this.isBrowser) {
        localStorage.removeItem('refresh_token');
      }
      this.router.navigate(['/login']);
    };

    if (!refreshToken) {
      clearSession();
      return of({ success: true, data: undefined, timestamp: new Date().toISOString(), path: '/auth/logout' });
    }

    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/auth/logout`, { refreshToken }).pipe(
      tap(() => clearSession()),
      catchError((err) => {
        clearSession();
        return of({ success: true, data: undefined, timestamp: new Date().toISOString(), path: '/auth/logout' });
      })
    );
  }

  fetchCurrentUser(): Observable<ApiResponse<UserProfile>> {
    return this.http.post<ApiResponse<UserProfile>>(`${this.apiUrl}/auth/me`, {}).pipe(
      tap((res) => {
        this.currentUser.set(res.data);
      })
    );
  }

  verifyEmail(token: string): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.http.post<ApiResponse<{ success: boolean; message: string }>>(`${this.apiUrl}/auth/verify-email`, { token }).pipe(
      tap((res) => {
        // If the verified user is currently logged in, update their status
        const user = this.currentUser();
        if (user) {
          this.currentUser.set({ ...user, isEmailVerified: true });
        }
      })
    );
  }

  requestEmailVerification(email: string): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.http.post<ApiResponse<{ success: boolean; message: string }>>(`${this.apiUrl}/auth/verify-email/request`, { email });
  }

  forgotPassword(email: string): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.http.post<ApiResponse<{ success: boolean; message: string }>>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse<{ success: boolean; message: string }>> {
    return this.http.post<ApiResponse<{ success: boolean; message: string }>>(`${this.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  logoutAndRedirect() {
    this.accessToken = null;
    this.currentUser.set(null);
    if (this.isBrowser) {
      localStorage.removeItem('refresh_token');
    }
    this.router.navigate(['/login']);
  }

  // ── Token Storage Helpers ──────────────────────────────────────────────────
  
  private initAuth() {
    const storedRefreshToken = this.getStoredRefreshToken();
    if (storedRefreshToken) {
      this.refreshToken().subscribe({
        next: () => {
          this.fetchCurrentUser().subscribe();
        },
        error: () => {
          this.logoutAndRedirect();
        }
      });
    }
  }

  private saveTokens(tokens: TokenPair) {
    this.accessToken = tokens.accessToken;
    if (this.isBrowser) {
      localStorage.setItem('refresh_token', tokens.refreshToken);
    }
  }

  private getStoredRefreshToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }
}
