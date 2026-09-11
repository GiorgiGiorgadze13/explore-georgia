import { Injectable, inject } from '@angular/core';
import { Observable, map, take, switchMap, of, catchError, timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PlacesService, CsvPlace } from './places.service';
import { FilterCardService, toSimpleLatin } from './filter-card.service';
import { LanguageService } from './language.service';

export type SearchIntentType =
  | 'greeting'
  | 'thanks'
  | 'guide_service'
  | 'general_qa'
  | 'place_search'
  | 'clarification';

export interface LocalSearchCriteria {
  wantsPlaces: boolean;
  region?: string | null;
  category?: string | null;
  specificPlaceName?: string | null;
  isQuiet?: boolean;
  keywords?: string[];
  budgetMax?: number;
}

export interface LocalIntent {
  type: SearchIntentType;
  wantsPlaces: boolean;
  region?: string | null;
  category?: string | null;
  specificPlaceName?: string | null;
  isQuiet?: boolean;
  keywords?: string[];
  fallbackText: string;
}

export interface BackendChatResponse {
  reply?: string;
  intent?: SearchIntentType;
  searchCriteria?: {
    wantsPlaces?: boolean;
    region?: string | null;
    category?: string | null;
    specificPlaceName?: string | null;
    isQuiet?: boolean;
    budgetMax?: number;
  };
}

export interface RecommendationResult {
  botMessageText: string;
  recommendations: CsvPlace[];
  isFallback: boolean;
  isVague: boolean;
  quickSuggestions?: string[];
}

export const USER_CATEGORY_ALIASES: Record<string, string[]> = {
  sea: ['ზღვა', 'ზღვის', 'ზღვაზე', 'ზღვასთან', 'ზღვი', 'ზღვას', 'ზღვაა', 'ზღვები', 'ზღვებს', 'ზღვისკენ', 'ზღვაში', 'პლაჟი', 'პლაჟები', 'პლაჟზე', 'სანაპირო', 'სანაპიროზე', 'ზღვისპირა', 'sea', 'beach', 'coast', 'море', 'пляж'],
  mountain: ['მთა', 'მთები', 'მთაში', 'მთაზე', 'მთის', 'მწვერვალი', 'mountain', 'mountains', 'горы', 'гора'],
  river: ['მდინარე', 'მდინარეები', 'მდინარეში', 'მდინარესთან', 'მდინარის', 'river', 'rivers', 'река'],
  canyon: ['კანიონი', 'კანიონები', 'კანიონში', 'canyon', 'canyons', 'каньон', 'каньоны'],
  waterfall: ['ჩანჩქერი', 'ჩანჩქერები', 'ჩანჩქერში', 'waterfall', 'waterfalls', 'водопад'],
  lake: ['ტბა', 'ტბები', 'ტბაში', 'ტბაზე', 'ტბის', 'lake', 'lakes', 'озеро'],
  cave: ['მღვიმე', 'გამოქვაბული', 'მღვიმეში', 'cave', 'caves', 'пещера'],
  forest: ['ტყე', 'ტყეში', 'forest', 'лес'],
  nature: ['ბუნება', 'ბუნების', 'ბუნებაში', 'პარკი', 'ხედი', 'nature', 'природа'],
  culture: ['ისტორიული', 'ტაძარი', 'ეკლესია', 'ციხე', 'მუზეუმი', 'არქიტექტურა', 'culture', 'history', 'historical', 'культура'],
  food: ['ღვინო', 'მარანი', 'რესტორანი', 'კაფე', 'კვება', 'დესერტი', 'ხაჭაპური', 'food', 'wine', 'restaurant', 'ресторан', 'вино']
};

@Injectable({
  providedIn: 'root'
})
export class AiRecommendationService {
  private http = inject(HttpClient);
  private placesService = inject(PlacesService);
  private filterService = inject(FilterCardService);
  private langService = inject(LanguageService);

  private readonly MAX_RECOMMENDATIONS = 5;

