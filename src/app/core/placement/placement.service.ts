import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../auth/auth.service';

export interface PlacementQuestion {
  id: string;
  level: string;
  type: string;
  contentJp: string;
  options: string[];
}

export interface NextQuestionResponse {
  isCompleted: boolean;
  question?: PlacementQuestion;
  currentStep?: number;
  totalSteps?: number;
  estimatedLevel?: string;
  confidenceScore?: number;
}

export interface SubmitAnswerResponse {
  isCompleted: boolean;
  isCorrect?: boolean;
  estimatedLevel?: string;
  confidenceScore?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlacementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/api/v1/placement';

  startSession(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/start`, {});
  }

  getNextQuestion(): Observable<ApiResponse<NextQuestionResponse>> {
    return this.http.get<ApiResponse<NextQuestionResponse>>(`${this.apiUrl}/question`);
  }

  submitAnswer(questionId: string, answer: string): Observable<ApiResponse<SubmitAnswerResponse>> {
    return this.http.post<ApiResponse<SubmitAnswerResponse>>(`${this.apiUrl}/submit`, { questionId, answer });
  }

  skipPlacement(targetLevel: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/skip`, { targetLevel });
  }

  getResult(sessionId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/result/${sessionId}`);
  }
}
