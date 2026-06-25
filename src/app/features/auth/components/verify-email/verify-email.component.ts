import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { useVerifyEmailMutation } from '../../queries/auth.queries';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly verifyMutation = useVerifyEmailMutation();

  token: string | null = null;

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || null;
    if (this.token) {
      this.verifyMutation.mutate(this.token);
    }
  }

  get verificationData(): any {
    return this.verifyMutation.data();
  }

  getErrorMessage(): string {
    const err = this.verifyMutation.error() as any;
    if (err?.error?.message) {
      return err.error.message;
    }
    return 'Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.';
  }
}
