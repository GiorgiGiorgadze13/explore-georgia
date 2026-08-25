import { Component, inject, OnInit, signal, computed, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../Services/language.service';
import { FilterCardService, toSimpleLatin } from '../../Services/filter-card.service';
import { PlacesService } from '../../Services/places.service';
import { CardImageService } from '../../Services/card-image.service';
import { FavoritesService } from '../../Services/favorites.service';
import { AuthService } from '../../Services/auth.service';

export interface SearchResultItem {
  id: string;
  name: string;
  region: string;
  category: string;
  description: string;
  image: string;
  rating?: number;
  _searchStr?: string;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  public langService = inject(LanguageService);
  public filterService = inject(FilterCardService);
  private placesService = inject(PlacesService);
  private imageService = inject(CardImageService);
  public favService = inject(FavoritesService);
  public authService = inject(AuthService);
  private router = inject(Router);
  private eRef = inject(ElementRef);

  menuOpen = false;
  showDropdown = signal<boolean>(false);
  selectedIndex = signal<number>(-1);
  queryInput = signal<string>('');
  allPlaces = signal<SearchResultItem[]>([]);
  private debounceTimer: any;

  ngOnInit(): void {
    const existing = this.filterService.searchInput();
    if (existing) {
      this.queryInput.set(existing);
    }

    this.placesService.getPlaces().subscribe({
      next: (places) => {
        this.allPlaces.set(places.map(p => {
          const rawStr = `${p.name} ${p.region} ${p.category} ${p.description}`;
          return {
            id: p.id,
            name: p.name,
            region: p.region,
            category: p.category,
            description: p.description,
            image: this.imageService.getImageForItem(p.id, p.name, p.category, p.region),
            rating: p.rating,
            _searchStr: toSimpleLatin(rawStr) + ' ' + rawStr.toLowerCase()
          };
        }));
      }
    });
  }

  searchResults = computed(() => {
    const q = this.queryInput().trim();
    if (!q || q.length < 1) return [];

    const simpleQ = toSimpleLatin(q);
    const rawQ = q.toLowerCase();

    return this.allPlaces()
      .filter(p => p._searchStr ? (p._searchStr.includes(simpleQ) || p._searchStr.includes(rawQ)) : true)
      .slice(0, 6);
  });

  totalMatchCount = computed(() => {
    const q = this.queryInput().trim();
    if (!q || q.length < 1) return 0;

    const simpleQ = toSimpleLatin(q);
    const rawQ = q.toLowerCase();

    return this.allPlaces()
      .filter(p => p._searchStr ? (p._searchStr.includes(simpleQ) || p._searchStr.includes(rawQ)) : true).length;
  });

  onInput(val: string) {
    this.queryInput.set(val);
    this.selectedIndex.set(-1);
    this.showDropdown.set(val.trim().length > 0);

    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.filterService.searchInput.set(val);
    }, 250);
  }

  onKeyDown(event: KeyboardEvent, val: string) {
    const results = this.searchResults();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!this.showDropdown() && val.trim().length > 0) {
        this.showDropdown.set(true);
      }
      if (results.length > 0) {
        this.selectedIndex.update(i => (i < results.length - 1 ? i + 1 : 0));
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length > 0) {
        this.selectedIndex.update(i => (i > 0 ? i - 1 : results.length - 1));
      }
    } else if (event.key === 'Escape') {
      this.showDropdown.set(false);
      this.selectedIndex.set(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const idx = this.selectedIndex();
      if (idx >= 0 && idx < results.length) {
        this.openDetails(results[idx]);
      } else {
        this.search(val);
      }
    }
  }

  search(val: string) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.filterService.searchInput.set(val);
    this.queryInput.set('');
    this.showDropdown.set(false);
    this.selectedIndex.set(-1);

    const currentUrl = this.router.url;
    if (!currentUrl.includes('/recomendation') && currentUrl !== '/' && !currentUrl.startsWith('/?')) {
      this.router.navigate(['/']).then(() => {
        this.scrollToResults();
      });
    } else {
      this.scrollToResults();
    }
  }

  clearSearch() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.queryInput.set('');
    this.filterService.searchInput.set('');
    this.showDropdown.set(false);
    this.selectedIndex.set(-1);
  }

  scrollToResults() {
    setTimeout(() => {
      const cardsTarget = document.getElementById('cards-section') || document.querySelector('app-filter-card');
      const mapTarget = document.getElementById('map-section') || document.querySelector('app-map');
      if (cardsTarget) {
        cardsTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (mapTarget) {
        mapTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  openDetails(item: SearchResultItem) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.queryInput.set('');
    this.showDropdown.set(false);
    this.selectedIndex.set(-1);
    this.router.navigate(['/details'], {
      queryParams: {
        id: item.id,
        title: item.name,
        location: item.region,
        badge: item.category || 'ადგილი',
        image: item.image,
        description: item.description
      },
      state: { card: item }
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleLanguage() {
    this.langService.toggleLanguage();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
      this.selectedIndex.set(-1);
    }
  }
}

