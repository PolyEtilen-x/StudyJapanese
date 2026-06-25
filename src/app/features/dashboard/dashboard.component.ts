import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { useRequestVerificationMutation, useLogoutMutation } from '../auth/queries/auth.queries';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
  readonly requestVerificationMutation = useRequestVerificationMutation();
  readonly logoutMutation = useLogoutMutation();

  onSendVerification() {
    const user = this.authService.currentUser();
    if (user?.email) {
      this.requestVerificationMutation.mutate(user.email);
    }
  }

  onLogout() {
    this.logoutMutation.mutate();
  }
}
