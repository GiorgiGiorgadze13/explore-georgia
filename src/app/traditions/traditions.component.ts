import { Component } from '@angular/core';
import { FilterCardComponent } from '../home/filter-card/filter-card.component';
import { FooterComponent } from '../home/footer/footer.component';
import { HeroComponent } from '../home/hero/hero.component';
import { HeaderComponent } from '../home/header/header.component';

@Component({
  selector: 'app-traditions',
  imports: [FooterComponent,HeroComponent,HeaderComponent,FilterCardComponent,],
  standalone:true,
  templateUrl: './traditions.component.html',
  styleUrl: './traditions.component.css'
})
export class TraditionsComponent {

}
