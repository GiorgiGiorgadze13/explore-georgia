import { Injectable, inject } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { PlacesService, CsvPlace } from './places.service';
import { FilterCardService, toSimpleLatin } from './filter-card.service';
import { LanguageService } from './language.service';

export type SearchIntentType =
  | 'specific-place'
  | 'category-location'
  | 'category'
  | 'region'
  | 'general';

export interface SearchIntent {
  type: SearchIntentType;
  placeName?: string;
  category?: string;
  location?: string;
  isRegion?: boolean;
  matchedPlaceId?: string;
  exactMatchOnly?: boolean;
  rawQuery: string;
}

export interface RecommendationResult {
  botMessageText: string;
  recommendations: CsvPlace[];
  isFallback: boolean;
  isVague: boolean;
  quickSuggestions?: string[];
}

export const USER_CATEGORY_ALIASES: Record<string, string[]> = {
  sea: ['ზღვა', 'ზღვის', 'ზღვაზე', 'ზღვასთან', 'ზღვი', 'ზღვას', 'ზღვაა', 'ზღვები', 'ზღვებს', 'ზღვისკენ', 'ზღვაში', 'პლაჟი', 'პლაჟები', 'პლაჟზე', 'სანაპირო', 'სანაპიროზე', 'sea', 'beach', 'coast'],
  mountain: ['მთა', 'მთები', 'მთაში', 'მთაზე', 'მთის', 'მწვერვალი', 'mountain', 'mountains'],
  river: ['მდინარე', 'მდინარეები', 'მდინარეში', 'მდინარესთან', 'მდინარის', 'river', 'rivers'],
  canyon: ['კანიონი', 'კანიონები', 'კანიონში', 'canyon', 'canyons'],
  waterfall: ['ჩანჩქერი', 'ჩანჩქერები', 'ჩანჩქერში', 'waterfall', 'waterfalls'],
  lake: ['ტბა', 'ტბები', 'ტბაში', 'ტბაზე', 'ტბის', 'lake', 'lakes'],
  cave: ['მღვიმე', 'გამოქვაბული', 'მღვიმეში', 'cave', 'caves'],
  forest: ['ტყე', 'ტყეში', 'forest'],
  nature: ['ბუნება', 'ბუნების', 'ბუნებაში', 'nature'],
  culture: ['ისტორიული', 'ტაძარი', 'ეკლესია', 'ციხე', 'მუზეუმი', 'culture', 'history', 'historical'],
  food: ['ღვინო', 'მარანი', 'რესტორანი', 'კაფე', 'food', 'wine']
};

export const USER_LOCATION_ALIASES: Record<string, string[]> = {
  // Sub-locations / Municipalities
  'მარტვილი': ['მარტვილი', 'მარტვილის', 'მარტვილში', 'martvili', 'martvil'],
  'ზუგდიდი': ['ზუგდიდი', 'ზუგდიდის', 'ზუგდიდში', 'zugdidi'],
  'ბათუმი': ['ბათუმი', 'ბათუმის', 'ბათუმში', 'batumi'],
  'ქობულეთი': ['ქობულეთი', 'ქობულეთის', 'ქობულეთში', 'kobuleti'],
  'ქუთაისი': ['ქუთაისი', 'ქუთაისის', 'ქუთაისში', 'kutaisi'],
  'წყალტუბო': ['წყალტუბო', 'წყალტუბოს', 'წყალტუბოში', 'tskaltubo'],
  'მესტია': ['მესტია', 'მესტიის', 'მესტიაში', 'mestia'],
  'ყაზბეგი': ['ყაზბეგი', 'ყაზბეგის', 'ყაზბეგში', 'სტეფანწმინდა', 'kazbegi', 'stepantsminda'],
  'ბორჯომი': ['ბორჯომი', 'ბორჯომის', 'ბორჯომში', 'borjomi'],
  'თელავი': ['თელავი', 'თელავის', 'თელავში', 'telavi'],
  'სიღნაღი': ['სიღნაღი', 'სიღნაღის', 'სიღნაღში', 'sighnaghi'],
  'ოზურგეთი': ['ოზურგეთი', 'ოზურგეთის', 'ოზურგეთში', 'ozurgeti'],
  'მცხეთა': ['მცხეთა', 'მცხეთის', 'მცხეთაში', 'mtskheta'],
  'გორი': ['გორი', 'გორის', 'გორში', 'gori'],
  'ახალციხე': ['ახალციხე', 'ახალციხის', 'ახალციხეში', 'akhaltsikhe'],
  // Regions
  'სამეგრელო': ['სამეგრელო', 'სამეგრელოს', 'სამეგრელოში', 'samegrelo'],
  'გურია': ['გურია', 'გურიის', 'გურიაში', 'guria'],
  'აჭარა': ['აჭარა', 'აჭარის', 'აჭარაში', 'adjara'],
  'იმერეთი': ['იმერეთი', 'იმერეთის', 'იმერეთში', 'imereti'],
  'კახეთი': ['კახეთი', 'კახეთის', 'კახეთში', 'kakheti'],
  'სვანეთი': ['სვანეთი', 'სვანეთის', 'სვანეთში', 'svaneti'],
  'რაჭა': ['რაჭა', 'რაჭის', 'რაჭაში', 'racha', 'ლეჩხუმი'],
  'მცხეთა-მთიანეთი': ['მცხეთა-მთიანეთი'],
  'ქვემო ქართლი': ['ქვემო ქართლი', 'kvemo kartli'],
  'შიდა ქართლი': ['შიდა ქართლი', 'shida kartli'],
  'თბილისი': ['თბილისი', 'თბილისში', 'tbilisi'],
  'სამცხე-ჯავახეთი': ['სამცხე-ჯავახეთი', 'samtskhe', 'javakheti']
};

