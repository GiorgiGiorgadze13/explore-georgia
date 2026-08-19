import { Component, inject } from '@angular/core';
import { FilterCardService } from '../../../../Services/filter-card.service';

@Component({
  selector: 'app-filters',
  imports: [],
  standalone: true,
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  private filterService = inject(FilterCardService);
  showFilters = false;

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  selectNature(val: string): void {
    this.filterService.selectedNature.set(val);
  }

  selectRegion(val: string): void {
    this.filterService.selectedRegion.set(val);
  }

  selectWheelchair(val: boolean): void {
    this.filterService.wheelchairAccessible.set(val);
  }

  clearFilters(): void {
    this.filterService.selectedRegion.set('');
    this.filterService.selectedNature.set('');
    this.filterService.wheelchairAccessible.set(false);
  }
}
