import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../home/header/header.component';
import { FooterComponent } from '../home/footer/footer.component';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PlacesService, CsvPlace } from '../Services/places.service';

import { LanguageService } from '../Services/language.service';

export interface CardDetailData {
  id?: string;
  title: string;
  location: string;
  badge: string;
  image: string;
  description: string;
  rating?: string | number;
  price?: number | string;
}

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './card-details.component.html',
})
export class CardDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private placesService = inject(PlacesService);
  public langService = inject(LanguageService);

  cardData = signal<CardDetailData>({
    title: 'ღვინისა და კულტურის ტური კახეთში',
    location: 'კახეთი, საქართველო',
    badge: 'ბუნება',
    image: '/kakheti.png',
    description: 'აღმოაჩინეთ ქართული მეღვინეობის 8000-წლიანი ტრადიცია კახეთის გულში. ეს სრულდღიანი ტური აერთიანებს პრემიუმ კლასის ღვინის დეგუსტაციას, ისტორიულ ძეგლებსა და ავთენტურ კულინარიულ გამოცდილებას. ეწვევით როგორც თანამედროვე, ინოვაციურ შატოებს, ისე ტრადიციულ საოჯახო მარნებს, სადაც ქვევრის ღვინის დაყენების საიდუმლოს გაეცნობით.',
    rating: '4.9 (124 შეფასება)',
    price: 150
  });

  rawDate = signal<string>('2026-10-24');
  guests = signal<number>(2);

  pricePerPerson = computed(() => {
    const p = this.cardData().price;
    if (typeof p === 'number' && p > 0) return p;
    if (typeof p === 'string') {
      const match = p.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return 150;
  });

  formattedDate = computed(() => {
    const value = this.rawDate();
    if (!value) return 'აირჩიეთ თარიღი';

    return new Date(value + 'T00:00:00').toLocaleDateString('ka-GE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  totalPrice = computed(() => this.pricePerPerson() * this.guests());

  ngOnInit(): void {
    const state = history.state;
    if (state && state.card) {
      this.updateCardData(state.card);
      return;
    }

    this.route.queryParams.subscribe((params) => {
      if (params['title']) {
        this.cardData.set({
          id: params['id'],
          title: params['title'],
          location: params['location'] || params['region'] || 'საქართველო',
          badge: params['badge'] || 'ლოკაცია',
          image: params['image'] || '/Rectangle1.png',
          description: params['description'] || 'დეტალური ინფორმაცია ლოკაციის შესახებ.',
          rating: params['rating'] || '4.9 (50 შეფასება)',
          price: params['price'] || 150
        });
      } else if (params['id']) {
        this.placesService.getPlaces().subscribe((places) => {
          const found = places.find((p) => p.id === params['id']);
          if (found) {
            this.updateFromPlace(found);
          }
        });
      }
    });
  }

  private updateCardData(c: any) {
    this.cardData.set({
      id: c.id,
      title: c.title || c.name || 'ლოკაცია',
      location: c.location || c.region || 'საქართველო',
      badge: c.badge || c.category || 'ლოკაცია',
      image: c.image || '/Rectangle1.png',
      description: c.description || 'დეტალური ინფორმაცია ლოკაციის შესახებ.',
      rating: c.rating || '4.9 (50 შეფასება)',
      price: c.price || c.dateOrPrice || 150
    });
  }

  private updateFromPlace(p: CsvPlace) {
    this.cardData.set({
      id: p.id,
      title: p.name,
      location: p.region,
      badge: p.category,
      image: '/Rectangle1.png',
      description: p.description,
      rating: p.rating ? `${p.rating} (50 შეფასება)` : '4.9 (50 შეფასება)',
      price: 150
    });
  }

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