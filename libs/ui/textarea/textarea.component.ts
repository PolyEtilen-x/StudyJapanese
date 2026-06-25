import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly value = input<string>('');
  readonly rows = input<number>(4);
  readonly error = input<string>('');
  readonly disabled = input<boolean>(false);

  readonly valueChange = output<string>();

  onValueChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.valueChange.emit(target.value);
  }
}