  getRecommendations(
    userQuery: string,
    history: Array<{ sender: string; text?: string }> = []
  ): Observable<RecommendationResult> {
    const raw = userQuery ? userQuery.trim() : '';

    const cleanHistory = history
      .filter(m => m.text)
      .map(m => ({ sender: m.sender, text: m.text }));

    const backend$ = this.http
      .post<BackendChatResponse>('/api/chat', {
        message: raw,
        history: cleanHistory
      })
      .pipe(
        timeout(12000),
        catchError(err => {
          console.warn('Gemini Backend endpoint error or timeout:', err);
          return of(null);
        })
      );

    return this.placesService.getPlaces().pipe(
      take(1),
      switchMap((allPlaces: CsvPlace[]) => {
        // Evaluate local intent deterministically as fallback or validation
        const localIntent = this.extractLocalIntent(raw, cleanHistory, allPlaces);

        return backend$.pipe(
          map(res => {
            const intentType: SearchIntentType = res?.intent || localIntent.type;
            const wantsPlaces: boolean =
              res?.searchCriteria?.wantsPlaces !== undefined
                ? res.searchCriteria.wantsPlaces
                : localIntent.wantsPlaces;

            let botMessageText = res?.reply || localIntent.fallbackText;
            let recommendations: CsvPlace[] = [];

            if (wantsPlaces) {
              const region = res?.searchCriteria?.region || localIntent.region;
              const category = res?.searchCriteria?.category || localIntent.category;
              const placeName = res?.searchCriteria?.specificPlaceName || localIntent.specificPlaceName;
              const isQuiet = res?.searchCriteria?.isQuiet || localIntent.isQuiet;

              const criteria: LocalSearchCriteria = {
                wantsPlaces: true,
                region,
                category,
                specificPlaceName: placeName,
                isQuiet,
                keywords: localIntent.keywords
              };

              recommendations = this.filterRealPlaces(allPlaces, criteria);

              // Requirement 11: If user requested places but none match in DB, NEVER return random fallback places!
              if (recommendations.length === 0 && (region || category || placeName)) {
                const noMatchNotice = this.langService.t(
                  'ამ მოთხოვნისთვის შესაბამისი ადგილები ვერ ვიპოვე. გინდა სხვა რეგიონი ან კატეგორია ვცადოთ?',
                  'I could not find matching places for this request. Would you like to try another region or category?',
                  'Я не нашел подходящих мест по этому запросу. Хотите попробовать другой регион или категорию?'
                );
                if (!botMessageText.includes('ვერ ვიპოვე') && !botMessageText.includes('не нашел')) {
                  botMessageText = `${botMessageText}\n\n${noMatchNotice}`;
                }
              }
            } else {
              // Strictly NO cards when cards aren't appropriate
              recommendations = [];
            }

            const quickSuggestions = this.buildQuickSuggestions(intentType, localIntent.region, localIntent.category);

            return {
              botMessageText,
              recommendations: recommendations.slice(0, this.MAX_RECOMMENDATIONS),
              isFallback: intentType === 'general_qa' || intentType === 'clarification',
              isVague: wantsPlaces && recommendations.length === 0,
              quickSuggestions
            };
          })
        );
      })
    );
  }

  /**
   * Strictly normalizes Georgian region names to match CSV region strings
   */
  public normalizeRegionName(input?: string | null): string | null {
    if (!input) return null;
    const s = input.toLowerCase().trim();

    if (s.includes('გური') || s.includes('guria')) return 'გურია';
    if (s.includes('აჭარ') || s.includes('adjara') || s.includes('ბათუმ') || s.includes('ქობულეთ') || s.includes('ურეკ')) return 'აჭარა';
    if (s.includes('სამეგრელ') || s.includes('samegrelo') || s.includes('მარტვილ') || s.includes('ზუგდიდ') || s.includes('ანაკლი')) return 'სამეგრელო';
    if (s.includes('იმერეთ') || s.includes('imereti') || s.includes('ქუთაის') || s.includes('წყალტუბო') || s.includes('ხონი')) return 'იმერეთი';
    if (s.includes('კახეთ') || s.includes('kakheti') || s.includes('თელავ') || s.includes('სიღნაღ')) return 'კახეთი';
    if (s.includes('სვანეთ') || s.includes('svaneti') || s.includes('მესტი')) return 'სვანეთი';
    if (s.includes('რაჭ') || s.includes('racha')) return 'რაჭა-ლეჩხუმი';
    if (s.includes('თბილის') || s.includes('tbilisi')) return 'თბილისი';
    if (s.includes('მცხეთ') || s.includes('ყაზბეგ') || s.includes('სტეფანწმინდა') || s.includes('mtskheta') || s.includes('kazbegi')) return 'მცხეთა-მთიანეთი';
    if (s.includes('სამცხ') || s.includes('ჯავახეთ') || s.includes('ბორჯომ') || s.includes('samtskhe') || s.includes('borjomi')) return 'სამცხე-ჯავახეთი';
    if (s.includes('ქვემო ქართლ') || s.includes('kvemo kartli')) return 'ქვემო ქართლი';
    if (s.includes('შიდა ქართლ') || s.includes('shida kartli') || s.includes('გორ')) return 'შიდა ქართლი';
    if (s.includes('აფხაზეთ') || s.includes('abkhazia')) return 'აფხაზეთი';

    return null;
  }

