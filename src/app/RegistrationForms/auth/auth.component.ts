import { Component } from '@angular/core';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';

@Component({
  selector: 'app-auth',
  imports: [HeaderComponent,FooterComponent],
  standalone:true,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

}
