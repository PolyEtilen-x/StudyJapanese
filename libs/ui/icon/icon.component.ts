import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  readonly id = input<string>('ui-icon-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
