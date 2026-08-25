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
  pageSize = 6;

  constructor() {
    effect(() => {
      this.filterService.selectedRegion();
      this.filterService.selectedNature();
      this.filterService.searchInput();
      this.currentPage.set(1);
    }, { allowSignalWrites: true });
  }

  onImageError(card: RecommendationCard): void {
    card.hasError = true;
    this.recommendations.update(list => [...list]);
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
    const maxVisible = 10;
    let start = Math.max(1, this.currentPage() - 4);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

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
        this.recommendations.set(list.map(p => ({
          ...p,
          image: this.imageService.getImageForItem(p.id, p.name, p.category, p.region)
        })));
      }
    });
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
      type: 'place'
    });
  }

  openDetails(card: RecommendationCard): void {
    const img = card.image || this.imageService.getImageForItem(card.id, card.name, card.category, card.region);
    this.router.navigate(['/details'], {
      queryParams: {
        id: card.id,
        title: card.name,
        location: card.region,
        badge: card.category || 'რეკომენდაცია',
        image: img,
        description: card.description,
        rating: card.rating ? `${card.rating} (50 შეფასება)` : '4.9 (50 შეფასება)'
      },
      state: { card: { ...card, image: img } }
    });
  }
}
