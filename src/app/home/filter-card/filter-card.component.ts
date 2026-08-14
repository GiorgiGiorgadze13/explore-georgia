import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-filter-card',
  standalone: true,
  imports: [CommonModule,RouterModule,RouterLinkActive,RouterLink],
  templateUrl: './filter-card.component.html',
  styleUrl: './filter-card.component.css'
})
export class FilterCardComponent {
  showFilters = false;

toggleFilters(event: Event) {
  event.stopPropagation();
  this.showFilters = !this.showFilters;
}
}
