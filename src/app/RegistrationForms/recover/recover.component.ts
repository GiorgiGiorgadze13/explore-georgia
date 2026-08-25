import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { AuthService } from '../../Services/auth.service';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-recover',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './recover.component.html',
  styleUrl: './recover.component.css'
})
export class RecoverComponent {
  private authService = inject(AuthService);
  public langService = inject(LanguageService);
  private router = inject(Router);

  email = '';
  errorMessage = '';

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = this.langService.isGeo() ? 'გთხოვთ შეიყვანოთ ელფოსტა' : 'Please enter your email';
      return;
    }

    this.authService.setRecoveryEmail(this.email);
    this.router.navigate(['/recoverCode']);
  }
}