export const DATA_CATEGORY_MAPPINGS: Record<string, {
  categories: string[];
  groupKeys: string[];
  tags: string[];
  nameKeywords: string[];
  descKeywords?: string[];
}> = {
  sea: {
    categories: ['პლაჟი', 'სანაპირო', 'ბულვარი', 'sea', 'beach', 'coast'],
    groupKeys: [],
    tags: ['ზღვა', 'პლაჟი', 'სანაპირო', 'ბულვარი', 'sea', 'beach', 'coast'],
    nameKeywords: ['ზღვა', 'ზღვის', 'პლაჟი', 'სანაპირო', 'ბულვარი', 'sea', 'beach', 'coast'],
    descKeywords: ['შავი ზღვა', 'ზღვის პლაჟი', 'ზღვის სანაპირო', 'სანაპირო ზოლი']
  },
  mountain: {
    categories: ['მწვერვალი', 'მთა', 'mountain'],
    groupKeys: [],
    tags: ['მთა', 'მთები', 'მწვერვალი', 'mountain', 'mountains'],
    nameKeywords: ['მთა ', ' მთა', 'მთის ', 'მწვერვალი', ' mountain'],
    descKeywords: ['მწვერვალი']
  },
  river: {
    categories: ['მდინარე', 'river'],
    groupKeys: [],
    tags: ['მდინარე', 'მდინარეები', 'river', 'rivers'],
    nameKeywords: ['მდინარე', 'მდინარის', 'river'],
    descKeywords: ['მდინარის ნაპირზე', 'მდინარის ხეობაში']
  },
  canyon: {
    categories: ['კანიონი', 'canyon'],
    groupKeys: [],
    tags: ['კანიონი', 'კანიონები', 'canyon', 'canyons'],
    nameKeywords: ['კანიონი', 'კანიონის', 'canyon'],
    descKeywords: ['კანიონი']
  },
  waterfall: {
    categories: ['ჩანჩქერი', 'waterfall'],
    groupKeys: [],
    tags: ['ჩანჩქერი', 'waterfall'],
    nameKeywords: ['ჩანჩქერი', 'ჩანჩქერის', 'waterfall'],
    descKeywords: ['ჩანჩქერი']
  },
  lake: {
    categories: ['ტბა', 'lake'],
    groupKeys: [],
    tags: ['ტბა', 'ტბები', 'lake', 'lakes'],
    nameKeywords: ['ტბა', 'ტბის', 'lake'],
    descKeywords: ['ტბა']
  },
  cave: {
    categories: ['მღვიმე', 'გამოქვაბული', 'cave'],
    groupKeys: [],
    tags: ['მღვიმე', 'გამოქვაბული', 'cave'],
    nameKeywords: ['მღვიმე', 'გამოქვაბული', 'მღვიმის'],
    descKeywords: ['მღვიმე', 'გამოქვაბული']
  },
  culture: {
    categories: ['ისტორიული ადგილი', 'მუზეუმი', 'არქეოლოგიური ძეგლი', 'ციხე-დარბაზი', 'ეკლესია', 'ციხე', 'მონასტერი', 'ნანგრევები', 'მემორიალი', 'ძეგლი'],
    groupKeys: ['culture'],
    tags: ['ისტორიული', 'კულტურა', 'ეკლესია', 'მონასტერი', 'ციხე', 'მუზეუმი'],
    nameKeywords: ['ტაძარი', 'ეკლესია', 'მონასტერი', 'ციხე', 'მუზეუმი'],
    descKeywords: []
  },
  food: {
    categories: ['სწრაფი კვება', 'კაფე', 'რესტორანი', 'კვება'],
    groupKeys: ['food'],
    tags: ['კვება', 'რესტორანი', 'ღვინო', 'მარანი', 'ხაჭაპური'],
    nameKeywords: ['რესტორანი', 'კაფე', 'მარანი', 'ღვინო'],
    descKeywords: []
  },
  nature: {
    categories: ['ბუნება', 'ხედი', 'წყარო', 'პარკი'],
    groupKeys: ['nature', 'leisure'],
    tags: ['ბუნება', 'პარკი', 'ხედი'],
    nameKeywords: ['პარკი', 'ბაღი', 'ნაკრძალი'],
    descKeywords: []
  }
};

