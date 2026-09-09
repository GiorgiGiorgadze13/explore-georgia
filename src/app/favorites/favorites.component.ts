import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../home/header/header.component';
import { FooterComponent } from '../home/footer/footer.component';
import { FavoritesService, FavoriteCard } from '../Services/favorites.service';
import { LanguageService } from '../Services/language.service';
import { CardImageService } from '../Services/card-image.service';

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
  public imageService = inject(CardImageService);
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

  getCardImages(card: FavoriteCard): string[] {
    if (card.images && card.images.length > 0) {
      return card.images.slice(0, 3);
    }
    const fetched = this.imageService.getImagesForItem(card.id, card.title, card.badge, card.location);
    return fetched.slice(0, 3);
  }

  getActiveCardImage(card: FavoriteCard): string {
    const imgs = this.getCardImages(card);
    const idx = (card.activeImgIndex || 0) % imgs.length;
    return imgs[idx] || card.image || '/Rectangle1.png';
  }

  setCardImageIndex(card: FavoriteCard, idx: number, event: Event): void {
    event.stopPropagation();
    card.activeImgIndex = idx;
  }

  prevCardImage(card: FavoriteCard, event: Event): void {
    event.stopPropagation();
    const imgs = this.getCardImages(card);
    const current = card.activeImgIndex || 0;
    card.activeImgIndex = (current - 1 + imgs.length) % imgs.length;
  }

  nextCardImage(card: FavoriteCard, event: Event): void {
    event.stopPropagation();
    const imgs = this.getCardImages(card);
    const current = card.activeImgIndex || 0;
    card.activeImgIndex = (current + 1) % imgs.length;
  }

  openDetails(card: FavoriteCard): void {
    const activeImg = this.getActiveCardImage(card);
    this.router.navigate(['/details'], {
      queryParams: {
        id: card.id,
        title: card.title,
        location: card.location,
        badge: card.badge,
        image: activeImg,
        description: card.description,
        price: card.dateOrPrice,
        rating: card.rating
      },
      state: { card: { ...card, image: activeImg } }
    });
  }
}
