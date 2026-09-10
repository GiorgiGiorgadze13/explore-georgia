import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../home/header/header.component';
import { FooterComponent } from '../home/footer/footer.component';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PlacesService, CsvPlace } from '../Services/places.service';
import { CardImageService } from '../Services/card-image.service';
import { LanguageService } from '../Services/language.service';
import { TourServicesService } from '../Services/tour-services.service';
import { TransportOption, LunchOption, TastingOption, GuideOption, ExtraServiceOption, TourPriceBreakdown } from '../models/tour-services.model';

export interface CardDetailData {
  id?: string;
  title: string;
  location: string;
  badge: string;
  image: string;
  images?: string[];
  activeImgIndex?: number;
  description: string;
  rating?: string | number;
  price?: number | string;
}

export type ServiceModalType = 'transport' | 'lunch' | 'tasting' | 'guide' | null;

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterLink],
  templateUrl: './card-details.component.html',
})
export class CardDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private placesService = inject(PlacesService);
  private imageService = inject(CardImageService);
  public langService = inject(LanguageService);
  public tourServices = inject(TourServicesService);

  cardData = signal<CardDetailData>({
    title: 'ღვინისა და კულტურის ტური კახეთში',
    location: 'კახეთი, საქართველო',
    badge: 'ბუნება',
    image: '/kakheti.png',
    images: [],
    activeImgIndex: 0,
    description: 'აღმოაჩინეთ ქართული მეღვინეობის 8000-წლიანი ტრადიცია კახეთის გულში. ეს სრულდღიანი ტური აერთიანებს პრემიუმ კლასის ღვინის დეგუსტაციას, ისტორიულ ძეგლებსა და ავთენტურ კულინარიულ გამოცდილებას. ეწვევით როგორც თანამედროვე, ინოვაციურ შატოებს, ისე ტრადიციულ საოჯახო მარნებს, სადაც ქვევრის ღვინის დაყენების საიდუმლოს გაეცნობით.',
    rating: '4.9 (124 შეფასება)',
    price: 150
  });

  rawDate = signal<string>('2026-10-24');
  guests = signal<number>(20);

  // Selection Signals
  selectedTransportId = signal<string | null>('minibus-20');
  selectedLunchId = signal<string | null>('trad-lunch');
  selectedTastingIds = signal<string[]>(['wine-tasting-30']);
  selectedGuideId = signal<string | null>('guide-giorgi');

  // Modal State Signal
  activeModal = signal<ServiceModalType>(null);

  formattedDate = computed(() => {
    const value = this.rawDate();
    if (!value) return 'აირჩიეთ თარიღი';

    return new Date(value + 'T00:00:00').toLocaleDateString('ka-GE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });

  // Dynamic calculation breakdown
  tourPriceBreakdown = computed<TourPriceBreakdown>(() => {
    return this.tourServices.calculateBreakdown({
      travelerCount: this.guests(),
      transportId: this.selectedTransportId(),
      lunchId: this.selectedLunchId(),
      tastingIds: this.selectedTastingIds(),
      guideId: this.selectedGuideId(),
      extraServiceIds: [],
    });
  });

  totalPrice = computed(() => this.tourPriceBreakdown().totalPrice);
  calculatedPricePerPerson = computed(() => this.tourPriceBreakdown().pricePerPerson);
  pricePerPerson = computed(() => this.tourPriceBreakdown().pricePerPerson);

  ngOnInit(): void {
    window.scrollTo(0, 0);

    const state = history.state;
    if (state && state.card) {
      this.updateCardData(state.card);
    }

    const loadById = (id: string) => {
      if (!id) return;
      this.placesService.getPlaces().subscribe((places) => {
        const found = places.find((p) => String(p.id) === String(id));
        if (found) {
          this.updateFromPlace(found);
        }
      });
    };

    const paramId = this.route.snapshot.paramMap.get('id');
    const queryId = this.route.snapshot.queryParams['id'];
    const initialId = paramId || queryId;

    if (initialId) {
      loadById(initialId);
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) loadById(id);
    });

    this.route.queryParams.subscribe((params) => {
      if (params['id']) {
        loadById(params['id']);
      } else if (params['title']) {
        const id = params['id'] || '';
        const title = params['title'];
        const badge = params['badge'] || 'ლოკაცია';
        const location = params['location'] || params['region'] || 'საქართველო';
        const imgs = this.imageService.getImagesForItem(id, title, badge, location);

        this.cardData.set({
          id: id,
          title: title,
          location: location,
          badge: badge,
          image: params['image'] || imgs[0] || '/Rectangle1.png',
          images: imgs,
          activeImgIndex: 0,
          description: params['description'] || 'დეტალური ინფორმაცია ლოკაციის შესახებ.',
          rating: params['rating'] || '4.9 (50 შეფასება)',
          price: params['price'] || 150
        });
      }
    });
  }

  private updateCardData(c: any) {
    const id = c.id || '';
    const title = c.title || c.name || 'ლოკაცია';
    const badge = c.badge || c.category || 'ლოკაცია';
    const location = c.location || c.region || 'საქართველო';
    const imgs = c.images && c.images.length > 0
      ? c.images
      : this.imageService.getImagesForItem(id, title, badge, location);

    this.cardData.set({
      id: id,
      title: title,
      location: location,
      badge: badge,
      image: c.image || imgs[0] || '/Rectangle1.png',
      images: imgs,
      activeImgIndex: 0,
      description: c.description || 'დეტალური ინფორმაცია ლოკაციის შესახებ.',
      rating: c.rating || '4.9 (50 შეფასება)',
      price: c.price || c.dateOrPrice || 150
    });
  }

  private updateFromPlace(p: CsvPlace) {
    const imgs = this.imageService.getImagesForItem(p.id, p.name, p.category, p.region);
    this.cardData.set({
      id: p.id,
      title: p.name,
      location: p.region,
      badge: p.category,
      image: imgs[0] || '/Rectangle1.png',
      images: imgs,
      activeImgIndex: 0,
      description: p.description,
      rating: p.rating ? `${p.rating} (50 შეფასება)` : '4.9 (50 შეფასება)',
      price: 150
    });
  }

  getImagesList(): string[] {
    const d = this.cardData();
    if (d.images && d.images.length > 0) return d.images;
    return [d.image || '/Rectangle1.png'];
  }

  getActiveImage(): string {
    const list = this.getImagesList();
    const idx = (this.cardData().activeImgIndex || 0) % list.length;
    return list[idx] || '/Rectangle1.png';
  }

  setImageIndex(index: number): void {
    this.cardData.update(d => ({ ...d, activeImgIndex: index }));
  }

  prevImage(): void {
    const list = this.getImagesList();
    const current = this.cardData().activeImgIndex || 0;
    const nextIdx = (current - 1 + list.length) % list.length;
    this.cardData.update(d => ({ ...d, activeImgIndex: nextIdx }));
  }

  nextImage(): void {
    const list = this.getImagesList();
    const current = this.cardData().activeImgIndex || 0;
    const nextIdx = (current + 1) % list.length;
    this.cardData.update(d => ({ ...d, activeImgIndex: nextIdx }));
  }

  onDateChange(value: string) {
    if (value) {
      this.rawDate.set(value);
    }
  }

  incrementGuests() {
    this.setGuestsCount(this.guests() + 1);
  }

  decrementGuests() {
    this.setGuestsCount(Math.max(1, this.guests() - 1));
  }

  setGuestsCount(count: number) {
    const validCount = Math.max(1, count);
    this.guests.set(validCount);
    // Capacity check: auto-switch transport if current one is overloaded
    const validTransportId = this.tourServices.getSuitableTransport(validCount, this.selectedTransportId());
    this.selectedTransportId.set(validTransportId);
  }

  // Modal open / close handlers
  openModal(type: ServiceModalType) {
    this.activeModal.set(type);
  }

  closeModal() {
    this.activeModal.set(null);
  }

  // Selection toggle handlers
  selectTransport(id: string) {
    const option = this.tourServices.transportOptions.find(t => t.id === id);
    if (!option || option.capacity < this.guests()) return; // capacity rule check

    if (this.selectedTransportId() === id) {
      this.selectedTransportId.set(null);
    } else {
      this.selectedTransportId.set(id);
    }
  }

  selectLunch(id: string) {
    if (this.selectedLunchId() === id) {
      this.selectedLunchId.set(null);
    } else {
      this.selectedLunchId.set(id);
    }
  }

  toggleTasting(id: string) {
    this.selectedTastingIds.update(ids => {
      if (ids.includes(id)) {
        return ids.filter(i => i !== id);
      } else {
        return [...ids, id];
      }
    });
  }

  selectGuide(id: string) {
    if (this.selectedGuideId() === id) {
      this.selectedGuideId.set(null);
    } else {
      this.selectedGuideId.set(id);
    }
  }

  isTransportAllowed(transport: TransportOption): boolean {
    return this.tourServices.isTransportAllowed(transport, this.guests());
  }

  // Label getters for the 4 interactive service cards
  getSelectedTransportLabel(): string {
    const found = this.tourServices.transportOptions.find(t => t.id === this.selectedTransportId());
    return found ? `${this.langService.translate(found.name)} (${found.price} GEL)` : this.langService.t('არ არის არჩეული');
  }

  getSelectedLunchLabel(): string {
    const found = this.tourServices.lunchOptions.find(l => l.id === this.selectedLunchId());
    return found ? `${this.langService.translate(found.name)} (${found.pricePerPerson} GEL/p)` : this.langService.t('არ არის არჩეული');
  }

  getSelectedTastingsLabel(): string {
    const ids = this.selectedTastingIds();
    if (ids.length === 0) return this.langService.t('არ არის არჩეული');
    const found = this.tourServices.tastingOptions.filter(t => ids.includes(t.id));
    return found.map(f => this.langService.translate(f.name)).join(', ');
  }

  getSelectedGuideLabel(): string {
    const found = this.tourServices.guideOptions.find(g => g.id === this.selectedGuideId());
    return found ? `${this.langService.translate(found.name)} (${found.price} GEL)` : this.langService.t('არ არის არჩეული');
  }
}