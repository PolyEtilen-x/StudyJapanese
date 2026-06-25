import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { useLoginMutation } from '../../queries/auth.queries';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  readonly loginMutation = useLoginMutation();

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  get emailErrors(): boolean {
    const control = this.loginForm.get('email');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get passwordErrors(): boolean {
    const control = this.loginForm.get('password');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    
    const { email, password } = this.loginForm.value;
    this.loginMutation.mutate({
      email: email!,
      password: password!
    });
  }

  getErrorMessage(): string {
    const err = this.loginMutation.error() as any;
    if (err?.error?.message) {
      return err.error.message;
    }
    return 'Tên đăng nhập hoặc mật khẩu không chính xác.';
  }
}
