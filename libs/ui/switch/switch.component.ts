import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-switch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwitchComponent {
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
