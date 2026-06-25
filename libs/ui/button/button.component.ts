import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  
  readonly click = output<MouseEvent>();

  onButtonClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.click.emit(event);
    }
  }
}
