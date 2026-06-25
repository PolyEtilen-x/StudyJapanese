import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent {
  readonly message = input<string>('');
  readonly variant = input<'success' | 'warning' | 'error' | 'info'>('info');
  readonly close = output<void>();
}
