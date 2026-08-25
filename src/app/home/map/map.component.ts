import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  Signal,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { FilterCardService } from '../../Services/filter-card.service';
import { PlacesService, CsvPlace } from '../../Services/places.service';

import { Router } from '@angular/router';
import { LanguageService } from '../../Services/language.service';
import { CardImageService } from '../../Services/card-image.service';

export interface Landmark {
  id: string | number;
  name: string;
  region: string;
  regionGe: string;
  coordinates: [number, number];
  description: string;
  emoji: string;
  color: string;
  category: string;
  groupKey?: string;
}

export interface FilterState {
  region: string;
  category: string;
  group: string;
  search: string;
}

const GROUP_MAP: Record<string, string[]> = {
  nature: ['nature', 'ბუნება', 'natural', 'ეკოლოგია'],
  leisure: ['leisure', 'დასვენება', 'გართობა', 'recreation'],
  culture: ['culture', 'კულტურა', 'ისტორია', 'heritage', 'history'],
  food: ['food', 'საკვები', 'გასტრონომია', 'ღვინო', 'wine', 'gastronomy']
};

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, OnDestroy {
  public filter = inject(FilterCardService);
  public langService = inject(LanguageService);
  private placesService = inject(PlacesService);
  private imageService = inject(CardImageService);
  private router = inject(Router);

  selectedRegionInput = input<string>('', { alias: 'selectedRegion' });
  public landmarks: Landmark[] = [];
  public isDataReady = false;

  private map?: L.Map;
  private markers = new Map<string | number, L.Marker>();
  private georgiaBounds = L.latLngBounds([40.9, 39.8], [43.65, 46.8]);

  public resetMapView(): void {
    if (this.map) {
      this.map.fitBounds(this.georgiaBounds, { animate: true });
    }
  }

  public openDetails(landmark: Landmark): void {
    const img = this.imageService.getImageForItem(
      String(landmark.id),
      landmark.name,
      landmark.category,
      landmark.region
    );

    this.router.navigate(['/details'], {
      queryParams: {
        id: landmark.id,
        title: landmark.name,
        location: landmark.region,
        badge: landmark.category || 'ადგილი',
        image: img,
        description: landmark.description,
        rating: '4.8 (50 შეფასება)'
      },
      state: {
        card: {
          id: landmark.id,
          title: landmark.name,
          location: landmark.region,
          badge: landmark.category,
          image: img,
          description: landmark.description
        }
      }
    });
  }

  @ViewChild('mapContainer') set mapContainerSetter(element: ElementRef<HTMLElement> | undefined) {
    if (element && !this.map) {
      this.initMap();
      this.addLandmarkMarkers();

      const filters = this.activeFilters();
      const hasActiveFilter = !!(filters.region || filters.category || filters.group || filters.search);
      if (hasActiveFilter) {
        this.filterMarkers(filters);
      }
    }
  }

  private activeFilters: Signal<FilterState> = computed(() => {
    const fAny = this.filter as any;

    const readValue = (...props: any[]): string => {
      for (const prop of props) {
        let val: any = '';
        if (typeof prop === 'function') {
          val = prop();
        } else if (typeof prop === 'string') {
          val = prop;
        }

        if (val !== null && val !== undefined) {
          const strVal = String(val).trim();
          if (
            strVal !== '' &&
            strVal !== 'აირჩიეთ ბუნება' &&
            strVal !== 'null' &&
            strVal !== 'undefined'
          ) {
            return strVal;
          }
        }
      }
      return '';
    };

    const region = readValue(fAny?.selectedRegion, this.selectedRegionInput);
    const category = readValue(fAny?.selectedNature, fAny?.selectedCategory, fAny?.category);
    const group = readValue(fAny?.selectedGroup, fAny?.group);
    const search = readValue(this.filter.searchInput, fAny?.searchTerm, fAny?.search, fAny?.filter);

    return { region, category, group, search };
  });

  private isFirstEffectRun = true;

  constructor() {
    effect(() => {
      const filters = this.activeFilters();

      if (this.isFirstEffectRun) {
        this.isFirstEffectRun = false;
        return;
      }

      if (!this.map) {
        return;
      }
      this.filterMarkers(filters);
    });
  }

  ngOnInit(): void {
    this.placesService.getPlaces().subscribe({
      next: (places: CsvPlace[]) => {
        this.landmarks = places.map((p) => this.mapCsvToLandmark(p));
        this.isDataReady = true;
      },
      error: (err) => console.error('❌ [ngOnInit] Failed to load places CSV:', err)
    });
  }

  private initMap(): void {
    if (this.map) return;

    const mapOptions: L.MapOptions = {
      preferCanvas: true,
      center: [42.0, 43.6],
      zoom: 7,
      minZoom: 6,
      maxZoom: 15,
      maxBounds: this.georgiaBounds.pad(0.15),
      maxBoundsViscosity: 0.8,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      bounceAtZoomLimits: false,
      scrollWheelZoom: true,
      touchZoom: true
    };
    (mapOptions as any).tap = false;

    this.map = L.map('map', mapOptions);

    this.map.fitBounds(this.georgiaBounds);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 15,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors & CartoDB',
        keepBuffer: 1, // Optimized memory buffer for iOS WebKit
        updateWhenIdle: true,
        updateWhenZooming: false
      }
    ).addTo(this.map);
  }

  private mapCsvToLandmark(p: CsvPlace): Landmark {
    return {
      id: p.id ?? Math.random(),
      name: p.name || 'Unnamed Place',
      region: p.region || '',
      regionGe: p.region || '',
      coordinates: [p.lat || 0, p.lng || 0],
      description: p.description || '',
      category: p.category || 'General',
      groupKey: p.group_key || '',
      emoji: this.getEmoji(p.category || '', p.name || '', p.group_key || ''),
      color: this.getGroupColor(p.group_key || '')
    };
  }

  private createMarkerIcon(landmark: Landmark, size = 30): L.DivIcon {
    return L.divIcon({
      className: 'custom-map-marker-pin',
      html: `
        <span style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${size}px;
          height: ${size}px;
          font-size: ${size * 0.55}px;
          border-radius: 9999px;
          background: ${landmark.color};
          border: 2px solid #ffffff;
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          cursor: pointer;
          transform: translate3d(0,0,0);
          -webkit-transform: translate3d(0,0,0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          contain: layout style;
        ">
          ${landmark.emoji}
        </span>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  private addLandmarkMarkers(): void {
    if (!this.map) return;

    this.markers.forEach((m) => m.remove());
    this.markers.clear();

    this.landmarks.forEach((landmark) => {
      const icon = this.createMarkerIcon(landmark);
      const marker = L.marker(landmark.coordinates, { icon });

      const safeId = String(landmark.id).replace(/[^a-zA-Z0-9-_]/g, '_');
      const btnId = `map-btn-${safeId}`;

      marker.bindPopup(`
        <div style="font-family: system-ui, -apple-system, sans-serif; width: 220px; padding: 2px;">
          <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 18px;">${landmark.emoji}</span> ${this.langService.translate(landmark.name)}
          </h4>
          <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #15803d; background-color: #f0fdf4; padding: 2px 8px; border-radius: 9999px; margin-bottom: 8px;">
            📍 ${this.langService.translate(landmark.region)} · ${this.langService.translate(landmark.category)}
          </span>
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #475569; line-height: 1.45;">
            ${this.langService.translate(landmark.description) || 'ინფორმაცია არ არის მითითებული.'}
          </p>
          <button id="${btnId}" style="
            display: block;
            width: 100%;
            text-align: center;
            background-color: #1F3D2B;
            color: #ffffff;
            font-size: 12px;
            font-weight: 600;
            padding: 8px 12px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.15);
            transition: all 0.2s ease;
          ">
            ${this.langService.t('ნახე დეტალები', 'Check Details')} →
          </button>
        </div>
      `);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(btnId);
          if (btn) {
            btn.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.openDetails(landmark);
            };
          }
        }, 50);
      });

      this.markers.set(landmark.id, marker);
      if (this.map && !this.map.hasLayer(marker)) {
        marker.addTo(this.map);
      }
    });
  }

  private matchesGroup(landmark: Landmark, groupQuery: string): boolean {
    if (!groupQuery) return true;

    const search = groupQuery.trim().toLowerCase();
    const searchSingular = search.replace(/(is|es|s)$/i, '');
    const groupKey = (landmark.groupKey || '').trim().toLowerCase();

    if (groupKey && (groupKey === search || groupKey.includes(search))) return true;

    for (const [key, aliases] of Object.entries(GROUP_MAP)) {
      const isSearchInGroup = aliases.some(
        (a) => a.toLowerCase() === search || a.toLowerCase() === searchSingular
      );
      if (isSearchInGroup && (groupKey === key || aliases.some((a) => a.toLowerCase() === groupKey))) {
        return true;
      }
    }

    return false;
  }

  private matchesSearch(landmark: Landmark, searchQuery: string): boolean {
    return this.filter.matchesSearch({
      name: landmark.name,
      region: landmark.region,
      category: landmark.category,
      description: landmark.description
    }, searchQuery);
  }

  private isLandmarkMatch(landmark: Landmark, filters: FilterState): boolean {
    const regionMatch = this.filter.matchesRegion(landmark.region, landmark.name, filters.region);
    const categoryMatch = this.filter.matchesNature(
      landmark.category,
      landmark.name,
      landmark.description,
      landmark.category,
      filters.category
    );
    const groupMatch = this.matchesGroup(landmark, filters.group);
    const searchMatch = this.matchesSearch(landmark, filters.search);

    return regionMatch && categoryMatch && groupMatch && searchMatch;
  }

  private filterMarkers(filters: FilterState): void {
    if (!this.map) return;

    const hasActiveFilter = !!(filters.region || filters.category || filters.group || filters.search);

    if (!hasActiveFilter) {
      this.landmarks.forEach((landmark) => {
        const marker = this.markers.get(landmark.id);
        if (marker && this.map && !this.map.hasLayer(marker)) {
          marker.addTo(this.map);
        }
      });

      this.map.fitBounds(this.georgiaBounds, { animate: true });
      return;
    }

    const visibleCoords: [number, number][] = [];
    let matchedLandmark: Landmark | undefined;

    this.landmarks.forEach((landmark) => {
      const marker = this.markers.get(landmark.id);
      if (!marker) return;

      const isMatched = this.isLandmarkMatch(landmark, filters);

      if (isMatched) {
        if (this.map && !this.map.hasLayer(marker)) {
          marker.addTo(this.map);
        }
        visibleCoords.push(landmark.coordinates);
        matchedLandmark = landmark;
      } else {
        if (this.map && this.map.hasLayer(marker)) {
          marker.removeFrom(this.map);
        }
      }
    });

    if (visibleCoords.length === 1 && matchedLandmark) {
      this.map.setView(visibleCoords[0], 12, { animate: true });
      const m = this.markers.get(matchedLandmark.id);
      if (m) {
        setTimeout(() => m.openPopup(), 150);
      }
    } else if (visibleCoords.length > 1) {
      const bounds = L.latLngBounds(visibleCoords);
      this.map.fitBounds(bounds.pad(0.25), { maxZoom: 12, animate: true });
    } else {
      this.map.fitBounds(this.georgiaBounds, { animate: true });
    }
  }

  private getGroupColor(group = ''): string {
    switch (group.toLowerCase()) {
      case 'nature': return '#16a34a';  // Green
      case 'leisure': return '#0284c7'; // Blue
      case 'culture': return '#9333ea'; // Purple
      case 'food': return '#ea580c';    // Orange
      default: return '#00bcd4';
    }
  }

  private getEmoji(category = '', name = '', groupKey = ''): string {
    const cat = category.toLowerCase();
    const nm = name.toLowerCase();
    const combined = `${cat} ${nm}`;

    if (combined.includes('ჩანჩქერი') || combined.includes('waterfall') || combined.includes('chanch')) return '💦';
    if (combined.includes('ტბა') || combined.includes('ტბები') || combined.includes('lake')) return '🏞️';
    if (combined.includes('კანიონი') || combined.includes('canyon')) return '🏜️';
    if (combined.includes('მდინარე') || combined.includes('river')) return '🌊';
    if (combined.includes('მთა') || combined.includes('mountain') || combined.includes('მწვერვალი')) return '🏔️';
    if (combined.includes('მღვიმე') || combined.includes('მღვიამე') || combined.includes('cave') || combined.includes('გამოქვაბული')) return '🕳️';
    if (combined.includes('ტყე') || combined.includes('forest')) return '🌲';
    if (combined.includes('ეროვნული პარკი') || combined.includes('national park')) return '🏕️';
    if (combined.includes('დაცული ტერიტორია') || combined.includes('ნაკრძალი')) return '🛡️';
    if (combined.includes('ხეობა') || combined.includes('valley')) return '⛰️';
    if (combined.includes('სანაპირო') || combined.includes('coast') || combined.includes('ზღვა')) return '🏖️';
    if (combined.includes('წყარო') || combined.includes('spring') || combined.includes('აბანო')) return '💦';
    if (combined.includes('პარკი') || combined.includes('park') || combined.includes('ბაღი')) return '🌳';
    if (combined.includes('ტაძარი') || combined.includes('ეკლესია') || combined.includes('მონასტერი') || combined.includes('church') || combined.includes('ჯვარი') || combined.includes('ნიში')) return '⛪';
    if (combined.includes('ციხე') || combined.includes('fortress') || combined.includes('კოშკი') || combined.includes('castle')) return '🏰';
    if (combined.includes('მარანი') || combined.includes('ღვინო') || combined.includes('wine') || combined.includes('winery')) return '🍷';
    if (combined.includes('გალერეა') || combined.includes('gallery')) return '🖼️';
    if (combined.includes('მუზეუმი') || combined.includes('museum')) return '🏛️';
    if (combined.includes('ხიდი') || combined.includes('bridge')) return '🌉';
    if (combined.includes('ხედი') || combined.includes('გადასახედი') || combined.includes('პანორამა') || combined.includes('view')) return '🌄';
    if (combined.includes('კაფე') || combined.includes('cafe') || combined.includes('ჩაი')) return '☕';
    if (combined.includes('რესტორანი') || combined.includes('restaurant') || combined.includes('საკვები') || combined.includes('სტრიტ-ფუდ')) return '🍽️';
    if (combined.includes('ველობილიკი') || combined.includes('velo')) return '🚴';
    if (combined.includes('ზოოპარკი') || combined.includes('zoo')) return '🦁';

    switch (groupKey.toLowerCase()) {
      case 'nature': return '🌿';
      case 'leisure': return '🎡';
      case 'culture': return '🎭';
      case 'food': return '🍷';
      default: return '📍';
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
}