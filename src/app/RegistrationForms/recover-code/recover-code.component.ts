import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { AuthService } from '../../Services/auth.service';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-recover-code',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './recover-code.component.html',
  styleUrl: './recover-code.component.css'
})
export class RecoverCodeComponent {
  private authService = inject(AuthService);
  public langService = inject(LanguageService);
  private router = inject(Router);

  c1 = '';
  c2 = '';
  c3 = '';
  c4 = '';
  errorMessage = '';

  onSubmit(): void {
    const fullCode = `${this.c1}${this.c2}${this.c3}${this.c4}`;
    if (!fullCode || fullCode.length < 4) {
      this.errorMessage = this.langService.isGeo() ? 'გთხოვთ შეიყვანოთ 4-ნიშნა კოდი' : 'Please enter the 4-digit code';
      return;
    }

    if (this.authService.verifyCode(fullCode)) {
      this.router.navigate(['/retypePassword']);
    } else {
      this.errorMessage = this.langService.isGeo() ? 'კოდი არასწორია' : 'Invalid code';
    }
  }

  onDigitInput(event: any, nextInput?: HTMLInputElement): void {
    if (event.target.value && nextInput) {
      nextInput.focus();
    }
  }
}
