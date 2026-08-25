import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { AuthService } from '../../Services/auth.service';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-retype-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './retype-password.component.html',
  styleUrl: './retype-password.component.css'
})
export class RetypePasswordComponent {
  private authService = inject(AuthService);
  public langService = inject(LanguageService);
  private router = inject(Router);

  newPassword = '';
  errorMessage = '';
  successMessage = '';

  get isLongEnough(): boolean {
    return this.newPassword.length >= 6;
  }

  get hasNumber(): boolean {
    return /\d/.test(this.newPassword);
  }

  onSubmit(): void {
    if (!this.newPassword) {
      this.errorMessage = this.langService.isGeo() ? 'გთხოვთ შეიყვანოთ ახალი პაროლი' : 'Please enter a new password';
      return;
    }

    if (!this.isLongEnough) {
      this.errorMessage = this.langService.isGeo() ? 'პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან' : 'Password must be at least 6 characters long';
      return;
    }

    const success = this.authService.resetPassword(this.newPassword);
    if (success) {
      this.errorMessage = '';
      this.successMessage = this.langService.isGeo() ? 'პაროლი წარმატებით შეიცვალა! გადამისამართება...' : 'Password updated successfully! Redirecting...';
      setTimeout(() => {
        this.router.navigate(['/auth']);
      }, 1500);
    } else {
      this.errorMessage = this.langService.isGeo() ? 'პაროლის შეცვლა ვერ მოხერხდა' : 'Failed to update password';
    }
  }
}
