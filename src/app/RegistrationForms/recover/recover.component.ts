import { Component } from '@angular/core';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recover',
  imports: [HeaderComponent,FooterComponent,RouterLink],
  standalone:true,
  templateUrl: './recover.component.html',
  styleUrl: './recover.component.css'
})
export class RecoverComponent {

}
