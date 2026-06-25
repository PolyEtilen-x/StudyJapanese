import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-user-status-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-status-badge.component.html',
  styleUrls: ['./user-status-badge.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserStatusBadgeComponent {
  readonly authService = inject(AuthService);

  get tier(): string {
    return this.authService.currentUser()?.tier ?? 'FREE';
  }

  get credits(): number {
    return this.authService.currentUser()?.profile?.credits ?? 0;
  }
}
