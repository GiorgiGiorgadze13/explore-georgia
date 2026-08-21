import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, timeout } from 'rxjs';

export interface CsvEvent {
  id: string;
  title: string;
  type: string;
  place: string;
  date: string;
  description: string;
  free: boolean;
  created_at?: string;
  image?: string;
}

const EVENTS_CACHE_KEY = 'explore_georgia_events_cache';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = 'https://explore-georgia-azg5e7gxbhbqd9g5.spaincentral-01.azurewebsites.net/api/Events';
  private csvUrl = 'assets/data/events-export-2026-08-19_19-32-23.csv';
  private events$?: Observable<CsvEvent[]>;

  constructor(private http: HttpClient) {}

  private getStoredEvents(): CsvEvent[] | null {
    try {
      const stored = localStorage.getItem(EVENTS_CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('⚠️ [EventsService] LocalStorage read error:', e);
    }
    return null;
  }

  private saveStoredEvents(data: CsvEvent[]): void {
    try {
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('⚠️ [EventsService] LocalStorage write error:', e);
    }
  }

  getEvents(): Observable<CsvEvent[]> {
    const cached = this.getStoredEvents();

    if (this.events$) {
      return this.events$;
    }

    const fetch$ = this.http.get<CsvEvent[]>(this.apiUrl).pipe(
      timeout(3000),
      catchError(() => {
        return this.http.get(this.csvUrl, { responseType: 'text' }).pipe(
          timeout(3000),
          map((csvText: string) => this.parseCsv(csvText)),
          catchError((csvErr) => {
            console.warn('⚠️ [EventsService] CSV fallback error:', csvErr);
            return cached ? of(cached) : of([]);
          })
        );
      }),
      map((data) => {
        if (data && data.length > 0) {
          this.saveStoredEvents(data);
          return data;
        }
        return cached || [];
      }),
      shareReplay(1)
    );

    this.events$ = cached && cached.length > 0 ? of(cached).pipe(shareReplay(1)) : fetch$;
    return this.events$;
  }

  private parseCsv(csvText: string): CsvEvent[] {
    const lines = csvText.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(';').map((h) => h.trim().replace(/^"|"$/g, ''));
    const events: CsvEvent[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.splitCsvLine(lines[i]);
      if (values.length < headers.length) continue;

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      events.push({
        id: row['id'] || `event-${i}`,
        title: row['title'] || 'Unnamed Event',
        type: row['type'] || 'ღონისძიება',
        place: row['place'] || 'საქართველო',
        date: row['date'] || '',
        description: row['description'] || '',
        free: row['free']?.toLowerCase() === 'true',
        created_at: row['created_at'] || ''
      });
    }

    return events;
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
