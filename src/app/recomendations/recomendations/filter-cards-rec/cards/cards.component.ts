import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlacesService, CsvPlace } from '../../../../Services/places.service';
import { CardImageService } from '../../../../Services/card-image.service';
import { FilterCardService } from '../../../../Services/filter-card.service';

export interface RecommendationCard extends CsvPlace {
  image?: string;
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
  private router = inject(Router);

  recommendations = signal<RecommendationCard[]>([]);

  filteredRecommendations = computed(() => {
    let list = this.recommendations();
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
