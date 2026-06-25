import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-divider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DividerComponent {
  readonly id = input<string>('ui-divider-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
