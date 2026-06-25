import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../auth/auth.service';

export interface UpdateProfileDto {
  displayName?: string;
  avatarUrl?: string;
  dailyGoalMinutes?: number;
  learningGoal?: string;
  targetLevel?: string;
}

export interface UserStats {
  totalXp: number;
  streakCount: number;
  longestStreak: number;
  levelResult: string | null;
  targetLevel: string | null;
  badgesCount: number;
  progress: {
    kanaLearned: number;
    kanjiLearned: number;
    grammarLearned: number;
  };
  xpLogs: {
    id: string;
    xpAmount: number;
    sourceType: string;
    createdAt: string;
  }[];
}

export interface UserSubscription {
  tier: string;
  credits: number;
  expiresAt: string | null;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/api/v1/users';

  updateProfile(dto: UpdateProfileDto): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/me`, dto);
  }

  updateIndustryTrack(industryTrack: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/me/industry-track`, { industryTrack });
  }

  getStats(): Observable<ApiResponse<UserStats>> {
    return this.http.get<ApiResponse<UserStats>>(`${this.apiUrl}/me/stats`);
  }

  getSubscription(): Observable<ApiResponse<UserSubscription>> {
    return this.http.get<ApiResponse<UserSubscription>>(`${this.apiUrl}/me/subscription`);
  }
}
