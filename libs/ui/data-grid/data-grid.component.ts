import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-data-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataGridComponent {
  readonly id = input<string>('ui-data-grid-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
