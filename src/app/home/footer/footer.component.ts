import { Component, inject } from '@angular/core';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-footer',
  imports: [],
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  langService = inject(LanguageService);
}

