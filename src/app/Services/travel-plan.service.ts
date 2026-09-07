import { Injectable, signal, computed } from '@angular/core';
import { CsvPlace } from './places.service';

const STORAGE_KEY = 'explore_georgia_selected_places';

@Injectable({
  providedIn: 'root'
})
export class TravelPlanService {
  selectedPlaces = signal<CsvPlace[]>(this.loadStorage());
  count = computed(() => this.selectedPlaces().length);

  private loadStorage(): CsvPlace[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch (e) {
      console.warn('⚠️ [TravelPlanService] Read error:', e);
    }
    return [];
  }

  private saveStorage(places: CsvPlace[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
      }
    } catch (e) {
      console.warn('⚠️ [TravelPlanService] Write error:', e);
    }
  }

  isPlaceSelected(id: string): boolean {
    if (!id) return false;
    return this.selectedPlaces().some(p => String(p.id) === String(id));
  }

  addPlace(place: CsvPlace): boolean {
    if (!place || !place.id) return false;
    const current = this.selectedPlaces();
    const exists = current.some(p => String(p.id) === String(place.id));
    if (exists) return false;

    const updated = [...current, place];
    this.selectedPlaces.set(updated);
    this.saveStorage(updated);
    return true;
  }

  removePlace(id: string): void {
    if (!id) return;
    const updated = this.selectedPlaces().filter(p => String(p.id) !== String(id));
    this.selectedPlaces.set(updated);
    this.saveStorage(updated);
  }

  clearPlaces(): void {
    this.selectedPlaces.set([]);
    this.saveStorage([]);
  }
}
