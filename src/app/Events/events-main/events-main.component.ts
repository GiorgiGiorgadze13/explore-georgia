import { Component } from '@angular/core';
import { FooterComponent } from '../../home/footer/footer.component';
import { HeroComponent } from '../../home/hero/hero.component';
import { HeaderComponent } from '../../home/header/header.component';
import { FilterCardComponent } from '../../home/filter-card/filter-card.component';
import { CalendarFilterComponent } from '../calendar-filter/calendar-filter.component';

@Component({
  selector: 'app-events-main',
  imports: [FooterComponent,HeroComponent,HeaderComponent,FilterCardComponent,CalendarFilterComponent],
  standalone:true,
  templateUrl: './events-main.component.html',
  styleUrl: './events-main.component.css'
})
export class EventsMainComponent {

}
