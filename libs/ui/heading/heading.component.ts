import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-heading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heading.component.html',
  styleUrls: ['./heading.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeadingComponent {
  readonly id = input<string>('ui-heading-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
