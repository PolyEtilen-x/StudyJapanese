import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DrawerComponent {
  readonly id = input<string>('ui-drawer-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
