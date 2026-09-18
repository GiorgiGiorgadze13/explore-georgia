import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { HeaderComponent } from '../../home/header/header.component';
import { FooterComponent } from '../../home/footer/footer.component';
import { BookingService, BookingRecord } from '../../Services/booking.service';
import { LanguageService } from '../../Services/language.service';

@Component({
  selector: 'app-card-details-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './card-details-confirmation.component.html',
  styleUrl: './card-details-confirmation.component.css'
})
export class CardDetailsConfirmationComponent implements OnInit {
  private bookingService = inject(BookingService);
  public langService = inject(LanguageService);

  booking = signal<BookingRecord | null>(null);

  ngOnInit(): void {
    window.scrollTo(0, 0);

    const state = history.state;
    if (state && state.booking) {
      this.booking.set(state.booking);
      return;
    }

    const lastId = sessionStorage.getItem('last_booking_id');
    if (lastId) {
      const found = this.bookingService.getBookingById(lastId);
      if (found) {
        this.booking.set(found);
        return;
      }
    }

    const all = this.bookingService.getBookings();
    if (all.length > 0) {
      this.booking.set(all[0]);
    }
  }
}
