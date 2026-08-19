import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { FilterCardService } from '../../Services/filter-card.service';
import { PlacesService, CsvPlace } from '../../Services/places.service';

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

// 1. Region dictionary (Maps cities & region names in both English and Georgian)
const REGION_MAP: Record<string, string[]> = {
  adjara: ['adjara', 'აჭარა', 'batumi', 'ბათუმი', 'kobuleti', 'ქობულეთი', 'keda', 'ქედა', 'shuakhevi', 'შუახევი', 'khulo', 'ხულო'],
  svaneti: ['svaneti', 'samegrelo-zemo svaneti', 'სვანეთი', 'სამეგრელო-ზემო სვანეთი', 'samegrelo', 'zugdidi', 'ზუგდიდი', 'mestia', 'მესტია'],
  guria: ['guria', 'გურია', 'ozurgeti', 'ოზურგეთი', 'lanchkhuti', 'ლანჩხუთი', 'chokhatauri', 'ჩოხატაური'],
  kazbegi: ['kazbegi', 'mtskheta-mtianeti', 'ყაზბეგი', 'მცხეთა-მთიანეთი', 'stepantsminda', 'სტეფანწმინდა'],
  tbilisi: ['tbilisi', 'თბილისი'],
  mtskheta: ['mtskheta', 'მცხეთა'],
  samtskhe: ['samtskhe-javakheti', 'akhaltsikhe', 'სამცხე-ჯავახეთი', 'ახალციხე', 'javakheti', 'borjomi', 'ბორჯომი'],
  kakheti: ['kakheti', 'კახეთი', 'telavi', 'თელავი', 'sighnaghi', 'სიღნაღი'],
  imereti: ['imereti', 'იმერეთი', 'kutaisi', 'ქუთაისი'],
  racha: ['racha', 'racha-lechkhumi', 'რაჭა', 'რაჭა-ლეჩხუმი', 'ambrolauri', 'ამბროლაური'],
  kartli: ['shida kartli', 'kvemo kartli', 'შიდა ქართლი', 'ქვემო ქართლი', 'gori', 'გორი', 'rustavi', 'რუსთავი']
};

// 2. High-level Group dictionary
const GROUP_MAP: Record<string, string[]> = {
  nature: ['nature', 'ბუნება', 'natural', 'ეკოლოგია'],
  leisure: ['leisure', 'დასვენება', 'გართობა', 'recreation'],
  culture: ['culture', 'კულტურა', 'ისტორია', 'heritage', 'history'],
  food: ['food', 'საკვები', 'გასტრონომია', 'ღვინო', 'wine', 'gastronomy']
};