@Injectable({
  providedIn: 'root'
})
export class AiRecommendationService {
  private placesService = inject(PlacesService);
  private filterService = inject(FilterCardService);
  private langService = inject(LanguageService);

  private readonly MAX_RECOMMENDATIONS = 5;

  getRecommendations(userQuery: string): Observable<RecommendationResult> {
    const raw = userQuery ? userQuery.trim() : '';

    return this.placesService.getPlaces().pipe(
      take(1),
      map((allPlaces: CsvPlace[]) => {
        if (!raw) {
          return this.createVagueResponse();
        }

        if (this.isGenericOrGreeting(raw)) {
          return this.createVagueResponse();
        }

        // 1. Extract Search Intent
        const intent = this.extractIntent(raw, allPlaces);

        // 2. Filter Places Strictly by Intent
        const matchedPlaces = this.filterPlacesByIntent(allPlaces, intent);

        // 3. Limit to MAX_RECOMMENDATIONS (5) AFTER filtering
        const finalRecommendations = matchedPlaces.slice(0, this.MAX_RECOMMENDATIONS);

        // 4. Debug Logging
        console.log('=== AI RECOMMENDATION SEARCH ===');
        console.log('USER QUERY:', raw);
        console.log('PARSED INTENT:', intent);
        console.log('TOTAL MATCH COUNT:', matchedPlaces.length);
        console.log('FILTERED RESULTS (MAX 5):', finalRecommendations.map(p => `${p.name} (${p.region})`));
        console.log('=================================');

        // 5. Build Bot Response Text
        const botMessageText = this.buildBotResponseText(intent, matchedPlaces.length);

        // 6. Generate Context-Aware Quick Suggestions strictly from actual search results
        const quickSuggestions = this.generateQuickSuggestions(intent, finalRecommendations);

        return {
          botMessageText,
          recommendations: finalRecommendations,
          isFallback: false,
          isVague: matchedPlaces.length === 0,
          quickSuggestions
        };
      })
    );
  }

  private isGenericOrGreeting(query: string): boolean {
    const q = query.toLowerCase().trim();
    const simple = toSimpleLatin(q);

    const greetings = [
      'გამარჯობა', 'სალამი', 'გამარჯობათ', 'hello', 'hi', 'hey', 'привет', 'Здравствуйте',
      'რამე კარგი', 'სად წავიდე', 'რას მირჩევ', 'something nice', 'where to go', 'recommendation'
    ];

    if (q.length <= 3 && !['mta', 'tba', 'sea', 'geo'].includes(simple)) return true;
    return greetings.some(g => q === g || simple === toSimpleLatin(g));
  }

