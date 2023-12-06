import { Component, Input } from '@angular/core';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-search-display',
  templateUrl: './search-display.component.html',
  styleUrls: ['./search-display.component.css'],
})
export class SearchDisplayComponent {
  @Input() filteredContacts: User[] = [];
}
