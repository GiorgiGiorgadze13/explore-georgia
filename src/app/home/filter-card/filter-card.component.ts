import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-filter-card',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './filter-card.component.html',
  styleUrl: './filter-card.component.css'
})
export class FilterCardComponent {
  showFilters = false;

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
}
