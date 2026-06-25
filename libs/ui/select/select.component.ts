import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent {
  readonly label = input<string>('');
  readonly options = input<{label: string, value: string}[]>([]);
  readonly value = input<string>('');
  readonly disabled = input<boolean>(false);

  readonly valueChange = output<string>();

  onSelectChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.valueChange.emit(target.value);
  }
}
