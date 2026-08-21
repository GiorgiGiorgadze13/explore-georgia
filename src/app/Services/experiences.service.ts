import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, timeout } from 'rxjs';

export interface CsvExperience {
  id: string;
  title: string;
  kind: string;
  duration: string;
  price: string;
  region: string;
  description: string;
  created_at?: string;
  image?: string;
}

const EXPERIENCES_CACHE_KEY = 'explore_georgia_experiences_cache';

@Injectable({
  providedIn: 'root'
})
export class ExperiencesService {
  private apiUrl = 'https://explore-georgia-azg5e7gxbhbqd9g5.spaincentral-01.azurewebsites.net/api/Experiences';
  private csvUrl = 'assets/data/experiences-export-2026-08-19_19-31-49.csv';
  private experiences$?: Observable<CsvExperience[]>;

  constructor(private http: HttpClient) {}

  private getStoredExperiences(): CsvExperience[] | null {
    try {
      const stored = localStorage.getItem(EXPERIENCES_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('⚠️ [ExperiencesService] LocalStorage read error:', e);
    }
    return null;
  }

  private saveStoredExperiences(data: CsvExperience[]): void {
    try {
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(EXPERIENCES_CACHE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('⚠️ [ExperiencesService] LocalStorage write error:', e);
    }
  }

  getExperiences(): Observable<CsvExperience[]> {
    const cached = this.getStoredExperiences();

    if (this.experiences$) {
      return this.experiences$;
    }

    const fetch$ = this.http.get<CsvExperience[]>(this.apiUrl).pipe(
      timeout(3000),
      catchError(() => {
        return this.http.get(this.csvUrl, { responseType: 'text' }).pipe(
          timeout(3000),
          map((csvText: string) => this.parseCsv(csvText)),
          catchError((csvErr) => {
            console.warn('⚠️ [ExperiencesService] CSV fallback error:', csvErr);
            return cached ? of(cached) : of([]);
          })
        );
      }),
      map((data) => {
        if (data && data.length > 0) {
          this.saveStoredExperiences(data);
          return data;
        }
        return cached || [];
      }),
      shareReplay(1)
    );

    this.experiences$ = cached && cached.length > 0 ? of(cached).pipe(shareReplay(1)) : fetch$;
    return this.experiences$;
  }

  private parseCsv(csvText: string): CsvExperience[] {
    const lines = csvText.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map((h) => h.trim().replace(/^"|"$/g, ''));
    const experiences: CsvExperience[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.splitCsvLine(lines[i]);
      if (values.length < headers.length) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      experiences.push({
        id: row['id'] || `exp-${i}`,
        title: row['title'] || 'Unnamed Experience',
        kind: row['kind'] || 'გამოცდილება',
        duration: row['duration'] || '',
        price: row['price'] || '',
        region: row['region'] || 'საქართველო',
        description: row['description'] || '',
        created_at: row['created_at'] || ''
      });
    }

    return experiences;
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
