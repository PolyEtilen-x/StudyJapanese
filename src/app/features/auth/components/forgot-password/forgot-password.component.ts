import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { useForgotPasswordMutation } from '../../queries/auth.queries';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  readonly forgotMutation = useForgotPasswordMutation();

  readonly forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  get emailErrors(): boolean {
    const control = this.forgotForm.get('email');
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;
    this.forgotMutation.mutate(this.forgotForm.value.email!);
  }
}
