import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent {
  readonly id = input<string>('ui-calendar-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
