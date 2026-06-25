import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextComponent {
  readonly id = input<string>('ui-text-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
