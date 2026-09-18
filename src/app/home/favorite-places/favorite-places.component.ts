import { Component, inject, OnInit, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';

import { PlacesService, CsvPlace } from '../../Services/places.service';
import { FavoritesService, FavoriteCard } from '../../Services/favorites.service';
import { LanguageService } from '../../Services/language.service';
import { CardImageService } from '../../Services/card-image.service';

export interface DisplayCard {
  id: string;
  title: string;
  badge: string;
  description: string;
  location: string;
  metaBadge?: string;
  dateOrPrice?: string;
  image?: string;
  images?: string[];
  activeImgIndex?: number;
  tags?: string[];
  type: 'place' | 'event' | 'experience';
  rating?: number;
  hasError?: boolean;
}

@Component({
  selector: 'app-favorite-places',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './favorite-places.component.html',
  styleUrl: './favorite-places.component.css'
})
export class FavoritePlacesComponent implements OnInit {
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;

  public placesService = inject(PlacesService);
  public favService = inject(FavoritesService);
  public langService = inject(LanguageService);
  private imageService = inject(CardImageService);
  private router = inject(Router);

  activeTab = signal<'popular' | 'myFavs'>('popular');
  popularCards = signal<DisplayCard[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.placesService.getPlaces().subscribe({
      next: (places) => {
        // Sort places by rating or pick the most chosen/iconic spots
        const sorted = [...places].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        // Take top 8 locations for the section
        const topPlaces = sorted.slice(0, 10);

        const mappedCards: DisplayCard[] = topPlaces.map((p) => {
          const imgs = this.imageService.getImagesForItem(p.id, p.name, p.category, p.region);
          return {
            id: p.id,
            title: p.name,
            badge: p.category || p.group_key || 'ადგილი',
            description: p.description,
            location: p.region,
            metaBadge: p.rating ? `⭐ ${p.rating}` : '⭐ 4.9',
            rating: p.rating || 4.9,
            image: imgs[0],
            images: imgs,
            activeImgIndex: 0,
            tags: this.parseTags(p.tags),
            type: 'place'
          };
        });

        this.popularCards.set(mappedCards);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  displayCards = computed<DisplayCard[]>(() => {
    if (this.activeTab() === 'myFavs') {
      return this.favService.favorites().map((fav): DisplayCard => ({
        id: fav.id,
        title: fav.title,
        badge: fav.badge || 'ადგილი',
        description: fav.description || '',
        location: fav.location || '',
        metaBadge: fav.metaBadge || '⭐ 5.0',
        dateOrPrice: fav.dateOrPrice,
        image: fav.image,
        images: fav.images,
        activeImgIndex: fav.activeImgIndex || 0,
        tags: fav.tags || [],
        type: (fav.type as any) || 'place',
        rating: 5.0,
        hasError: fav.hasError
      }));
    }
    return this.popularCards();
  });

  private parseTags(tagsStr?: string | string[]): string[] {
    if (!tagsStr) return [];
    if (Array.isArray(tagsStr)) {
      return tagsStr.map(t => String(t).replace(/^"|"$/g, '').trim()).filter(Boolean);
    }
    try {
      const parsed = JSON.parse(tagsStr);
      if (Array.isArray(parsed)) {
        return parsed.map(t => String(t).replace(/^"|"$/g, '').trim()).filter(Boolean);
      }
    } catch {
      return tagsStr.split(',').map(t => t.replace(/["\[\]]/g, '').trim()).filter(Boolean);
    }
    return [];
  }

  isFavorite(id: string): boolean {
    return this.favService.isFavorite(id);
  }

  toggleFavorite(card: DisplayCard, event: Event): void {
    event.stopPropagation();
    this.favService.toggleFavorite({
      id: card.id,
      title: card.title,
      badge: card.badge,
      description: card.description,
      location: card.location,
      metaBadge: card.metaBadge,
      dateOrPrice: card.dateOrPrice,
      image: card.image,
      images: card.images,
      tags: card.tags,
      type: card.type
    });
  }

  getCardImages(card: DisplayCard): string[] {
    if (card.images && card.images.length > 0) {
      return card.images.slice(0, 3);
    }
    const fetched = this.imageService.getImagesForItem(card.id, card.title, card.badge, card.location);
    return fetched.slice(0, 3);
  }

  getActiveCardImage(card: DisplayCard): string {
    const imgs = this.getCardImages(card);
    const idx = (card.activeImgIndex || 0) % imgs.length;
    return imgs[idx] || card.image || '/Rectangle1.png';
  }

  setCardImageIndex(card: DisplayCard, idx: number, event: Event): void {
    event.stopPropagation();
    card.activeImgIndex = idx;
  }

  prevCardImage(card: DisplayCard, event: Event): void {
    event.stopPropagation();
    const imgs = this.getCardImages(card);
    const current = card.activeImgIndex || 0;
    card.activeImgIndex = (current - 1 + imgs.length) % imgs.length;
  }

  nextCardImage(card: DisplayCard, event: Event): void {
    event.stopPropagation();
    const imgs = this.getCardImages(card);
    const current = card.activeImgIndex || 0;
    card.activeImgIndex = (current + 1) % imgs.length;
  }

  private touchStartX = 0;
  private touchStartY = 0;
  private isSwiping = false;

  onTouchStart(event: TouchEvent): void {
    if (event.touches && event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  onTouchEnd(event: TouchEvent, card: DisplayCard): void {
    if (!event.changedTouches || event.changedTouches.length === 0 || this.touchStartX === 0) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;

    this.touchStartX = 0;
    this.touchStartY = 0;

    const minSwipeDistance = 25;
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
      this.isSwiping = true;
      const dummyEvent = new Event('touchswipe');
      dummyEvent.stopPropagation();

      if (deltaX < 0) {
        this.nextCardImage(card, dummyEvent);
      } else {
        this.prevCardImage(card, dummyEvent);
      }

      setTimeout(() => {
        this.isSwiping = false;
      }, 300);
    }
  }

  openDetails(card: DisplayCard): void {
    if (this.isSwiping) {
      this.isSwiping = false;
      return;
    }
    const activeImg = this.getActiveCardImage(card);
    this.router.navigate(['/details'], {
      queryParams: { id: card.id },
      state: { card: { ...card, image: activeImg } }
    });
  }

  scrollLeft(): void {
    if (this.carouselTrack) {
      this.carouselTrack.nativeElement.scrollBy({ left: -320, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.carouselTrack) {
      this.carouselTrack.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
    }
  }
}