  /**
   * Deterministic local intent classification and context extractor
   */
  private extractLocalIntent(
    rawQuery: string,
    history: Array<{ sender: string; text?: string }>,
    allPlaces: CsvPlace[]
  ): LocalIntent {
    const isGeo = this.langService.isGeo();
    const isRus = this.langService.isRus();
    const q = rawQuery ? rawQuery.toLowerCase().trim() : '';

    // 1. GREETING INTENT
    const greetingWords = [
      'გამარჯობა', 'სალამი', 'გამარჯობათ', 'გაუმარჯოს', 'მოგესალმებით',
      'hello', 'hi', 'hey', 'привет', 'здравствуйте', 'добрый день'
    ];
    if (!q || greetingWords.some(w => q === w || q === `${w} 👋` || q.startsWith(`${w} `))) {
      return {
        type: 'greeting',
        wantsPlaces: false,
        fallbackText: this.langService.t(
          'გამარჯობა! 👋 მე ვარ Explore Georgia-ს AI მოგზაურობის ასისტენტი. რით შემიძლია დაგეხმაროთ?',
          'Hello! 👋 I am Explore Georgia\'s AI Travel Assistant. How can I help you today?',
          'Здравствуйте! 👋 Я ИИ Помощник Explore Georgia. Чем я могу вам помочь?'
        )
      };
    }

    // 2. THANKS INTENT
    const thanksWords = ['მადლობა', 'გმადლობთ', 'didi madloba', 'thank you', 'thanks', 'спасибо'];
    if (thanksWords.some(w => q.includes(w))) {
      return {
        type: 'thanks',
        wantsPlaces: false,
        fallbackText: this.langService.t(
          'არაფრის! 😊 თუ კიდევ რამე დაგჭირდებათ მოგზაურობასთან დაკავშირებით, სიამოვნებით დაგეხმარებით.',
          'You are welcome! 😊 If you need anything else regarding your trip, I am happy to help.',
          'Пожалуйста! 😊 Если вам понадобится что-то еще для поездки, я с радостью помогу.'
        )
      };
    }

    // 3. GUIDE / SERVICE / BOOKING INTENT
    const serviceWords = ['გიდი', 'გიდის', 'გიდები', 'guide', 'guides', 'გიდი მინდა', 'კარგი გიდი', 'ტრანსპორტირება', 'დაჯავშნა', 'გიდს'];
    if (serviceWords.some(w => q.includes(w))) {
      const detectedRegion = this.normalizeRegionName(q);
      if (detectedRegion) {
        return {
          type: 'guide_service',
          wantsPlaces: false,
          region: detectedRegion,
          fallbackText: this.langService.t(
            `რა თქმა უნდა 😊 ${detectedRegion}-ში გიდისა და ტურის სერვისების დასაგეგმად შეგიძლიათ ისარგებლოთ ჩვენი ტურის აწყობის (Tour Builder) ფუნქციონალით ადგილის დეტალების გვერდზე!`,
            `Certainly 😊 To arrange guide and tour services in ${detectedRegion}, you can use our Tour Builder functionality on the place details page!`,
            `Конечно 😊 Для организации услуг гида и туров в ${detectedRegion} вы можете воспользоваться функцией Tour Builder на странице деталей!`
          )
        };
      }

      return {
        type: 'guide_service',
        wantsPlaces: false,
        fallbackText: this.langService.t(
          'რა თქმა უნდა 😊 რომელ რეგიონში ან ქალაქში გსურთ გიდის მოძებნა? მაგალითად, თბილისი, კახეთი, აჭარა, გურია ან სვანეთი.',
          'Certainly 😊 In which region or city would you like to find a guide? For example, Tbilisi, Kakheti, Adjara, Guria, or Svaneti.',
          'Конечно 😊 В каком регионе или городе вы хотите найти гида? Например, Тбилиси, Кахети, Аджария, Гурия или Сванети.'
        )
      };
    }

    // 4. EXTRACT REGION & CATEGORY FROM CURRENT QUERY
    let detectedRegion = this.normalizeRegionName(q);
    let detectedCategory: string | null = null;

    for (const [catKey, aliases] of Object.entries(USER_CATEGORY_ALIASES)) {
      if (aliases.some(a => q.includes(a))) {
        detectedCategory = catKey;
        break;
      }
    }

    // Check for quiet / peaceful request
    const isQuiet = q.includes('მშვიდ') || q.includes('წყნარ') || q.includes('quiet') || q.includes('тихий');

    // 5. EXTRACT CONTEXT FROM HISTORY IF CURRENT QUERY IS SHORT / FOLLOW-UP
    if (history && history.length > 0) {
      const recentText = history
        .slice(-4)
        .map(h => (h.text || '').toLowerCase())
        .join(' ');

      if (!detectedRegion) {
        detectedRegion = this.normalizeRegionName(recentText);
      }
      if (!detectedCategory) {
        for (const [catKey, aliases] of Object.entries(USER_CATEGORY_ALIASES)) {
          if (aliases.some(a => recentText.includes(a))) {
            detectedCategory = catKey;
            break;
          }
        }
      }
    }

    // 6. CHECK FOR SPECIFIC PLACE NAME IN DATABASE
    let matchedPlace: CsvPlace | undefined;
    for (const p of allPlaces) {
      if (p.name && p.name.length > 3) {
        const pNameLower = p.name.toLowerCase();
        if (q.includes(pNameLower) || pNameLower.includes(q)) {
          matchedPlace = p;
          break;
        }
      }
    }

    if (matchedPlace) {
      return {
        type: 'place_search',
        wantsPlaces: true,
        specificPlaceName: matchedPlace.name,
        region: matchedPlace.region,
        fallbackText: this.langService.t(
          `📍 აი, თქვენ მიერ მოძებნილი ადგილი: ${matchedPlace.name} (${matchedPlace.region})`,
          `📍 Here is the place you requested: ${matchedPlace.name} (${matchedPlace.region})`,
          `📍 Вот запрошенное место: ${matchedPlace.name} (${matchedPlace.region})`
        )
      };
    }

    // 7. PLACE SEARCH INTENT WITH REGION / CATEGORY
    if (detectedRegion || detectedCategory) {
      const regLabel = detectedRegion ? ` (${detectedRegion})` : '';
      const catLabel = detectedCategory ? ` [${detectedCategory}]` : '';

      return {
        type: 'place_search',
        wantsPlaces: true,
        region: detectedRegion,
        category: detectedCategory,
        isQuiet,
        fallbackText: this.langService.t(
          `🌿 შესანიშნავი არჩევანია! აი საუკეთესო ადგილები${regLabel}${catLabel}:`,
          `🌿 Great choice! Here are top places${regLabel}${catLabel}:`,
          `🌿 Отличный выбор! Вот лучшие места${regLabel}${catLabel}:`
        )
      };
    }

    // 8. GENERAL TRAVEL QUESTIONS (e.g. "რა ვნახო?", "2 დღით სად წავიდე?", "სად წავიდე ზაფხულში?")
    const generalTravelKeywords = ['რა ვნახო', 'სად წავიდე', 'რამე კარგი', 'რას მირჩევ', '2 დღით', 'ზაფხულში', 'ზამთარში', 'ბუნება', 'ოჯახთან'];
    if (generalTravelKeywords.some(kw => q.includes(kw))) {
      return {
        type: 'general_qa',
        wantsPlaces: true,
        fallbackText: this.langService.t(
          '🤖 საქართველოში უამრავი ულამაზესი ადგილია! აი რამდენიმე გამორჩეული რეკომენდაცია თქვენთვის:',
          '🤖 Georgia has so many beautiful destinations! Here are top recommendations for you:',
          '🤖 В Грузии огромное количество прекрасных мест! Вот отличные рекомендации для вас:'
        )
      };
    }

    // 9. UNKNOWN / CLARIFICATION INTENT
    return {
      type: 'clarification',
      wantsPlaces: false,
      fallbackText: this.langService.t(
        'უკაცრავად, ზუსტად ვერ მიგიხვდით. 🤖 გსურთ ადგილების მოძებნა რეგიონის მიხედვით (მაგ. აჭარა, სვანეთი, გურია) თუ კატეგორიის მიხედვით (ზღვა, მთა, კანიონები)?',
        'Sorry, I didn\'t fully understand. 🤖 Would you like to search places by region (e.g. Adjara, Svaneti, Guria) or category (sea, mountain, canyons)?',
        'Извините, я не совсем понял. 🤖 Хотите найти места по региону (напр. Аджария, Сванети, Гурия) или по категории (море, горы, каньоны)?'
      )
    };
  }