// 3. Category dictionary (matches values from your select dropdown options)
const CATEGORY_MAP: Record<string, string[]> = {
  lake: ['lake', 'lakes', 'ტბა', 'ტბები', 'tba', 'tbebi', 'tbas'],
  river: ['river', 'rivers', 'მდინარე', 'მდინარეები', 'mdinare', 'mdinareebi'],
  waterfall: ['waterfall', 'waterfalls', 'ჩანჩქერი', 'ჩანჩქერები', 'chanchkeri', 'chanckeri', 'chanchkeris', 'chanckeris', 'chanchkerebi'],
  canyon: ['canyon', 'canyons', 'კანიონი', 'კანიონები', 'kanioni', 'kanionebi'],
  mountain: ['mountain', 'mountains', 'მთა', 'მთები', 'mta', 'mtebi'],
  cave: ['cave', 'caves', 'მღვიამე', 'მღვიამეები', 'მღვიმე', 'მღვიმეები', 'mghvime', 'mgvime', 'mghvimeebi'],
  forest: ['forest', 'ტყე', 'ტყეები', 'tye', 'tyeebi'],
  'national-park': ['national park', 'ეროვნული პარკი', 'erovnuli parki'],
  'protected-area': ['protected area', 'დაცული ტერიტორია', 'dachuli teritoria'],
  valley: ['valley', 'ხეობა', 'xeoba'],
  coast: ['coast', 'sea coast', 'ზღვის სანაპირო', 'zgvis sanapiro'],
  spring: ['spring', 'natural spring', 'ბუნებრივი წყარო', 'bunebrivi tsqaro'],
  park: ['park', 'პარკი', 'parki'],
  church: ['church', 'monastery', 'ტაძარი', 'ეკლესია', 'მონასტერი'],
  fortress: ['fortress', 'castle', 'ციხე', 'ციხესიმაგრე'],
  winery: ['winery', 'wine', 'მარანი', 'ღვინო'],
  museum: ['museum', 'მუზეუმი'],
  bridge: ['bridge', 'ხიდი']
};

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  public filter = inject(FilterCardService);
  private placesService = inject(PlacesService);

  selectedRegionInput = input<string>('', { alias: 'selectedRegion' });
  public landmarks: Landmark[] = [];

  private map?: L.Map;
  private markers = new Map<string | number, L.Marker>();
  private georgiaBounds = L.latLngBounds([40.9, 39.8], [43.65, 46.8]);

  /**
   * Computed Signal collecting active filter criteria safely,
   * ignoring empty placeholders like '' or Georgian prompt headers.
   */
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
          // Ignore placeholder text or empty values from dropdowns
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

    // 1. Region
    const region = readValue(fAny?.selectedRegion, this.selectedRegionInput);

    // 2. Category / Nature (Mapped from selectedNature)
    const category = readValue(fAny?.selectedNature, fAny?.selectedCategory, fAny?.category);

    // 3. Group
    const group = readValue(fAny?.selectedGroup, fAny?.group);

    // 4. Free text Search
    const search = readValue(fAny?.searchTerm, fAny?.search, fAny?.filter);

    const filterState: FilterState = { region, category, group, search };
    console.log('🔍 [Computed Signal] Active Filter State Values:', JSON.stringify(filterState));
    return filterState;
  });

  constructor() {
    effect(() => {
      const filters = this.activeFilters();
 
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

        if (this.map) {
          this.addLandmarkMarkers();
          this.filterMarkers(this.activeFilters());
        }
      },
      error: (err) => console.error('❌ [ngOnInit] Failed to load places CSV:', err)
    });
  }

  ngAfterViewInit(): void {
     this.initMap();

    if (this.landmarks.length > 0) {
      this.addLandmarkMarkers();
      this.filterMarkers(this.activeFilters());
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [42.0, 43.6],
      zoom: 7,
      minZoom: 6,
      maxZoom: 15,
      maxBounds: this.georgiaBounds.pad(0.15),
      maxBoundsViscosity: 1
    });

    this.map.fitBounds(this.georgiaBounds);

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 15,
        attribution: '&copy; OpenStreetMap contributors & CartoDB'
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

  private createMarkerIcon(landmark: Landmark, size = 28): L.DivIcon {
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
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
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

      marker.bindPopup(`
        <div style="font-family: sans-serif; max-width: 200px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #1e293b; display: flex; align-items: center; gap: 4px;">
            ${landmark.emoji} ${landmark.name}
          </h4>
          <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 6px;">
            📍 ${landmark.region} · ${landmark.category}
          </span>
          <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">
            ${landmark.description || 'No description available.'}
          </p>
        </div>
      `);

      this.markers.set(landmark.id, marker);
      marker.addTo(this.map!);
    });

   }

  private latinToGeorgian(text: string): string {
    return text
      .toLowerCase()
      .replace(/chanch|chanc/g, 'ჩანჩ')
      .replace(/ch/g, 'ჩ')
      .replace(/sh/g, 'შ')
      .replace(/ts/g, 'ც')
      .replace(/dz/g, 'ძ')
      .replace(/kh/g, 'ხ')
      .replace(/gh/g, 'ღ')
      .replace(/ph/g, 'ფ')
      .replace(/th/g, 'თ')
      .replace(/mdinare/g, 'მდინარე')
      .replace(/a/g, 'ა')
      .replace(/b/g, 'ბ')
      .replace(/g/g, 'გ')
      .replace(/d/g, 'დ')
      .replace(/e/g, 'ე')
      .replace(/v/g, 'ვ')
      .replace(/z/g, 'ზ')
      .replace(/t/g, 'ტ')
      .replace(/i/g, 'ი')
      .replace(/k/g, 'კ')
      .replace(/l/g, 'ლ')
      .replace(/m/g, 'მ')
      .replace(/n/g, 'ნ')
      .replace(/o/g, 'ო')
      .replace(/p/g, 'პ')
      .replace(/r/g, 'რ')
      .replace(/s/g, 'ს')
      .replace(/u/g, 'უ');
  }

  // -----------------------------------------------------------------
  // INDIVIDUAL FILTER MATCHERS
  // -----------------------------------------------------------------

  private matchesRegion(landmark: Landmark, regionQuery: string): boolean {
    if (!regionQuery) return true;

    const search = regionQuery.trim().toLowerCase();
    const searchSingular = search.replace(/(is|es|s)$/i, '');
    const enRegion = (landmark.region || '').trim().toLowerCase();
    const name = (landmark.name || '').trim().toLowerCase();

    for (const aliases of Object.values(REGION_MAP)) {
      const isSearchInAlias = aliases.some(
        (a) => a.toLowerCase() === search || a.toLowerCase() === searchSingular
      );

      if (isSearchInAlias) {
        return aliases.some(
          (a) => a.toLowerCase() === enRegion || name.includes(a.toLowerCase())
        );
      }
    }

    return enRegion.includes(search) || enRegion.includes(searchSingular);
  }

  private matchesCategory(landmark: Landmark, categoryQuery: string): boolean {
    if (!categoryQuery) return true;

    const search = categoryQuery.trim().toLowerCase();
    const searchSingular = search.replace(/(is|es|s)$/i, '');
    const searchGeorgian = this.latinToGeorgian(searchSingular);

    const category = (landmark.category || '').trim().toLowerCase();
    const landmarkName = (landmark.name || '').trim().toLowerCase();

    // Check mapping dictionary using dropdown option values (e.g., 'waterfall', 'lake', etc.)
    for (const [key, aliases] of Object.entries(CATEGORY_MAP)) {
      const isMatchingKey = key === search || aliases.some((a) => a.toLowerCase() === search || a.toLowerCase() === searchSingular);
      if (isMatchingKey) {
        const allTargets = [key, ...aliases];
        return allTargets.some((target) => {
          const t = target.toLowerCase();
          return category.includes(t) || landmarkName.includes(t);
        });
      }
    }

    if (category && category.length > 1) {
      if (
        category.includes(search) ||
        category.includes(searchSingular) ||
        (searchGeorgian && category.includes(searchGeorgian)) ||
        landmarkName.includes(search) ||
        (searchGeorgian && landmarkName.includes(searchGeorgian))
      ) {
        return true;
      }
    }

    return false;
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
    if (!searchQuery) return true;

    const search = searchQuery.trim().toLowerCase();
    const searchSingular = search.replace(/(is|es|s)$/i, '');
    const searchGeorgian = this.latinToGeorgian(searchSingular);

    const landmarkName = (landmark.name || '').trim().toLowerCase();
    const description = (landmark.description || '').trim().toLowerCase();

    const nameWords = landmarkName.split(/[\s,.\-()"/]+/);
    const isWordMatch = nameWords.some(
      (w) => w === search || (searchGeorgian && w === searchGeorgian)
    );

    if (isWordMatch) return true;
    if (description.includes(search) || (searchGeorgian && description.includes(searchGeorgian))) return true;

    return false;
  }

  /**
   * STRICT COMBINED "AND" EVALUATION
   */
  private isLandmarkMatch(landmark: Landmark, filters: FilterState): boolean {
    if (!this.matchesRegion(landmark, filters.region)) return false;
    if (!this.matchesCategory(landmark, filters.category)) return false;
    if (!this.matchesGroup(landmark, filters.group)) return false;
    if (!this.matchesSearch(landmark, filters.search)) return false;
    return true;
  }

  private filterMarkers(filters: FilterState): void {
    if (!this.map) {
      console.warn('⚠️ [filterMarkers] Map not available.');
      return;
    }

    const hasActiveFilter = !!(filters.region || filters.category || filters.group || filters.search);

    if (!hasActiveFilter) {
      console.log('🔄 [filterMarkers] No filters applied. Showing all markers.');
      this.landmarks.forEach((landmark) => {
        const marker = this.markers.get(landmark.id);
        if (marker) marker.addTo(this.map!);
      });

      this.map.fitBounds(this.georgiaBounds);
      return;
    }

    const visibleCoords: [number, number][] = [];
    let matchCount = 0;

    this.landmarks.forEach((landmark) => {
      const marker = this.markers.get(landmark.id);
      if (!marker) return;

      const isMatched = this.isLandmarkMatch(landmark, filters);

      if (isMatched) {
        marker.addTo(this.map!);
        visibleCoords.push(landmark.coordinates);
        matchCount++;
      } else {
        marker.removeFrom(this.map!);
      }
    });

    console.log(`🎯 [filterMarkers] Matches found: ${matchCount} / ${this.landmarks.length}`);

    if (visibleCoords.length === 1) {
      this.map.setView(visibleCoords[0], 11, { animate: true });
    } else if (visibleCoords.length > 1) {
      const bounds = L.latLngBounds(visibleCoords);
      this.map.fitBounds(bounds.pad(0.25), { maxZoom: 11, animate: true });
    } else {
      console.warn('⚠️ [filterMarkers] No landmarks matched the selected filter criteria.');
      this.map.fitBounds(this.georgiaBounds);
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
    if (combined.includes('წყარო') || combined.includes('spring') || combined.includes('აბანო')) return '♨️';
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