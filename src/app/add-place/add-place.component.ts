import { Component } from '@angular/core';
import { HeaderComponent } from '../home/header/header.component';
import { FooterComponent } from '../home/footer/footer.component';
import { MapComponent } from '../home/map/map.component';

@Component({
  selector: 'app-add-place',
  imports: [HeaderComponent,FooterComponent,MapComponent],
  standalone:true,
  templateUrl: './add-place.component.html',
  styleUrl: './add-place.component.css'
})
export class AddPlaceComponent {

}
