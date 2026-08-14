import { Component } from '@angular/core';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recover-code',
  imports: [HeaderComponent,FooterComponent,RouterLink],
  standalone:true,
  templateUrl: './recover-code.component.html',
  styleUrl: './recover-code.component.css'
})
export class RecoverCodeComponent {

}
