import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { AuthService } from '../../Services/auth.service';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  public authService = inject(AuthService);
  public langService = inject(LanguageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  emailOrPhone = '';
  password = '';
  errorMessage = '';

  onSubmit(): void {
    if (!this.emailOrPhone || !this.password) {
      this.errorMessage = this.langService.isGeo() 
        ? 'გთხოვთ შეავსოთ ყველა ველი' 
        : 'Please fill in all fields';
      return;
    }

    const res = this.authService.login(this.emailOrPhone, this.password);
    if (res.success) {
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.errorMessage = res.message || (this.langService.isGeo() ? 'ავტორიზაციის შეცდომა' : 'Authentication failed');
    }
  }
}
