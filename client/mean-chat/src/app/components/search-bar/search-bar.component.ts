import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent {
  constructor(private cdr: ChangeDetectorRef) {}
  @Output() searchQueryChanged: EventEmitter<any> = new EventEmitter<string>();
  private _searchQuery: string = '';

  get searchQuery(): string {
    return this._searchQuery;
  }

  set searchQuery(value: string) {
    this._searchQuery = value;
    this.searchQueryChanged.emit(value);
    this.onSearchQueryChanged();
  }

  onSearchQueryChanged() {
    this.searchQueryChanged.emit(this._searchQuery);
    this.cdr.detectChanges();
  }
}
