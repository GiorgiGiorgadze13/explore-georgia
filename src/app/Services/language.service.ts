import { Injectable, signal, computed } from '@angular/core';

export type Language = 'geo' | 'eng';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<Language>('geo');

  isGeo = computed(() => this.currentLang() === 'geo');
  isEng = computed(() => this.currentLang() === 'eng');

  toggleLanguage(): void {
    this.currentLang.update((lang) => (lang === 'geo' ? 'eng' : 'geo'));
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
  }

  t(geo: string, eng: string): string {
    return this.currentLang() === 'geo' ? geo : eng;
  }
}
