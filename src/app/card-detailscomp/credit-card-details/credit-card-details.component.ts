import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { BookingService } from '../../Services/booking.service';
import { LanguageService } from '../../Services/language.service';
import { AuthService } from '../../Services/auth.service';
import { TourServicesService } from '../../Services/tour-services.service';

@Component({
  selector: 'app-credit-card-details',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './credit-card-details.component.html',
  styleUrl: './credit-card-details.component.css'
})
export class CreditCardDetailsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  public langService = inject(LanguageService);
  public tourServices = inject(TourServicesService);
  private router = inject(Router);

  fullName = signal<string>('');
  email = signal<string>('');
  phone = signal<string>('');

  cardNumber = signal<string>('');
  expiryDate = signal<string>('');
  cvv = signal<string>('');
  
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');

  tourName = signal<string>('ღვინისა და კულტურის ტური კახეთში');
  travelerCount = signal<number>(2);
  bookingDate = signal<string>('2026-10-24');
  totalAmount = signal<number>(450);
  servicesIncluded = signal<string[]>(['20-seat minibus', 'Traditional Georgian Lunch', 'Wine Tasting', 'Guide: Giorgi']);

  ngOnInit(): void {
    window.scrollTo(0, 0);

    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.fullName.set(`${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email);
      this.email.set(currentUser.email);
      if (currentUser.phone) {
        this.phone.set(currentUser.phone);
      }
    }

    const state = history.state;
    if (state) {
      if (state.tourName) this.tourName.set(state.tourName);
      if (state.travelerCount) this.travelerCount.set(state.travelerCount);
      if (state.bookingDate) this.bookingDate.set(state.bookingDate);
      if (state.totalAmount) this.totalAmount.set(state.totalAmount);
      if (state.servicesIncluded) this.servicesIncluded.set(state.servicesIncluded);
    }
  }

  cardBrand = computed<'Visa' | 'Mastercard' | 'Amex' | 'Credit Card'>(() => {
    const num = this.cardNumber().replace(/\s+/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    return 'Credit Card';
  });

  maskedCardNumber = computed(() => {
    const raw = this.cardNumber().replace(/\D/g, '');
    if (raw.length < 4) return '•••• •••• •••• ••••';
    const first4 = raw.slice(0, 4);
    const last4 = raw.slice(-4);
    return `${first4} •••• •••• ${last4}`;
  });

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 16);
    let formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardNumber.set(formatted);
  }

  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let digits = input.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    this.expiryDate.set(digits);
  }

  onCvvInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    this.cvv.set(digits);
  }

  onPaySubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');

    const name = this.fullName().trim();
    const mail = this.email().trim();
    const card = this.cardNumber().replace(/\s+/g, '');
    const exp = this.expiryDate().trim();
    const cvvVal = this.cvv().trim();

    if (!name) {
      this.errorMessage.set(this.langService.t('გთხოვთ შეიყვანოთ ბარათის მფლობელის სახელი'));
      return;
    }

    if (!mail || !mail.includes('@')) {
      this.errorMessage.set(this.langService.t('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი'));
      return;
    }

    if (card.length < 13) {
      this.errorMessage.set(this.langService.t('გთხოვთ შეიყვანოთ ბარათის 16-ნიშნა ნომერი'));
      return;
    }

    if (exp.length < 5) {
      this.errorMessage.set(this.langService.t('გთხოვთ შეიყვანოთ ბარათის მოქმედების ვადა (MM/YY)'));
      return;
    }

    if (cvvVal.length < 3) {
      this.errorMessage.set(this.langService.t('გთხოვთ შეიყვანოთ CVC/CVV კოდი'));
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      const createdBooking = this.bookingService.addBooking({
        customerName: name,
        customerEmail: mail,
        customerPhone: this.phone().trim() || '+995 599 000 000',
        tourName: this.tourName(),
        travelerCount: this.travelerCount(),
        totalAmount: this.totalAmount(),
        cardNumberMasked: this.maskedCardNumber(),
        cardHolder: name,
        cardBrand: this.cardBrand(),
        bookingDate: this.bookingDate(),
        servicesIncluded: this.servicesIncluded(),
        status: 'Completed'
      });

      sessionStorage.setItem('last_booking_id', createdBooking.id);

      this.isSubmitting.set(false);
      this.router.navigate(['/cc-confirm'], { state: { booking: createdBooking } });
    }, 800);
  }
}
