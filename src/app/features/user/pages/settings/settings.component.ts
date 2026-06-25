import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { useUpdateProfileMutation, useUpdateIndustryTrackMutation } from '../../queries/user.queries';
import { UserStatusBadgeComponent } from '../../components/user-status-badge/user-status-badge.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UserStatusBadgeComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Mutations
  readonly updateProfileMutation = useUpdateProfileMutation();
  readonly updateIndustryTrackMutation = useUpdateIndustryTrackMutation();

  readonly settingsForm = this.fb.group({
    dailyGoalMinutes: [15, [Validators.required, Validators.min(5), Validators.max(120)]],
    learningGoal: ['JLPT', [Validators.required]],
    targetLevel: ['N3', [Validators.required]],
    industryTrack: ['NONE', [Validators.required]]
  });

  // UI state
  saveSuccess = false;

  readonly goalsList = [
    { label: '5 Phút (Khởi động)', value: 5 },
    { label: '15 Phút (Bình thường)', value: 15 },
    { label: '30 Phút (Tập trung)', value: 30 },
    { label: '60 Phút (Bứt phá)', value: 60 }
  ];

  readonly learningGoals = [
    { label: 'Luyện thi JLPT', value: 'JLPT' },
    { label: 'Giao tiếp Công việc', value: 'WORK' },
    { label: 'Sở thích / Văn hóa', value: 'HOBBY' },
    { label: 'Du lịch Nhật Bản', value: 'TRAVEL' }
  ];

  readonly jlptLevels = [
    { label: 'N5 (Sơ cấp 1)', value: 'N5' },
    { label: 'N4 (Sơ cấp 2)', value: 'N4' },
    { label: 'N3 (Trung cấp)', value: 'N3' },
    { label: 'N2 (Thượng trung cấp)', value: 'N2' },
    { label: 'N1 (Cao cấp)', value: 'N1' }
  ];

  readonly industryTracks = [
    { label: 'Chưa có định hướng', value: 'NONE' },
    { label: 'Công nghệ thông tin (IT)', value: 'IT' },
    { label: 'Sản xuất / Chế tạo (Manufacturing)', value: 'MANUFACTURING' },
    { label: 'Tài chính / Kế toán (Finance)', value: 'FINANCE' },
    { label: 'Logistics / Chuỗi cung ứng', value: 'LOGISTICS' }
  ];

  constructor() {
    this.resetForm();
  }

  resetForm() {
    const user = this.authService.currentUser();
    this.settingsForm.patchValue({
      dailyGoalMinutes: user?.profile?.dailyGoalMinutes || 15,
      learningGoal: user?.profile?.learningGoal || 'JLPT',
      targetLevel: user?.profile?.targetLevel || 'N3',
      industryTrack: user?.profile?.industryTrack || 'NONE'
    });
  }

  onSubmit() {
    if (this.settingsForm.invalid) return;

    const { dailyGoalMinutes, learningGoal, targetLevel, industryTrack } = this.settingsForm.value;

    // Trigger update profile
    this.updateProfileMutation.mutate({
      dailyGoalMinutes: Number(dailyGoalMinutes),
      learningGoal: learningGoal!,
      targetLevel: targetLevel!
    }, {
      onSuccess: () => {
        // Trigger update industry track
        this.updateIndustryTrackMutation.mutate(industryTrack!, {
          onSuccess: () => {
            this.saveSuccess = true;
            setTimeout(() => {
              this.saveSuccess = false;
            }, 3000);
          }
        });
      }
    });
  }
}
