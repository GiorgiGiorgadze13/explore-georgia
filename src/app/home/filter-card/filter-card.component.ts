import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

import { FilterCardService } from '../../Services/filter-card.service';
import { LanguageService } from '../../Services/language.service';
import { PlacesService } from '../../Services/places.service';
import { EventsService } from '../../Services/events.service';
import { ExperiencesService } from '../../Services/experiences.service';
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
  tags?: string[];
  type: 'place' | 'event' | 'experience';
}

@Component({
  selector: 'app-filter-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './filter-card.component.html',
  styleUrl: './filter-card.component.css'
})
export class FilterCardComponent implements OnInit {

  public filter = inject(FilterCardService);
  public langService = inject(LanguageService);
  private placesService = inject(PlacesService);
  private eventsService = inject(EventsService);
  private experiencesService = inject(ExperiencesService);
  private imageService = inject(CardImageService);
  private router = inject(Router);

  showFilters = false;
  cards = signal<DisplayCard[]>([]);
  currentPage = signal<number>(1);
  pageSize = 6;

  ngOnInit(): void {
    const url = this.router.url;

    if (url.includes('/events')) {
      this.eventsService.getEvents().subscribe({
        next: (events) => {
          this.cards.set(events.map(e => ({
            id: e.id,
            title: e.title,
            badge: e.type,
            description: e.description,
            location: e.place,
            metaBadge: e.free ? 'უფასო' : 'ფასიანი',
            dateOrPrice: e.date,
            image: this.imageService.getImageForItem(e.id, e.title, e.type, e.place),
            type: 'event'
          })));
        }
      });
    } else if (url.includes('/experience')) {
      this.experiencesService.getExperiences().subscribe({
        next: (experiences) => {
          this.cards.set(experiences.map(e => ({
            id: e.id,
            title: e.title,
            badge: e.kind,
            description: e.description,
            location: e.region,
            metaBadge: e.duration,
            dateOrPrice: e.price,
            image: this.imageService.getImageForItem(e.id, e.title, e.kind, e.region),
            type: 'experience'
          })));
        }
      });
    } else {
      this.placesService.getPlaces().subscribe({
        next: (places) => {
          this.cards.set(places.map(p => ({
            id: p.id,
            title: p.name,
            badge: p.category || p.group_key || 'ადგილი',
            description: p.description,
            location: p.region,
            metaBadge: p.rating ? `⭐ ${p.rating}` : '',
            image: this.imageService.getImageForItem(p.id, p.name, p.category, p.region),
            tags: this.parseTags(p.tags),
            type: 'place'
          })));
        }
      });
    }
  }

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

  filteredCards = computed(() => {
    let list = this.cards();
    const region = this.filter.selectedRegion();
    const nature = this.filter.selectedNature();

    if (region) {
      list = list.filter(c => this.filter.matchesRegion(c.location, c.title, region));
    }
    if (nature) {
      list = list.filter(c => this.filter.matchesNature(c.badge, c.title, c.description, c.tags, nature));
    }
    return list;
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredCards().length / this.pageSize) || 1;
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

  paginatedCards = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return this.filteredCards().slice(start, start + this.pageSize);
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

  toggleFilters(event: Event): void {
    event.stopPropagation();
    this.showFilters = !this.showFilters;
  }

  selectNature(val: string): void {
    this.filter.selectedNature.set(val);
    this.currentPage.set(1);
  }

  selectRegion(val: string): void {
    this.filter.selectedRegion.set(val);
    this.currentPage.set(1);
  }

  selectWheelchair(value: boolean): void {
    this.filter.wheelchairAccessible.set(value);
    this.currentPage.set(1);
  }

  clearFilters(): void {
    this.filter.selectedRegion.set('');
    this.filter.selectedNature.set('');
    this.filter.wheelchairAccessible.set(false);
    this.currentPage.set(1);
  }

  openDetails(card: DisplayCard): void {
    this.router.navigate(['/details'], {
      queryParams: {
        id: card.id,
        title: card.title,
        location: card.location,
        badge: card.badge,
        image: card.image || '/Rectangle1.png',
        description: card.description,
        price: card.dateOrPrice
      },
      state: { card }
    });
  }
}