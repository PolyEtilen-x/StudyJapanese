import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeComponent {
  readonly variant = input<'success' | 'warning' | 'error' | 'info'>('info');
}
