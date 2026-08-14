import { Component } from '@angular/core';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-details-confirmation',
imports: [HeaderComponent,FooterComponent,RouterLink],
  standalone:true,
  templateUrl: './card-details-confirmation.component.html',
  styleUrl: './card-details-confirmation.component.css'
})
export class CardDetailsConfirmationComponent {

}
