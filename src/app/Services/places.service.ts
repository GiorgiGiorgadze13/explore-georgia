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

export type Place = CsvPlace;

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private apiUrl = 'https://explore-georgia-azg5e7gxbhbqd9g5.spaincentral-01.azurewebsites.net/api/Places';
  private csvUrl = 'assets/data/places-export-2026-08-19_03-35-20.csv';
  private places$?: Observable<CsvPlace[]>;

  constructor(private http: HttpClient) {}

  getPlaces(): Observable<CsvPlace[]> {
    if (this.places$) {
      return this.places$;
    }

    this.places$ = this.http.get<CsvPlace[]>(this.apiUrl).pipe(
      timeout(3000),
      catchError(() => {
        // Fallback to local CSV asset if backend API is not running or timing out
        return this.http.get(this.csvUrl, { responseType: 'text' }).pipe(
          timeout(3000),
          map((csvText: string) => this.parseCsv(csvText)),
          catchError((csvErr) => {
            console.warn('⚠️ [PlacesService] CSV fallback error:', csvErr);
            return of([]);
          })
        );
      }),
      shareReplay(1)
    );

    return this.places$;
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