  private createVagueResponse(): RecommendationResult {
    const isGeo = this.langService.isGeo();
    const isRus = this.langService.isRus();

    let text = 'სიამოვნებით დაგეხმარებით! 🌿 რისი ნახვა გსურთ? შეგიძლიათ მიუთითოთ კატეგორია (მაგ. "ზღვა", "კანიონი", "მთა") ან კონკრეტული ადგილი.';
    if (isRus) {
      text = 'С удовольствием помогу! 🌿 Что бы вы хотели посетить? Вы можете указать категорию (напр. "море", "каньон", "горы") или конкретное место.';
    } else if (!isGeo) {
      text = 'I\'d love to help! 🌿 What would you like to see? You can specify a category (e.g. "sea", "canyon", "mountain") or specific place.';
    }

    return {
      botMessageText: text,
      recommendations: [],
      isFallback: false,
      isVague: true,
      quickSuggestions: [
        '🌊 ზღვა / Sea',
        '🌊 კანიონები / Canyons',
        '🏔️ მთები / Mountains',
        '🌲 ბუნება / Nature'
      ]
    };
  }

  public normalizeGeorgianText(text: string): string {
    if (!text) return '';

    let str = text
      .toLowerCase()
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ')
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"'„“]/g, ' ')
      .replace(/\s+/g, ' ');

    const words = str.split(' ').map(word => {
      if (word.length <= 3) return word;

      if (word.endsWith('აა') && word.length >= 4) return word.slice(0, -1);
      if (word.endsWith('ია') && word.length >= 4) return word.slice(0, -1);

      if (word.endsWith('იდან') && word.length > 5) return word.slice(0, -4) + 'ი';
      if (word.endsWith('დან') && word.length > 4) return word.slice(0, -3);
      if (word.endsWith('ში') && word.length > 3) {
        const stem = word.slice(0, -2);
        if (['ლ', 'თ', 'რ', 'ს', 'ნ', 'მ', 'ვ', 'დ', 'გ', 'კ', 'პ', 'ბ', 'ჭ', 'ც', 'ძ'].some(c => stem.endsWith(c))) {
          return stem + 'ი';
        }
        return stem;
      }
      if (word.endsWith('ზე') && word.length > 3) return word.slice(0, -2);
      if (word.endsWith('ის') && word.length > 4) return word.slice(0, -2) + 'ი';
      if (word.endsWith('ით') && word.length > 3) return word.slice(0, -2);
      if (word.endsWith('ად') && word.length > 3) return word.slice(0, -2);
      if (word.endsWith('ს') && word.length >= 4 && !word.endsWith('ის')) return word.slice(0, -1);

      return word;
    });

    return words.join(' ');
  }

