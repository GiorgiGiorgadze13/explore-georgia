import { Component, inject } from '@angular/core';
import { CardsComponent } from './cards/cards.component';
import { FiltersComponent } from './filters/filters.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../../Services/language.service';
import { FilterCardService } from '../../../Services/filter-card.service';

@Component({
  selector: 'app-filter-cards-rec',
  standalone: true,
  imports: [FiltersComponent, CardsComponent, RouterLink, RouterLinkActive],
  templateUrl: './filter-cards-rec.component.html',
  styleUrl: './filter-cards-rec.component.css'
})
export class FilterCardsRecComponent {
  public langService = inject(LanguageService);
  public filterService = inject(FilterCardService);

  selectNature(val: string): void {
    this.filterService.selectedNature.set(val);
  }
}
