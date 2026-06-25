import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonComponent {
  readonly id = input<string>('ui-skeleton-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
