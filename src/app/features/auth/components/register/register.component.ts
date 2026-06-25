import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { useRegisterMutation } from '../../queries/auth.queries';

function passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  readonly registerMutation = useRegisterMutation();

  readonly registerForm = this.fb.group({
    displayName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  get displayNameErrors(): boolean {
    const control = this.registerForm.get('displayName');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get emailErrors(): boolean {
    const control = this.registerForm.get('email');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get passwordErrors(): boolean {
    const control = this.registerForm.get('password');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get confirmPasswordErrors(): boolean {
    const control = this.registerForm.get('confirmPassword');
    const hasMismatch = this.registerForm.hasError('passwordMismatch');
    return !!(
      (control && control.invalid && (control.dirty || control.touched)) ||
      (hasMismatch && control && (control.dirty || control.touched))
    );
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    const { email, password, displayName } = this.registerForm.value;
    this.registerMutation.mutate({
      email: email!,
      password: password!,
      displayName: displayName!
    });
  }

  getErrorMessage(): string {
    const err = this.registerMutation.error() as any;
    if (err?.error?.message) {
      return err.error.message;
    }
    return 'Đã xảy ra lỗi trong quá trình tạo tài khoản. Vui lòng thử lại.';
  }
}
