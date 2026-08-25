import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  public langService = inject(LanguageService);
  private router = inject(Router);

  errorMessage = '';

  form = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    birthDate: new FormControl('', [Validators.required]),
    country: new FormControl('საქართველო', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
    terms: new FormControl(false, [Validators.requiredTrue]),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMessage = this.langService.isGeo() 
        ? 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი და დაეთანხმოთ წესებს' 
        : 'Please complete all required fields and accept terms.';
      return;
    }

    const values = this.form.value;
    const res = this.authService.register({
      firstName: values.firstName!,
      lastName: values.lastName!,
      email: values.email!,
      password: values.password!,
      phone: values.phone || undefined,
      birthDate: values.birthDate || undefined,
      country: values.country || undefined,
      address: values.address || undefined
    });

    if (res.success) {
      this.router.navigate(['/']);
    } else {
      this.errorMessage = res.message || (this.langService.isGeo() ? 'რეგისტრაციის შეცდომა' : 'Registration failed');
    }
  }
}