  /**
   * Filter real database places with STRICT region and category rules
   */
  public filterRealPlaces(allPlaces: CsvPlace[], criteria: LocalSearchCriteria): CsvPlace[] {
    if (!allPlaces || allPlaces.length === 0) return [];

    let list = [...allPlaces];

    // STRICT REGION MATCHING
    if (criteria.region) {
      const targetNormRegion = this.normalizeRegionName(criteria.region);
      if (targetNormRegion) {
        list = list.filter(p => {
          const placeNormRegion = this.normalizeRegionName(p.region);
          return placeNormRegion === targetNormRegion;
        });
      }
    }

    // CATEGORY MATCHING
    if (criteria.category) {
      const cat = criteria.category;
      list = list.filter(p => this.matchesCategory(p, cat));
    }

    // SPECIFIC PLACE NAME MATCHING
    if (criteria.specificPlaceName) {
      const targetName = criteria.specificPlaceName.toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(targetName));
    }

    // QUIET MODIFIER MATCHING
    if (criteria.isQuiet) {
      const quietMatches = list.filter(p => {
        const desc = (p.description || '').toLowerCase();
        const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : String(p.tags || '').toLowerCase();
        return desc.includes('მშვიდ') || desc.includes('წყნარ') || desc.includes('ფიჭვნარ') || tags.includes('მშვიდი');
      });
      if (quietMatches.length > 0) {
        list = quietMatches;
      }
    }

