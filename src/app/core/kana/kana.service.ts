import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../auth/auth.service';

export interface KanaProgress {
  recognitionScore: number;
  writingScore: number;
  reviewCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
}

export interface KanaCharacter {
  id: string;
  type: 'HIRAGANA' | 'KATAKANA';
  character: string;
  romaji: string;
  rowGroup: string;
  audioUrl: string | null;
  strokeSvgPath: string | null;
  orderIndex: number;
  progress: KanaProgress;
}

export interface GetKanaListResponse {
  isKatakanaLocked: boolean;
  hiraganaOverallScore: number;
  characters: KanaCharacter[];
}

@Injectable({
  providedIn: 'root'
})
export class KanaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/api/v1/kana';

  getKanaList(): Observable<ApiResponse<GetKanaListResponse>> {
    return this.http.get<ApiResponse<GetKanaListResponse>>(this.apiUrl);
  }

  submitQuiz(kanaId: string, isCorrect: boolean): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/submit-quiz`, { kanaId, isCorrect });
  }

  submitWriting(kanaId: string, strokes: { x: number; y: number }[][]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/submit-writing`, { kanaId, strokes });
  }
}
