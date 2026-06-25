import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly value = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input<boolean>(false);

  readonly valueChange = output<string>();

  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
