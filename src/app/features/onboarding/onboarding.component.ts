import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { PlacementService, PlacementQuestion } from '../../core/placement/placement.service';
import { OnboardingService } from '../../core/onboarding/onboarding.service';
import { UserService } from '../../core/user/user.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnboardingComponent {
  readonly authService = inject(AuthService);
  private readonly placementService = inject(PlacementService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Wizard state: 1, 2, 3, 4
  currentStep = signal<number>(1);
  progressPercentage = computed(() => this.currentStep() * 25);

  // Step 1: Learning Goal selection
  selectedGoal = signal<string>('');

  // Step 2: Placement Test State
  isTestingStarted = signal<boolean>(false);
  isTestingCompleted = signal<boolean>(false);
  currentQuestion = signal<PlacementQuestion | null>(null);
  questionStepInfo = signal<{ current: number; total: number }>({ current: 0, total: 20 });
  
  // Placement Test result state
  testResult = signal<{ estimatedLevel: string; confidenceScore: number } | null>(null);
  selectedSkipLevel = signal<string>('');
  isSkipping = signal<boolean>(false);

  // Submit answer feedback
  selectedOption = signal<string>('');
  submitFeedback = signal<{ isCorrect: boolean; show: boolean }>({ isCorrect: false, show: false });
  isSubmittingAnswer = signal<boolean>(false);
  placementSessionId = signal<string>('');

  // Step 3: Industry Track selection
  selectedTrack = signal<string>('');

  // Step 4: Daily Goal Commitment
  selectedDailyMinutes = signal<number>(15);

  // General loading & error states
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  readonly goals = [
    { value: 'JLPT', label: 'Luyện thi JLPT', desc: 'Hệ thống bài thi thử, Kanji & Ngữ pháp bám sát kỳ thi JLPT.', icon: 'school' },
    { value: 'WORK', label: 'Giao tiếp Công việc', desc: 'Từ vựng thương mại, email, báo cáo và Shadowing chuyên ngành.', icon: 'work' },
    { value: 'HOBBY', label: 'Sở thích / Văn hóa', desc: 'Tìm hiểu tin tức, bài viết, văn hóa Anime, Manga và cuộc sống.', icon: 'favorite' },
    { value: 'TRAVEL', label: 'Du lịch Nhật Bản', desc: 'Các đoạn hội thoại ngắn, chỉ đường, đặt phòng và văn hóa du lịch.', icon: 'flight_takeoff' }
  ];

  readonly tracks = [
    { value: 'NONE', label: 'Giao tiếp chung', desc: 'Không chọn chuyên ngành chuyên sâu, tập trung giao tiếp đời sống.', icon: 'chat' },
    { value: 'IT', label: 'Công nghệ thông tin', desc: 'Từ vựng CNTT, phát triển phần mềm, làm việc với team Nhật Bản.', icon: 'code' },
    { value: 'MANUFACTURING', label: 'Sản xuất / Chế tạo', desc: 'Thuật ngữ nhà xưởng, quy trình 5S, Kaizen và an toàn lao động.', icon: 'precision_manufacturing' },
    { value: 'FINANCE', label: 'Tài chính / Kế toán', desc: 'Học các mẫu báo cáo tài chính, kiểm toán và trao đổi ngân hàng.', icon: 'account_balance' },
    { value: 'LOGISTICS', label: 'Chuỗi cung ứng', desc: 'Các thuật ngữ kho bãi, quy trình xuất nhập khẩu và vận chuyển hàng.', icon: 'local_shipping' }
  ];

  readonly commitments = [
    { value: 5, label: '5 Phút / Ngày', desc: 'Khởi động nhẹ nhàng cho người bận rộn' },
    { value: 15, label: '15 Phút / Ngày', desc: 'Duy trì đều đặn, tích lũy kiến thức mỗi ngày' },
    { value: 30, label: '30 Phút / Ngày', desc: 'Tập trung chuyên sâu để bứt phá nhanh chóng' },
    { value: 60, label: '60 Phút / Ngày', desc: 'Cam kết cao độ, chinh phục tiếng Nhật thần tốc' }
  ];

  readonly jlptLevels = [
    { value: 'N5', label: 'N5', desc: 'Người mới bắt đầu học chữ Kana và ngữ pháp sơ cấp cơ bản.' },
    { value: 'N4', label: 'N4', desc: 'Đã nắm được ngữ pháp căn bản, giao tiếp chậm cuộc sống.' },
    { value: 'N3', label: 'N3', desc: 'Trung cấp, có thể hiểu hội thoại giao tiếp công sở căn bản.' },
    { value: 'N2', label: 'N2', desc: 'Thượng trung cấp, làm việc trực tiếp và đọc hiểu tài liệu chuyên ngành.' },
    { value: 'N1', label: 'N1', desc: 'Cao cấp, giao tiếp phản xạ tự nhiên như người bản xứ.' }
  ];

  nextStep() {
    if (this.currentStep() === 1 && !this.selectedGoal()) {
      this.errorMessage.set('Vui lòng chọn 1 mục tiêu học tập.');
      return;
    }

    if (this.currentStep() === 2 && !this.isTestingCompleted() && !this.selectedSkipLevel()) {
      this.errorMessage.set('Vui lòng hoàn thành bài kiểm tra hoặc tự chọn một trình độ xuất phát.');
      return;
    }

    if (this.currentStep() === 3 && !this.selectedTrack()) {
      this.errorMessage.set('Vui lòng chọn 1 định hướng chuyên ngành.');
      return;
    }

    this.errorMessage.set('');
    
    // Lưu các thay đổi tạm thời lên User Profile ở Backend khi chuyển step
    this.saveStepProgress().subscribe({
      next: () => {
        if (this.currentStep() < 4) {
          this.currentStep.update(s => s + 1);
        } else {
          this.completeOnboarding();
        }
      },
      error: () => {
        this.errorMessage.set('Không thể lưu cài đặt. Vui lòng thử lại.');
      }
    });
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.errorMessage.set('');
      this.currentStep.update(s => s - 1);
    }
  }

  selectGoal(goal: string) {
    this.selectedGoal.set(goal);
    this.errorMessage.set('');
  }

  selectTrack(track: string) {
    this.selectedTrack.set(track);
    this.errorMessage.set('');
  }

  selectCommitment(minutes: number) {
    this.selectedDailyMinutes.set(minutes);
  }

  // ── Placement Test Logic ──────────────────────────────────────────────────

  startPlacementTest() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    this.placementService.startSession().subscribe({
      next: (res) => {
        this.placementSessionId.set(res.data.id);
        this.isTestingStarted.set(true);
        this.loadNextQuestion();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Không thể bắt đầu bài kiểm tra. Vui lòng kiểm tra xem bạn có bị khóa re-test 30 ngày không.');
      }
    });
  }

  loadNextQuestion() {
    this.isLoading.set(true);
    this.selectedOption.set('');
    this.submitFeedback.set({ isCorrect: false, show: false });

    this.placementService.getNextQuestion().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.data.isCompleted) {
          this.finishTestDirectly();
        } else if (res.data.question) {
          this.currentQuestion.set(res.data.question);
          this.questionStepInfo.set({
            current: res.data.currentStep ?? 1,
            total: res.data.totalSteps ?? 20
          });
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Không thể tải câu hỏi tiếp theo.');
      }
    });
  }

  selectOption(option: string) {
    if (this.submitFeedback().show || this.isSubmittingAnswer()) return;
    this.selectedOption.set(option);
  }

  submitAnswer() {
    if (!this.selectedOption() || this.isSubmittingAnswer()) return;

    this.isSubmittingAnswer.set(true);
    const questionId = this.currentQuestion()!.id;
    const answer = this.selectedOption();

    this.placementService.submitAnswer(questionId, answer).subscribe({
      next: (res) => {
        this.isSubmittingAnswer.set(false);
        
        // Show correct/incorrect feedback
        this.submitFeedback.set({
          isCorrect: res.data.isCorrect ?? false,
          show: true
        });

        // Tự động chuyển câu hỏi sau 1.2 giây
        setTimeout(() => {
          if (res.data.isCompleted) {
            this.isTestingCompleted.set(true);
            this.testResult.set({
              estimatedLevel: res.data.estimatedLevel!,
              confidenceScore: res.data.confidenceScore!
            });
            // Đồng bộ trạng thái user cục bộ
            const user = this.authService.currentUser();
            if (user) {
              this.authService.currentUser.set({
                ...user,
                profile: {
                  ...user.profile,
                  levelResult: res.data.estimatedLevel!,
                  credits: user.profile?.credits ?? 5
                }
              });
            }
          } else {
            this.loadNextQuestion();
          }
        }, 1200);
      },
      error: () => {
        this.isSubmittingAnswer.set(false);
        this.errorMessage.set('Không thể nộp câu trả lời.');
      }
    });
  }

  finishTestDirectly() {
    if (!this.placementSessionId()) return;

    this.placementService.getResult(this.placementSessionId()).subscribe({
      next: (res) => {
        this.isTestingCompleted.set(true);
        this.testResult.set({
          estimatedLevel: res.data.estimatedLevel,
          confidenceScore: res.data.confidenceScore
        });
      }
    });
  }

  // Tự chọn trình độ
  toggleSkipLevel(level: string) {
    this.selectedSkipLevel.set(level);
    this.isSkipping.set(true);
  }

  confirmSkipLevel() {
    if (!this.selectedSkipLevel()) return;
    this.isLoading.set(true);

    this.placementService.skipPlacement(this.selectedSkipLevel()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isTestingCompleted.set(true);
        this.testResult.set({
          estimatedLevel: this.selectedSkipLevel(),
          confidenceScore: 0
        });
        this.errorMessage.set('');
        // Đồng bộ user state cục bộ
        const user = this.authService.currentUser();
        if (user) {
          this.authService.currentUser.set({
            ...user,
            profile: {
              ...user.profile,
              levelResult: this.selectedSkipLevel(),
              credits: user.profile?.credits ?? 5
            }
          });
        }
        // Tự động nhảy sang Step 3
        this.currentStep.set(3);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Không thể cập nhật trình độ tự chọn.');
      }
    });
  }

  // ── Database Sync Logic ───────────────────────────────────────────────────

  private saveStepProgress(): Observable<any> {
    const user = this.authService.currentUser();
    const updatePayload: any = {};

    if (this.currentStep() === 1 && this.selectedGoal()) {
      updatePayload.learningGoal = this.selectedGoal();
    }
    if (this.currentStep() === 3 && this.selectedTrack()) {
      updatePayload.industryTrack = this.selectedTrack();
    }

    if (Object.keys(updatePayload).length === 0) {
      return of(null);
    }

    // Giao tiếp với UserService để cập nhật profile
    if (updatePayload.industryTrack) {
      return this.userService.updateIndustryTrack(updatePayload.industryTrack);
    } else {
      return this.userService.updateProfile(updatePayload);
    }
  }

  completeOnboarding() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Đầu tiên lưu cam kết thời gian
    this.userService.updateProfile({
      dailyGoalMinutes: this.selectedDailyMinutes()
    }).subscribe({
      next: () => {
        // Gọi API hoàn thành Onboarding sinh Roadmap
        this.onboardingService.completeOnboarding().subscribe({
          next: (res) => {
            this.isLoading.set(false);
            
            // Đồng bộ trạng thái hoàn thành Onboarding lên auth state cục bộ
            const user = this.authService.currentUser();
            if (user) {
              this.authService.currentUser.set({
                ...user,
                profile: {
                  ...user.profile,
                  onboardingCompleted: true,
                  roadmapJson: res.data.profile.roadmapJson,
                  credits: res.data.profile.credits
                }
              });
            }

            // Chuyển hướng về trang Dashboard
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(err.error?.message || 'Không thể tạo lộ trình học tập.');
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Không thể lưu cam kết thời gian học.');
      }
    });
  }
}
