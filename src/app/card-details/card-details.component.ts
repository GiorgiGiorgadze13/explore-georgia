import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../home/header/header.component';
import { FooterComponent } from '../home/footer/footer.component';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './card-details.component.html',
})
export class CardDetailsComponent {
  rawDate = signal<string>('2026-10-24');
  guests = signal<number>(2);
  pricePerPerson = 150;

  formattedDate = computed(() => {
    const value = this.rawDate();
    if (!value) return 'აირჩიეთ თარიღი';

    return new Date(value + 'T00:00:00').toLocaleDateString('ka-GE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  totalPrice = computed(() => this.pricePerPerson * this.guests());

  onDateChange(value: string) {
    if (value) {
      this.rawDate.set(value);
    }
  }

  incrementGuests() {
    this.guests.update((g) => g + 1);
  }

  decrementGuests() {
    this.guests.update((g) => Math.max(1, g - 1));
  }
}