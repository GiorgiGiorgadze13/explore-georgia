import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, timeout } from 'rxjs';

export interface CsvPlace {
  id: string;
  name: string;
  region: string;
  group_key: string;
  category: string;
  lat: number;
  lng: number;
  description: string;
  tags?: string[];
  rating?: number;
  is_local?: boolean;
  hidden?: boolean;
}

const PLACES_CACHE_KEY = 'explore_georgia_places_cache';
const CUSTOM_PLACES_KEY = 'explore_georgia_custom_places';

export interface AddPlaceDto {
  name: string;
  category: string;
  region: string;
  description: string;
  image?: string;
  lat?: number;
  lng?: number;
  wheelchair?: boolean;
  parking?: boolean;
  food?: boolean;
  wifi?: boolean;
  hiddenGem?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiUrl = 'https://explore-georgia-azg5e7gxbhbqd9g5.spaincentral-01.azurewebsites.net/api/Places';
  private csvUrl = 'assets/data/places-export-2026-08-19_03-35-20.csv';
  private places$?: Observable<CsvPlace[]>;

  constructor(private http: HttpClient) {}

  public getCustomPlaces(): CsvPlace[] {
    try {
      const stored = localStorage.getItem(CUSTOM_PLACES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('⚠️ [PlacesService] Custom places read error:', e);
    }
    return [];
  }

  private getStoredPlaces(): CsvPlace[] | null {
    try {
      const stored = localStorage.getItem(PLACES_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('⚠️ [PlacesService] LocalStorage read error:', e);
    }
    return null;
  }

  private saveStoredPlaces(data: CsvPlace[]): void {
    try {
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(PLACES_CACHE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('⚠️ [PlacesService] LocalStorage write error:', e);
    }
  }

  private mergeWithCustomPlaces(basePlaces: CsvPlace[]): CsvPlace[] {
    const custom = this.getCustomPlaces();
    if (!custom.length) return basePlaces;

    const customIds = new Set(custom.map(c => c.id));
    const filteredBase = basePlaces.filter(p => !customIds.has(p.id));
    return [...custom, ...filteredBase];
  }

  getPlaces(): Observable<CsvPlace[]> {
    const cached = this.getStoredPlaces();

    if (this.places$) {
      return this.places$;
    }

    const fetch$ = this.http.get<CsvPlace[]>(this.apiUrl).pipe(
      timeout(3000),
      catchError(() => {
        return this.http.get(this.csvUrl, { responseType: 'text' }).pipe(
          timeout(3000),
          map((csvText: string) => this.parseCsv(csvText)),
          catchError((csvErr) => {
            console.warn('⚠️ [PlacesService] CSV fallback error:', csvErr);
            return cached ? of(cached) : of([]);
          })
        );
      }),
      map((data) => {
        const base = (data && data.length > 0) ? data : (cached || []);
        if (base.length > 0) {
          this.saveStoredPlaces(base);
        }
        return this.mergeWithCustomPlaces(base);
      }),
      shareReplay(1)
    );

    const mergedCached = cached && cached.length > 0 ? this.mergeWithCustomPlaces(cached) : null;
    this.places$ = mergedCached ? of(mergedCached).pipe(shareReplay(1)) : fetch$;
    return this.places$;
  }

  addPlace(dto: AddPlaceDto): CsvPlace {
    const customPlaces = this.getCustomPlaces();
    const newPlace: CsvPlace = {
      id: `custom-place-${Date.now()}`,
      name: dto.name,
      region: dto.region,
      category: dto.category,
      group_key: this.inferGroupKey(dto.category),
      lat: dto.lat || 41.7151,
      lng: dto.lng || 44.8271,
      description: dto.description,
      rating: 5.0,
      tags: [
        dto.category,
        dto.region,
        dto.hiddenGem ? 'Hidden Gem' : '',
        dto.wheelchair ? 'ეტლით მისადგომი' : '',
        dto.parking ? 'პარკინგი' : '',
        dto.food ? 'კვების ობიექტი' : '',
        dto.wifi ? 'Wi-Fi' : ''
      ].filter(Boolean),
      is_local: true,
      hidden: dto.hiddenGem
    };

    const updatedCustom = [newPlace, ...customPlaces.filter(p => p.id !== newPlace.id)];
    localStorage.setItem(CUSTOM_PLACES_KEY, JSON.stringify(updatedCustom));

    const cached = this.getStoredPlaces() || [];
    const updatedAll = [newPlace, ...cached.filter(p => p.id !== newPlace.id)];
    this.saveStoredPlaces(updatedAll);

    this.places$ = of(this.mergeWithCustomPlaces(updatedAll)).pipe(shareReplay(1));
    return newPlace;
  }

  private inferGroupKey(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('ტბა') || c.includes('ჩანჩქერი') || c.includes('კანიონი') || c.includes('მთა') || c.includes('ტყე') || c.includes('მდინარე')) {
      return 'nature';
    }
    if (c.includes('ტაძარი') || c.includes('ეკლესია') || c.includes('ციხე') || c.includes('მონასტერი') || c.includes('მუზეუმი')) {
      return 'culture';
    }
    if (c.includes('კვება') || c.includes('ღვინო') || c.includes('მარანი') || c.includes('რესტორანი')) {
      return 'food';
    }
    return 'leisure';
  }

  private parseCsv(csvText: string): CsvPlace[] {
    const lines = csvText.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map((h) => h.trim().replace(/^"|"$/g, ''));
    const places: CsvPlace[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.splitCsvLine(lines[i]);
      if (values.length < headers.length) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      const lat = parseFloat(row['lat']);
      const lng = parseFloat(row['lng']);
      if (isNaN(lat) || isNaN(lng)) continue;

      places.push({
        id: row['id'] || `place-${i}`,
        name: row['name'] || 'Unnamed Spot',
        region: row['region'] || 'Georgia',
        group_key: row['group_key'] || 'other',
        category: row['category'] || 'General',
        lat: lat,
        lng: lng,
        description: row['description'] || '',
        rating: parseFloat(row['rating']) || 0
      });
    }

    return places;
  }

  private splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ';' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  }
}