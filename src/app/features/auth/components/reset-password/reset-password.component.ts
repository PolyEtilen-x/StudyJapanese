import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { useResetPasswordMutation } from '../../queries/auth.queries';

function passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly resetMutation = useResetPasswordMutation();

  token: string | null = null;

  readonly resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || null;
  }

  get passwordErrors(): boolean {
    const control = this.resetForm.get('password');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get confirmPasswordErrors(): boolean {
    const control = this.resetForm.get('confirmPassword');
    const hasMismatch = this.resetForm.hasError('passwordMismatch');
    return !!(
      (control && control.invalid && (control.dirty || control.touched)) ||
      (hasMismatch && control && (control.dirty || control.touched))
    );
  }

  onSubmit() {
    if (this.resetForm.invalid || !this.token) return;
    this.resetMutation.mutate({
      token: this.token,
      newPassword: this.resetForm.value.password!
    });
  }

  getErrorMessage(): string {
    const err = this.resetMutation.error() as any;
    if (err?.error?.message) {
      return err.error.message;
    }
    return 'Mã khôi phục không hợp lệ hoặc đã hết hạn.';
  }
}
