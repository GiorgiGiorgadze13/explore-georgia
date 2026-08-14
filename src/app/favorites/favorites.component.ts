import { Component } from '@angular/core';
import { FilterCardComponent } from '../home/filter-card/filter-card.component';
import { FooterComponent } from '../home/footer/footer.component';
import { HeaderComponent } from '../home/header/header.component';

@Component({
  selector: 'app-favorites',
  imports: [FooterComponent,HeaderComponent,FilterCardComponent,],
  standalone:true,
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {

}
