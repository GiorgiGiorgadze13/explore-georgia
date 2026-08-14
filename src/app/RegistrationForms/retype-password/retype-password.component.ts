import { Component } from '@angular/core';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-retype-password',
 imports: [HeaderComponent,FooterComponent,RouterLink],
  standalone:true,
  templateUrl: './retype-password.component.html',
  styleUrl: './retype-password.component.css'
})
export class RetypePasswordComponent {

}
