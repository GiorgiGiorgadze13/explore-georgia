import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  langService = inject(LanguageService);

  activeModal: 'about' | 'privacy' | 'contact' | null = null;

  // Contact Form State
  contactName = '';
  contactEmail = '';
  contactMessage = '';
  contactSuccess = false;

  openModal(modal: 'about' | 'privacy' | 'contact'): void {
    this.activeModal = modal;
    this.contactSuccess = false;
  }

  closeModal(): void {
    this.activeModal = null;
  }

  sendContactMessage(): void {
    if (this.contactName && this.contactEmail && this.contactMessage) {
      this.contactSuccess = true;
      this.contactName = '';
      this.contactEmail = '';
      this.contactMessage = '';
      setTimeout(() => {
        this.contactSuccess = false;
        this.closeModal();
      }, 3000);
    }
  }
}
