import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { useUserStatsQuery, useUpdateProfileMutation } from '../../queries/user.queries';
import { UserStatusBadgeComponent } from '../../components/user-status-badge/user-status-badge.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UserStatusBadgeComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Queries & Mutations
  readonly statsQuery = useUserStatsQuery();
  readonly updateProfileMutation = useUpdateProfileMutation();

  isEditMode = false;

  readonly profileForm = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    avatarUrl: ['', [Validators.pattern(/https?:\/\/.+/)]]
  });

  constructor() {
    this.resetForm();
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.resetForm();
    }
  }

  resetForm() {
    const user = this.authService.currentUser();
    this.profileForm.patchValue({
      displayName: user?.profile?.displayName || '',
      avatarUrl: user?.profile?.avatarUrl || ''
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    const { displayName, avatarUrl } = this.profileForm.value;
    
    this.updateProfileMutation.mutate({
      displayName: displayName!,
      avatarUrl: avatarUrl || undefined
    }, {
      onSuccess: () => {
        this.isEditMode = false;
      }
    });
  }

  get displayNameErrors(): boolean {
    const control = this.profileForm.get('displayName');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get avatarUrlErrors(): boolean {
    const control = this.profileForm.get('avatarUrl');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
