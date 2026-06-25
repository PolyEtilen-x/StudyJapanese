import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-autocomplete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent {
  readonly id = input<string>('ui-autocomplete-' + Math.random().toString(36).substring(2, 9));
  readonly disabled = input<boolean>(false);
  readonly customClass = input<string>('');
}