  public extractIntent(query: string, allPlaces: CsvPlace[]): SearchIntent {
    const normQuery = this.normalizeGeorgianText(query);
    const simpleQuery = toSimpleLatin(normQuery);
    const words = normQuery.split(' ').filter(Boolean);

    // 1. Detect Category from USER_CATEGORY_ALIASES
    let detectedCategory: string | undefined;
    for (const [catKey, aliases] of Object.entries(USER_CATEGORY_ALIASES)) {
      const matched = aliases.some(alias => {
        const simpleAlias = toSimpleLatin(alias);
        return words.includes(alias) ||
               words.includes(simpleAlias) ||
               (alias.length >= 4 && normQuery.includes(alias)) ||
               (simpleAlias.length >= 4 && simpleQuery.includes(simpleAlias));
      });
      if (matched) {
        detectedCategory = catKey;
        break;
      }
    }

    // 2. Detect Location from USER_LOCATION_ALIASES
    let detectedLocation: string | undefined;
    let isRegion = false;
    for (const [locName, aliases] of Object.entries(USER_LOCATION_ALIASES)) {
      const matched = aliases.some(alias => {
        const simpleAlias = toSimpleLatin(alias);
        return words.includes(alias) ||
               words.includes(simpleAlias) ||
               (alias.length >= 4 && normQuery.includes(alias)) ||
               (simpleAlias.length >= 4 && simpleQuery.includes(simpleAlias));
      });
      if (matched) {
        detectedLocation = locName;
        isRegion = ['სამეგრელო', 'გურია', 'აჭარა', 'იმერეთი', 'კახეთი', 'სვანეთი', 'რაჭა', 'მცხეთა-მთიანეთი', 'ქვემო ქართლი', 'შიდა ქართლი', 'თბილისი', 'სამცხე-ჯავახეთი'].includes(locName);
        break;
      }
    }

    // 3. Category + Location
    if (detectedCategory && detectedLocation) {
      return {
        type: 'category-location',
        category: detectedCategory,
        location: detectedLocation,
        isRegion,
        rawQuery: query
      };
    }

    // 4. Category only
    if (detectedCategory) {
      return {
        type: 'category',
        category: detectedCategory,
        rawQuery: query
      };
    }

    // 5. Region / Location only
    if (detectedLocation) {
      return {
        type: 'region',
        location: detectedLocation,
        isRegion,
        rawQuery: query
      };
    }

    // 6. Check Specific Place Name ONLY if not Category or Location
    const stopWords = [
      'მინდა', 'ვნახო', 'მინახე', 'მაჩვენე', 'გთხოვ', 'არის', 'სად', 'რომელი', 'რომელია',
      'ადგილი', 'ადგილები', 'როგორი', 'როგორ', 'წასვლა', 'მოგზაურობა', 'დავალიერო',
      'want', 'see', 'show', 'please', 'find', 'location', 'where', 'visit', 'go', 'to'
    ];

    const coreWords = words.filter(w => !stopWords.includes(w) && w.length > 1);
    const coreCandidate = coreWords.join(' ').trim();
    const simpleCoreCandidate = toSimpleLatin(coreCandidate);

    if (coreCandidate.length >= 2 || simpleCoreCandidate.length >= 2) {
      let exactMatchedPlace: CsvPlace | undefined;
      let partialMatchedPlace: CsvPlace | undefined;

      for (const place of allPlaces) {
        const normPlaceName = this.normalizeGeorgianText(place.name || '');
        const simplePlaceName = toSimpleLatin(normPlaceName);

        if (normPlaceName === coreCandidate || simplePlaceName === simpleCoreCandidate) {
          exactMatchedPlace = place;
          break;
        }

        if (!partialMatchedPlace) {
          const placeContainsCand = normPlaceName.length >= 3 && normPlaceName.includes(coreCandidate);
          const candContainsPlace = coreCandidate.length >= 3 && coreCandidate.includes(normPlaceName);
          if (placeContainsCand || candContainsPlace) {
            partialMatchedPlace = place;
          }
        }
      }

      const matchedPlace = exactMatchedPlace || partialMatchedPlace;
      if (matchedPlace) {
        return {
          type: 'specific-place',
          placeName: matchedPlace.name,
          matchedPlaceId: matchedPlace.id,
          exactMatchOnly: !!exactMatchedPlace,
          rawQuery: query
        };
      }
    }

    return {
      type: 'general',
      rawQuery: query
    };
  }

  public filterPlacesByIntent(allPlaces: CsvPlace[], intent: SearchIntent): CsvPlace[] {
    if (!allPlaces || allPlaces.length === 0) return [];

    // 1. Specific Place Search
    if (intent.type === 'specific-place') {
      const targetName = intent.placeName || '';
      const normTarget = this.normalizeGeorgianText(targetName);
      const simpleTarget = toSimpleLatin(normTarget);

      if (intent.exactMatchOnly) {
        return allPlaces.filter(place => {
          const normPlaceName = this.normalizeGeorgianText(place.name || '');
          const simplePlaceName = toSimpleLatin(normPlaceName);
          return normPlaceName === normTarget || simplePlaceName === simpleTarget;
        });
      }

      return allPlaces.filter(place => {
        if (intent.matchedPlaceId && place.id === intent.matchedPlaceId) return true;
        const normPlaceName = this.normalizeGeorgianText(place.name || '');
        const simplePlaceName = toSimpleLatin(normPlaceName);

        return normPlaceName === normTarget ||
               simplePlaceName === simpleTarget ||
               (normPlaceName.length >= 3 && normPlaceName.includes(normTarget)) ||
               (normTarget.length >= 3 && normTarget.includes(normPlaceName));
      });
    }

    // 2. Category + Location Search (STRICT AND LOGIC)
    if (intent.type === 'category-location') {
      const matched = allPlaces.filter(place => {
        const locOk = intent.location ? this.matchesLocationStrict(place, intent.location, !!intent.isRegion) : true;
        const catOk = intent.category ? this.matchesCategoryWithMapping(place, intent.category) : true;
        return locOk && catOk;
      });
      matched.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return matched;
    }

    // 3. Category Search
    if (intent.type === 'category') {
      const matched = allPlaces.filter(place => {
        return intent.category ? this.matchesCategoryWithMapping(place, intent.category) : true;
      });
      matched.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return matched;
    }

    // 4. Region / Location Search
    if (intent.type === 'region') {
      const matched = allPlaces.filter(place => {
        return intent.location ? this.matchesLocationStrict(place, intent.location, !!intent.isRegion) : true;
      });
      matched.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return matched;
    }

    // 5. General / Unmatched
    return [];
  }

