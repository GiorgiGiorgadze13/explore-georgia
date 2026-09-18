import { Component, computed, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlacesService, CsvPlace } from '../../../../Services/places.service';
import { CardImageService } from '../../../../Services/card-image.service';
import { FilterCardService } from '../../../../Services/filter-card.service';
import { FavoritesService } from '../../../../Services/favorites.service';
import { LanguageService } from '../../../../Services/language.service';

export interface RecommendationCard extends CsvPlace {
  image?: string;
  images?: string[];
  activeImgIndex?: number;
  hasError?: boolean;
}

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent implements OnInit {
  private placesService = inject(PlacesService);
  public imageService = inject(CardImageService);
  public filterService = inject(FilterCardService);
  public favService = inject(FavoritesService);
  public langService = inject(LanguageService);
  private router = inject(Router);

  recommendations = signal<RecommendationCard[]>([]);
  currentPage = signal<number>(1);
  pageSize = 10;

  constructor() {
    effect(() => {
      this.filterService.selectedRegion();
      this.filterService.selectedNature();
      this.filterService.searchInput();
      this.currentPage.set(1);
    });
  }

  onImageError(card: RecommendationCard): void {
    card.hasError = true;
    this.recommendations.update(list => [...list]);
  }

  getCardImages(card: RecommendationCard): string[] {
    const list = card.images && card.images.length > 0 ? card.images : [card.image || '/Rectangle1.png'];
    return list.slice(0, 3);
  }

  getActiveCardImage(card: RecommendationCard): string {
    const imgs = this.getCardImages(card);
    const idx = (card.activeImgIndex || 0) % imgs.length;
    return imgs[idx] || '/Rectangle1.png';
  }

  setCardImageIndex(card: RecommendationCard, idx: number, event: Event): void {
    event.stopPropagation();
    card.activeImgIndex = idx;
  }

  prevCardImage(card: RecommendationCard, event: Event): void {
    event.stopPropagation();
    const imgs = this.getCardImages(card);
    const current = card.activeImgIndex || 0;
    card.activeImgIndex = (current - 1 + imgs.length) % imgs.length;
  }

  nextCardImage(card: RecommendationCard, event: Event): void {
    event.stopPropagation();
    const imgs = this.getCardImages(card);
    const current = card.activeImgIndex || 0;
    card.activeImgIndex = (current + 1) % imgs.length;
  }

  filteredRecommendations = computed(() => {
    let list = this.recommendations().filter(p => !p.hasError);
    const region = this.filterService.selectedRegion();
    const nature = this.filterService.selectedNature();
    const search = this.filterService.searchInput();

    if (region) {
      list = list.filter(p => this.filterService.matchesRegion(p.region, p.name, region));
    }
    if (nature) {
      list = list.filter(p => this.filterService.matchesNature(p.category, p.name, p.description, p.tags, nature));
    }
    if (search) {
      list = list.filter(p => this.filterService.matchesSearch({
        title: p.name,
        location: p.region,
        badge: p.category,
        description: p.description,
        tags: p.tags
      }, search));
    }
    return list;
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredRecommendations().length / this.pageSize) || 1;
  });

  totalPagesArray = computed(() => {
    const total = this.totalPages();
    const chunkSize = 10;
    const currentBlock = Math.floor((this.currentPage() - 1) / chunkSize);
    const start = currentBlock * chunkSize + 1;
    const end = Math.min(total, start + chunkSize - 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  paginatedRecommendations = computed(() => {
    const total = this.totalPages();
    const page = Math.min(Math.max(1, this.currentPage()), total);
    const start = (page - 1) * this.pageSize;
    return this.filteredRecommendations().slice(start, start + this.pageSize);
  });

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  ngOnInit(): void {
    this.placesService.getPlaces().subscribe({
      next: (places) => {
        const recs = places.filter(p => p.is_local || (p.rating && p.rating >= 4.4));
        const list = recs.length > 0 ? recs : places;
        this.recommendations.set(list.map(p => {
          const imgs = this.imageService.getImagesForItem(p.id, p.name, p.category, p.region);
          return {
            ...p,
            image: imgs[0],
            images: imgs,
            activeImgIndex: 0
          };
        }));
      }
    });
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

  onTouchEnd(event: TouchEvent, card: RecommendationCard): void {
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

  toggleFavorite(card: RecommendationCard, event: Event): void {
    event.stopPropagation();
    this.favService.toggleFavorite({
      id: card.id,
      title: card.name,
      badge: card.category || 'რეკომენდაცია',
      description: card.description,
      location: card.region,
      rating: card.rating ? `${card.rating}` : undefined,
      image: card.image,
      images: card.images,
      type: 'place'
    });
  }

  openDetails(card: RecommendationCard): void {
    if (this.isSwiping) {
      this.isSwiping = false;
      return;
    }
    const img = this.getActiveCardImage(card);
    this.router.navigate(['/details'], {
      queryParams: { id: card.id },
      state: { card: { ...card, image: img } }
    });
  }
}
