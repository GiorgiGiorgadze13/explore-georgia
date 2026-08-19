import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterModule
} from '@angular/router';

import { FilterCardService } from '../../Services/filter-card.service';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-filter-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './filter-card.component.html',
  styleUrl: './filter-card.component.css'
})
export class FilterCardComponent {

  private filter = inject(FilterCardService);
  public langService = inject(LanguageService);

  showFilters = false;

  toggleFilters(event: Event): void {
    event.stopPropagation();
    this.showFilters = !this.showFilters;
  }

  selectNature(val: string): void {
    this.filter.selectedNature.set(val);
  }

  selectRegion(val: string): void {
    console.log('Selected region:', val);

    this.filter.selectedRegion.set(val);
  }

  selectWheelchair(value: boolean): void {
    this.filter.wheelchairAccessible.set(value);
  }

  clearFilters(): void {
    this.filter.selectedRegion.set('');
    this.filter.selectedNature.set('');
    this.filter.wheelchairAccessible.set(false);
  }
}