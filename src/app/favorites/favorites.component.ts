import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../home/header/header.component';
import { FooterComponent } from '../home/footer/footer.component';
import { FavoritesService, FavoriteCard } from '../Services/favorites.service';
import { LanguageService } from '../Services/language.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {
  public favService = inject(FavoritesService);
  public langService = inject(LanguageService);
  private router = inject(Router);

  removeFavorite(id: string, event: Event): void {
    event.stopPropagation();
    this.favService.removeFavorite(id);
  }

  clearAll(): void {
    if (confirm(this.langService.isGeo() ? 'დარწმუნებული ხართ, რომ გსურთ ყველა ფავორიტის წაშლა?' : 'Are you sure you want to clear all favorites?')) {
      this.favService.clearFavorites();
    }
  }

  openDetails(card: FavoriteCard): void {
    this.router.navigate(['/details'], {
      queryParams: {
        id: card.id,
        title: card.title,
        location: card.location,
        badge: card.badge,
        image: card.image || '/Rectangle1.png',
        description: card.description,
        price: card.dateOrPrice,
        rating: card.rating
      },
      state: { card }
    });
  }
}
