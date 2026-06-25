import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxComponent {
  readonly label = input<string>('');
  readonly checked = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly checkedChange = output<boolean>();

  onToggle(): void {
    if (!this.disabled()) {
      this.checkedChange.emit(!this.checked());
    }
  }
}
