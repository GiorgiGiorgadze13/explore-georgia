import { Component } from '@angular/core';
import { FilterCardComponent } from '../../home/filter-card/filter-card.component';
import { HeaderComponent } from '../../home/header/header.component';
import { HeroComponent } from '../../home/hero/hero.component';
import { FooterComponent } from '../../home/footer/footer.component';

@Component({
  selector: 'app-experience',
  imports: [FooterComponent,HeroComponent,HeaderComponent,FilterCardComponent,],
  standalone:true,
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.css'
})
export class ExperienceComponent {

}
