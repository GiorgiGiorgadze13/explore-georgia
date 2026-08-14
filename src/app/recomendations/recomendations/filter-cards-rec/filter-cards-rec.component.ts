import { Component } from '@angular/core';
import { CardsComponent } from './cards/cards.component';
import { FiltersComponent } from './filters/filters.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-filter-cards-rec',
  imports: [FiltersComponent,CardsComponent,RouterLink],
  standalone:true,
  templateUrl: './filter-cards-rec.component.html',
  styleUrl: './filter-cards-rec.component.css'
})
export class FilterCardsRecComponent {

}
