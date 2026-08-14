import { Component } from '@angular/core';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-credit-card-details',
  imports: [HeaderComponent,FooterComponent,RouterLink],
  standalone:true,
  templateUrl: './credit-card-details.component.html',
  styleUrl: './credit-card-details.component.css'
})
export class CreditCardDetailsComponent {

}
