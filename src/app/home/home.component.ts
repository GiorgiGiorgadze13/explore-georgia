import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { HeroComponent } from './hero/hero.component';
import { FilterCardComponent } from './filter-card/filter-card.component';
import { FooterComponent } from './footer/footer.component';
import { MapsComponent } from './maps/maps.component';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent,HeroComponent,FilterCardComponent,FooterComponent,MapsComponent],
  standalone:true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