  private matchesCategoryWithMapping(place: CsvPlace, catKey: string): boolean {
    const mapping = DATA_CATEGORY_MAPPINGS[catKey];
    if (!mapping) return false;

    const cat = (place.category || '').toLowerCase();
    const group = (place.group_key || '').toLowerCase();
    const name = (place.name || '').toLowerCase();
    const tags = Array.isArray(place.tags) ? place.tags.join(' ').toLowerCase() : String(place.tags || '').toLowerCase();
    const desc = (place.description || '').toLowerCase();

    // Clean out false positive words in Georgian
    const cleanNameForMountain = name.replace(/მთავარი/g, '').replace(/მთავარ/g, '');
    const cleanDescForSea = desc.replace(/ზღვის დონიდან/g, '');

    if (catKey === 'sea') {
      return cat.includes('პლაჟ') || cat.includes('სანაპირო') || cat.includes('ზღვა') ||
             tags.includes('ზღვა') || tags.includes('პლაჟ') || tags.includes('sea') || tags.includes('beach') ||
             name.includes('ზღვა') || name.includes('პლაჟ') || name.includes('სანაპირო') ||
             cleanDescForSea.includes('შავი ზღვა') || cleanDescForSea.includes('ზღვის პლაჟი') || cleanDescForSea.includes('ზღვის სანაპირო');
    }

    if (catKey === 'mountain') {
      return cat === 'მწვერვალი' || cat === 'მთა' || tags.includes('მთა') || tags.includes('მწვერვალი') ||
             cleanNameForMountain.includes('მთა ') || cleanNameForMountain.includes(' მთა') || cleanNameForMountain.endsWith(' მთა') || cleanNameForMountain === 'მთა' ||
             cleanNameForMountain.includes('მთის ') || cleanNameForMountain.includes('მწვერვალი');
    }

    if (catKey === 'canyon') {
      return cat.includes('კანიონ') || name.includes('კანიონ') || tags.includes('კანიონ');
    }

    if (catKey === 'waterfall') {
      return cat.includes('ჩანჩქერ') || name.includes('ჩანჩქერ') || tags.includes('ჩანჩქერ');
    }

    if (catKey === 'river') {
      return cat.includes('მდინარ') || name.includes('მდინარ') || tags.includes('მდინარ');
    }

    if (catKey === 'lake') {
      return cat.includes('ტბა') || name.includes('ტბა') || tags.includes('ტბა');
    }

    if (catKey === 'cave') {
      return cat.includes('მღვიმე') || cat.includes('გამოქვაბულ') || name.includes('მღვიმ') || name.includes('გამოქვაბულ');
    }

    if (catKey === 'culture') {
      return group === 'culture' || cat.includes('ისტორიულ') || cat.includes('მუზეუმ') || cat.includes('ეკლესი') || cat.includes('ციხე') || cat.includes('ტაძარ');
    }

    if (catKey === 'food') {
      return group === 'food' || cat.includes('კვება') || cat.includes('კაფე') || cat.includes('რესტორან');
    }

    if (catKey === 'nature') {
      return group === 'nature' || cat.includes('ბუნებ') || cat.includes('ხედ') || cat.includes('პარკ');
    }

    return false;
  }