    // Sort by rating descending
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }

  private matchesCategory(place: CsvPlace, catKey: string): boolean {
    const cat = (place.category || '').toLowerCase();
    const group = (place.group_key || '').toLowerCase();
    const name = (place.name || '').toLowerCase();
    const tags = Array.isArray(place.tags) ? place.tags.join(' ').toLowerCase() : String(place.tags || '').toLowerCase();
    const desc = (place.description || '').toLowerCase();

    if (catKey === 'sea') {
      return cat.includes('პლაჟ') || cat.includes('სანაპირო') || cat.includes('ზღვა') ||
             tags.includes('ზღვა') || tags.includes('პლაჟ') || tags.includes('sea') || tags.includes('beach') ||
             name.includes('ზღვა') || name.includes('პლაჟ') || name.includes('სანაპირო') ||
             desc.includes('შავი ზღვა') || desc.includes('ზღვის პლაჟი');
    }

    if (catKey === 'mountain') {
      return cat.includes('მთა') || cat.includes('მწვერვალ') || tags.includes('მთა') || tags.includes('მწვერვალი') ||
             name.includes('მთა') || name.includes('მწვერვალი');
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
      return group === 'food' || cat.includes('კვება') || cat.includes('კაფე') || cat.includes('რესტორან') || tags.includes('ღვინო') || name.includes('მარანი');
    }

    if (catKey === 'nature' || catKey === 'forest') {
      return group === 'nature' || cat.includes('ბუნებ') || cat.includes('ხედ') || cat.includes('პარკ') || cat.includes('ტყე');
    }

    return false;
  }

  private buildQuickSuggestions(
    intentType: SearchIntentType,
    region?: string | null,
    category?: string | null
  ): string[] {
    if (intentType === 'greeting') {
      return ['🏔️ მთა', '🌊 ზღვა', '📍 გურია', '✈️ რა ვნახო?'];
    }

    if (intentType === 'thanks') {
      return ['🏔️ მთები', '🌊 ზღვა', '📍 აჭარა'];
    }

    if (intentType === 'guide_service') {
      return ['📍 თბილისი', '📍 აჭარა', '📍 კახეთი', '📍 სვანეთი'];
    }

    if (region === 'გურია') {
      return ['🏔️ გომისმთა', '🌊 ურეკი', '✈️ დაჯავშნა'];
    }

    if (category === 'sea') {
      return ['🏖️ ბათუმი', '🏖️ ქობულეთი', '🏖️ ურეკი', '✨ უფრო მშვიდი'];
    }

    if (category === 'mountain') {
      return ['🏔️ ყაზბეგი', '🏔️ გომისმთა', '🏔️ მესტია'];
    }

    return ['🌊 ზღვა', '🏔️ მთა', '📍 გურია', '✈️ რა ვნახო?'];
  }
}
