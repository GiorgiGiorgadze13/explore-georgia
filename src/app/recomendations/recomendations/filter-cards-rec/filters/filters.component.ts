import { Component } from '@angular/core';

@Component({
  selector: 'app-filters',
  imports: [],
  standalone:true,
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  showFilters = false;

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}
