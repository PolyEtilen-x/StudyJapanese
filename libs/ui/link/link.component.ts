import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-link',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkComponent {
  readonly id = input<string>('ui-link-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
