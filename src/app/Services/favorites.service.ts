import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';

export interface FavoriteCard {
  id: string;
  title: string;
  badge?: string;
  description?: string;
  location?: string;
  metaBadge?: string;
  dateOrPrice?: string;
  image?: string;
  tags?: string[];
  type?: 'place' | 'event' | 'experience';
  rating?: string;
  hasError?: boolean;
}

const GUEST_STORAGE_KEY = 'explore_georgia_fav_guest';
const LEGACY_STORAGE_KEY = 'explore_georgia_favorites';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private authService = inject(AuthService);

  favorites = signal<FavoriteCard[]>([]);
  count = computed(() => this.favorites().length);

  constructor() {
    // Reactive effect whenever currentUser changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        // User logged in: merge guest favorites into user favorites
        const guestFavs = this.loadGuestStorage();
        const userFavs = this.loadUserStorage(user.id);

        const mergedMap = new Map<string, FavoriteCard>();
        userFavs.forEach(item => mergedMap.set(String(item.id), item));
        guestFavs.forEach(item => mergedMap.set(String(item.id), item));

        const mergedList = Array.from(mergedMap.values());
        this.saveUserStorage(user.id, mergedList);
        this.clearGuestStorage();

        this.favorites.set(mergedList);
      } else {
        // Guest mode: load guest favorites
        const guestFavs = this.loadGuestStorage();
        this.favorites.set(guestFavs);
      }
    }, { allowSignalWrites: true });
  }

  private getKey(userId?: string): string {
    return userId ? `explore_georgia_fav_user_${userId}` : GUEST_STORAGE_KEY;
  }

  private loadGuestStorage(): FavoriteCard[] {
    try {
      let data = localStorage.getItem(GUEST_STORAGE_KEY);
      if (!data) {
        // Fallback to legacy key if available
        data = localStorage.getItem(LEGACY_STORAGE_KEY);
      }
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private loadUserStorage(userId: string): FavoriteCard[] {
    try {
      const data = localStorage.getItem(this.getKey(userId));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveCurrentState(favs: FavoriteCard[]): void {
    const user = this.authService.currentUser();
    const key = this.getKey(user?.id);
    try {
      localStorage.setItem(key, JSON.stringify(favs));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  }

  private saveUserStorage(userId: string, favs: FavoriteCard[]): void {
    try {
      localStorage.setItem(this.getKey(userId), JSON.stringify(favs));
    } catch (e) {
      console.error('Failed to save user favorites', e);
    }
  }

  private clearGuestStorage(): void {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  isFavorite(id: string): boolean {
    if (!id) return false;
    return this.favorites().some(item => String(item.id) === String(id));
  }

  toggleFavorite(card: FavoriteCard): void {
    if (!card || !card.id) return;
    const current = this.favorites();
    const index = current.findIndex(item => String(item.id) === String(card.id));
    let updated: FavoriteCard[];
    if (index > -1) {
      updated = current.filter(item => String(item.id) !== String(card.id));
    } else {
      updated = [...current, card];
    }
    this.favorites.set(updated);
    this.saveCurrentState(updated);
  }

  removeFavorite(id: string): void {
    if (!id) return;
    const updated = this.favorites().filter(item => String(item.id) !== String(id));
    this.favorites.set(updated);
    this.saveCurrentState(updated);
  }

  clearFavorites(): void {
    this.favorites.set([]);
    this.saveCurrentState([]);
  }
}
