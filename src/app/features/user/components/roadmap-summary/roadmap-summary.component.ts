import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-roadmap-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './roadmap-summary.component.html',
  styleUrls: ['./roadmap-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapSummaryComponent {
  readonly authService = inject(AuthService);

  // Chỉ số tuần đang mở rộng (accordion mode) để tránh timeline quá dài
  activeWeekIndex = signal<number>(0);

  get roadmap() {
    return this.authService.currentUser()?.profile?.roadmapJson;
  }

  get weeks() {
    return this.roadmap?.weeks || [];
  }

  get targetLevel() {
    return this.roadmap?.targetLevel || 'N3';
  }

  get levelResult() {
    return this.roadmap?.levelResult || 'N5';
  }

  get industryTrack() {
    const track = this.roadmap?.industryTrack || 'NONE';
    const labels: Record<string, string> = {
      IT: 'Công nghệ thông tin',
      MANUFACTURING: 'Sản xuất / Chế tạo',
      FINANCE: 'Tài chính / Kế toán',
      LOGISTICS: 'Logistics / Chuỗi cung ứng',
      NONE: 'Giao tiếp chung'
    };
    return labels[track] || 'Giao tiếp chung';
  }

  get dailyGoalMinutes() {
    return this.roadmap?.dailyGoalMinutes || 15;
  }

  toggleWeek(index: number) {
    if (this.activeWeekIndex() === index) {
      this.activeWeekIndex.set(-1); // Đóng lại nếu click cái đang mở
    } else {
      this.activeWeekIndex.set(index);
    }
  }

  getTrackIcon(track: string): string {
    const icons: Record<string, string> = {
      IT: 'code',
      MANUFACTURING: 'precision_manufacturing',
      FINANCE: 'account_balance',
      LOGISTICS: 'local_shipping',
      NONE: 'chat'
    };
    return icons[track] || 'chat';
  }
}
