import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = 'https://explore-georgia-azg5e7gxbhbqd9g5.spaincentral-01.azurewebsites.net/api/Events';
  private csvUrl = 'assets/data/events-export-2026-08-19_19-32-23.csv';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<CsvEvent[]> {
    return this.http.get<CsvEvent[]>(this.apiUrl).pipe(
      catchError(() => {
        return this.http.get(this.csvUrl, { responseType: 'text' }).pipe(
          map((csvText: string) => this.parseCsv(csvText))
        );
      })
    );
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
