import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { useRequestVerificationMutation, useLogoutMutation } from '../auth/queries/auth.queries';
import { UserStatusBadgeComponent } from '../user/components/user-status-badge/user-status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UserStatusBadgeComponent, RouterLink],
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
