import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverComponent {
  readonly id = input<string>('ui-popover-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