  private matchesLocationStrict(place: CsvPlace, locName: string, isRegion: boolean): boolean {
    const locStem = locName.toLowerCase().replace(/ი$/, '');
    const simpleLocStem = toSimpleLatin(locStem);

    const placeName = (place.name || '').toLowerCase();
    const placeDesc = (place.description || '').toLowerCase();
    const placeRegion = (place.region || '').toLowerCase();
    const placeTags = Array.isArray(place.tags) ? place.tags.join(' ').toLowerCase() : String(place.tags || '').toLowerCase();

    return placeName.includes(locStem) ||
           placeDesc.includes(locStem) ||
           placeRegion.includes(locStem) ||
           placeTags.includes(locStem) ||
           toSimpleLatin(placeName).includes(simpleLocStem) ||
           toSimpleLatin(placeRegion).includes(simpleLocStem);
  }

  private generateQuickSuggestions(intent: SearchIntent, results: CsvPlace[]): string[] {
    if (results.length === 0) {
      return [
        '🌊 ზღვა / Sea',
        '🌊 კანიონები / Canyons',
        '🏔️ მთები / Mountains',
        '🌲 ბუნება / Nature'
      ];
    }

    const suggestions: string[] = [];
    results.forEach(p => {
      if (p.name && suggestions.length < 3) {
        suggestions.push(`📍 ${p.name}`);
      }
    });

    if (intent.location) {
      suggestions.push(`📍 ${intent.location}`);
    } else {
      suggestions.push('🌲 ბუნება / Nature');
    }

    return suggestions;
  }

  private buildBotResponseText(intent: SearchIntent, matchCount: number): string {
    const isGeo = this.langService.isGeo();
    const isRus = this.langService.isRus();

    if (matchCount === 0) {
      if (intent.type === 'specific-place') {
        if (isGeo) return 'სამწუხაროდ, ამ სახელით ადგილი ვერ ვიპოვე.';
        if (isRus) return 'К сожалению, место с таким названием не найдено.';
        return 'Sorry, no place found with that name.';
      }

      if (isGeo) return 'სამწუხაროდ, ამ კატეგორიის ადგილები ვერ ვიპოვე.';
      if (isRus) return 'К сожалению, места в этой категории не найдены.';
      return 'Sorry, no places found in this category.';
    }

    if (intent.type === 'specific-place') {
      if (isGeo) return `📍 აი, თქვენ მიერ მოძებნილი ადგილი (${intent.placeName}):`;
      if (isRus) return `📍 Вот найденное место (${intent.placeName}):`;
      return `📍 Here is the place you requested (${intent.placeName}):`;
    }

    if (intent.type === 'category') {
      if (intent.category === 'sea') {
        if (isGeo) return `🌊 ზღვის ადგილები ვიპოვე:`;
        if (isRus) return `🌊 Найдены места у моря:`;
        return `🌊 Found sea & beach places:`;
      }
      if (intent.category === 'mountain') {
        if (isGeo) return `🏔️ მთის ადგილები ვიპოვე:`;
        if (isRus) return `🏔️ Найдены горные места:`;
        return `🏔️ Found mountain places:`;
      }
      if (intent.category === 'canyon') {
        if (isGeo) return `🌊 კანიონები ვიპოვე:`;
        if (isRus) return `🌊 Найдены каньоны:`;
        return `🌊 Found canyons:`;
      }
      if (intent.category === 'waterfall') {
        if (isGeo) return `🌊 ჩანჩქერები ვიპოვე:`;
        if (isRus) return `🌊 Найдены водопады:`;
        return `🌊 Found waterfalls:`;
      }
    }

    const locLabel = intent.location ? ` (${intent.location})` : '';

    if (isGeo) {
      return `🌿 შესანიშნავი არჩევანია!\nვიპოვე ${matchCount} ადგილი${locLabel}:`;
    } else if (isRus) {
      return `🌿 Отличный выбор!\nЯ нашел ${matchCount} мест${locLabel}:`;
    } else {
      return `🌿 Great choice!\nI found ${matchCount} place(s)${locLabel}:`;
    }
  }
}
