import { Component } from '@angular/core';
import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [HeaderComponent,FooterComponent,ReactiveFormsModule],
  standalone:true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
form = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    birthDate: new FormControl('', [Validators.required]),
    country: new FormControl('საქართველო', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    terms: new FormControl(false, [Validators.requiredTrue]),
  });

onSubmit() {
  if (this.form.invalid) return;

  const formValues = this.form.value;

   const payload = {
    firstName: formValues.firstName,
    lastName: formValues.lastName,
    email: formValues.email,
    password: formValues.password,
    phoneNumber: formValues.phone,   
    dateOfBirth: formValues.birthDate, // Mapped
    citizenship: formValues.country, // Mapped
    city: 'Tbilisi',  
    address: formValues.address,
    isDisabledPerson: false, // Add missing field (or add a checkbox)
    roleId: 1 // Add default role ID expected by your backend
  };

  // this.http.post('https://localhost:7037/api/auth/register', payload).subscribe(...)
}
}