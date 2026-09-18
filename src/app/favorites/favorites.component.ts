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

  private touchStartX = 0;
  private touchStartY = 0;
  private isSwiping = false;

  onTouchStart(event: TouchEvent): void {
    if (event.touches && event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  onTouchEnd(event: TouchEvent, card: FavoriteCard): void {
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

  openDetails(card: FavoriteCard): void {
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
}
