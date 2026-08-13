import { Component } from '@angular/core';
import { FilterCardsRecComponent } from './filter-cards-rec/filter-cards-rec.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { HeroComponent } from '../../home/hero/hero.component';
import { HeaderComponent } from '../../home/header/header.component';

@Component({
  selector: 'app-recomendations',
  imports: [FooterComponent, HeroComponent, HeaderComponent, FilterCardsRecComponent],
  standalone: true,
  templateUrl: './recomendations.component.html',
  styleUrl: './recomendations.component.css'
})
export class RecomendationsComponent {

}
