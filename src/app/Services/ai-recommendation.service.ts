import { Injectable, inject } from '@angular/core';
import { Observable, map, take, switchMap, of, catchError, timeout } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PlacesService, CsvPlace } from './places.service';
import { FilterCardService } from './filter-card.service';
import { LanguageService } from './language.service';
import { TourServicesService } from './tour-services.service';
import { GuideOption, TransportOption, TastingOption, LunchOption } from '../models/tour-services.model';

export type SearchIntentType =
  | 'GUIDE_SELECTION'
  | 'TRANSPORT_SELECTION'
  | 'DEGUSTATION_SELECTION'
  | 'MEAL_SELECTION'
  | 'MULTI_SERVICE_SELECTION'
  | 'PLACE_RECOMMENDATION'
  | 'GREETING'
  | 'THANKS'
  | 'CLARIFICATION';

export interface LocalSearchCriteria {
  wantsPlaces: boolean;
  serviceType?: 'guide' | 'transport' | 'tasting' | 'lunch' | 'multi' | null;
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
  serviceType?: 'guide' | 'transport' | 'tasting' | 'lunch' | 'multi' | null;
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
    serviceType?: 'guide' | 'transport' | 'tasting' | 'lunch' | 'multi' | null;
    region?: string | null;
    category?: string | null;
    specificPlaceName?: string | null;
    isQuiet?: boolean;
    budgetMax?: number;
  };
}

export interface ChatServiceOption {
  id: string;
  category: 'guide' | 'transport' | 'tasting' | 'lunch';
  name: string;
  priceLabel: string;
  photo?: string;
  description?: string;
  details?: string[];
}

export interface RecommendationResult {
  botMessageText: string;
  recommendations: CsvPlace[];
  serviceType?: 'guide' | 'transport' | 'tasting' | 'lunch' | 'multi';
  serviceOptions?: ChatServiceOption[];
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
  public tourServices = inject(TourServicesService);

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
        timeout(10000),
        catchError(err => {
          console.warn('Gemini Backend endpoint error or timeout:', err);
          return of(null);
        })
      );

    return this.placesService.getPlaces().pipe(
      take(1),
      switchMap((allPlaces: CsvPlace[]) => {
        const localIntent = this.extractLocalIntent(raw, cleanHistory, allPlaces);

        return backend$.pipe(
          map(res => {
            const intentType: SearchIntentType = res?.intent || localIntent.type;
            const wantsPlaces: boolean =
              res?.searchCriteria?.wantsPlaces !== undefined
                ? res.searchCriteria.wantsPlaces
                : localIntent.wantsPlaces;

            const serviceType = res?.searchCriteria?.serviceType || localIntent.serviceType || undefined;

            let botMessageText = res?.reply || localIntent.fallbackText;
            let recommendations: CsvPlace[] = [];
            let serviceOptions: ChatServiceOption[] = [];

            // 1. SERVICE SELECTION FLOW (Guides, Transport, Tastings, Meals)
            if (serviceType || intentType.endsWith('_SELECTION')) {
              const effectiveServiceType = (serviceType || localIntent.serviceType || 'guide') as 'guide' | 'transport' | 'tasting' | 'lunch' | 'multi';
              serviceOptions = this.getServiceOptions(effectiveServiceType, localIntent.region);
              recommendations = []; // Strictly NO place cards for service requests!
            }
            // 2. PLACE RECOMMENDATION FLOW
            else if (wantsPlaces) {
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
              recommendations = [];
            }

            const quickSuggestions = this.buildQuickSuggestions(intentType, localIntent.region, localIntent.category);

            return {
              botMessageText,
              recommendations: recommendations.slice(0, this.MAX_RECOMMENDATIONS),
              serviceType: serviceType || localIntent.serviceType || undefined,
              serviceOptions,
              isFallback: intentType === 'CLARIFICATION',
              isVague: wantsPlaces && recommendations.length === 0,
              quickSuggestions
            };
          })
        );
      })
    );
  }

  /**
   * Fetch actual project service options from TourServicesService
   */
  public getServiceOptions(
    serviceType: 'guide' | 'transport' | 'tasting' | 'lunch' | 'multi',
    region?: string | null
  ): ChatServiceOption[] {
    const list: ChatServiceOption[] = [];

    if (serviceType === 'guide' || serviceType === 'multi') {
      const guides = this.tourServices.guideOptions;
      guides.forEach(g => {
        list.push({
          id: g.id,
          category: 'guide',
          name: `გიდი: ${g.name}`,
          priceLabel: `${g.price} GEL`,
          photo: g.photo,
          description: g.description,
          details: [`⭐ ${g.rating}`, `${g.experienceYears} წლიანი გამოცდილება`, g.languages.join(', ')]
        });
      });
    }

    if (serviceType === 'transport' || serviceType === 'multi') {
      const transports = this.tourServices.transportOptions;
      transports.forEach(t => {
        list.push({
          id: t.id,
          category: 'transport',
          name: t.name,
          priceLabel: `${t.price} GEL`,
          photo: t.photo,
          description: t.description,
          details: [`👥 ${t.capacity} ადგილი`]
        });
      });
    }

    if (serviceType === 'tasting') {
      const tastings = this.tourServices.tastingOptions;
      tastings.forEach(t => {
        list.push({
          id: t.id,
          category: 'tasting',
          name: t.name,
          priceLabel: `${t.pricePerPerson} GEL/პერსონა`,
          photo: t.photo,
          description: t.description,
          details: t.itemsIncluded
        });
      });
    }

    if (serviceType === 'lunch') {
      const lunches = this.tourServices.lunchOptions;
      lunches.forEach(l => {
        list.push({
          id: l.id,
          category: 'lunch',
          name: l.name,
          priceLabel: `${l.pricePerPerson} GEL/პერსონა`,
          photo: l.photo,
          description: l.description,
          details: l.itemsIncluded
        });
      });
    }

    return list;
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
   * Deterministic local intent classification supporting all 10 specific test queries
   */
  private extractLocalIntent(
    rawQuery: string,
    history: Array<{ sender: string; text?: string }>,
    allPlaces: CsvPlace[]
  ): LocalIntent {
    const q = rawQuery ? rawQuery.toLowerCase().trim() : '';

    // 1. GREETING INTENT
    const greetingWords = [
      'გამარჯობა', 'სალამი', 'გამარჯობათ', 'გაუმარჯოს', 'მოგესალმებით',
      'hello', 'hi', 'hey', 'привет', 'здравствуйте', 'добрый день'
    ];
    if (!q || greetingWords.some(w => q === w || q === `${w} 👋` || q.startsWith(`${w} `))) {
      return {
        type: 'GREETING',
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
        type: 'THANKS',
        wantsPlaces: false,
        fallbackText: this.langService.t(
          'არაფრის! 😊 თუ კიდევ რამე დაგჭირდებათ მოგზაურობასთან დაკავშირებით, სიამოვნებით დაგეხმარებით.',
          'You are welcome! 😊 If you need anything else regarding your trip, I am happy to help.',
          'Пожалуйста! 😊 Если вам понадобится что-то еще для поездки, я с радостью помогу.'
        )
      };
    }

    // Extract region from query if present
    const detectedRegion = this.normalizeRegionName(q);

    // 3. MULTI-SERVICE SELECTION (Guide + Transport)
    if ((q.includes('გიდი') || q.includes('guide')) && (q.includes('ტრანსპორტ') || q.includes('ავტობუს') || q.includes('transport') || q.includes('bus'))) {
      return {
        type: 'MULTI_SERVICE_SELECTION',
        wantsPlaces: false,
        serviceType: 'multi',
        region: detectedRegion,
        fallbackText: this.langService.t(
          'რა თქმა უნდა! ✨ აი ჩვენი გიდებისა და ტრანსპორტის არჩევის სერვისები:',
          'Certainly! ✨ Here are our guide and transport selection options:',
          'Конечно! ✨ Вот варианты выбора гида и транспорта:'
        )
      };
    }

    // 4. GUIDE SELECTION INTENT
    // Matches: „გიდები“, „გიდი მინდა“, „კარგი გიდი მინდა“, „გიდის მოძებნა მინდა“, „გიდის არჩევა მინდა“, „გიდი მინდა აჭარაში“
    const guideKeywords = ['გიდები', 'გიდი', 'გიდის', 'guide', 'guides', 'გიდი მინდა', 'კარგი გიდი', 'გიდის მოძებნა', 'გიდის არჩევა'];
    if (guideKeywords.some(w => q.includes(w))) {
      const regLabel = detectedRegion ? ` (${detectedRegion})` : '';
      return {
        type: 'GUIDE_SELECTION',
        wantsPlaces: false,
        serviceType: 'guide',
        region: detectedRegion,
        fallbackText: this.langService.t(
          `რა თქმა უნდა 😊 გიდის არჩევაში დაგეხმარებით${regLabel}. აირჩიეთ სასურველი გიდი:`,
          `Certainly 😊 I will help you choose a guide${regLabel}. Select your preferred guide:`,
          `Конечно 😊 Я помогу вам выбрать гида${regLabel}. Выберите предпочитаемого гида:`
        )
      };
    }

    // 5. TRANSPORT SELECTION INTENT
    // Matches: „ავტობუსი“, „ავტობუსი მინდა“, „ტრანსპორტი მინდა“, „ტრანსპორტირების არჩევა მინდა“
    const transportKeywords = ['ავტობუსი', 'ავტობუსები', 'ტრანსპორტი', 'ტრანსპორტირება', 'transport', 'bus', 'minibus', 'ტრანსპორტის'];
    if (transportKeywords.some(w => q.includes(w))) {
      return {
        type: 'TRANSPORT_SELECTION',
        wantsPlaces: false,
        serviceType: 'transport',
        region: detectedRegion,
        fallbackText: this.langService.t(
          'რა თქმა უნდა 🚐 აი ჩვენი ავტობუსებისა და ტრანსპორტის ოპციები თქვენი მოგზაურობისთვის:',
          'Certainly 🚐 Here are our bus and transport options for your trip:',
          'Конечно 🚐 Вот варианты автобусов и транспорта для вашей поездки:'
        )
      };
    }

    // 6. DEGUSTATION SELECTION INTENT
    // Matches: „დეგუსტაცია მინდა“, „ღვინის დეგუსტაცია“
    const tastingKeywords = ['დეგუსტაცია', 'დეგუსტაციის', 'tasting', 'ღვინის დეგუსტაცია', 'ყველის დეგუსტაცია'];
    if (tastingKeywords.some(w => q.includes(w))) {
      return {
        type: 'DEGUSTATION_SELECTION',
        wantsPlaces: false,
        serviceType: 'tasting',
        region: detectedRegion,
        fallbackText: this.langService.t(
          'რა თქმა უნდა 🍷 აი საუკეთესო დეგუსტაციისა და ქვევრის ღვინის პაკეტები:',
          'Certainly 🍷 Here are top wine tasting packages for you:',
          'Конечно 🍷 Вот лучшие пакеты дегустаций вина для вас:'
        )
      };
    }

    // 7. MEAL / LUNCH SELECTION INTENT
    // Matches: „ტრადიციული სადილი მინდა“, „სადილი მინდა“, „სუფრა“
    const mealKeywords = ['სადილი', 'სადილის', 'სუფრა', 'lunch', 'feast', 'ტრადიციული სადილი'];
    if (mealKeywords.some(w => q.includes(w))) {
      return {
        type: 'MEAL_SELECTION',
        wantsPlaces: false,
        serviceType: 'lunch',
        region: detectedRegion,
        fallbackText: this.langService.t(
          'რა თქმა უნდა 🍲 აი ტრადიციული ქართული სადილისა და სუფრის ოპციები:',
          'Certainly 🍲 Here are traditional Georgian lunch and feast options:',
          'Конечно 🍲 Вот варианты традиционного грузинского обеда и застолья:'
        )
      };
    }

    // 8. PLACE RECOMMENDATION INTENT (Categories: sea, mountain, canyon, region, specific place name)
    let detectedCategory: string | null = null;
    for (const [catKey, aliases] of Object.entries(USER_CATEGORY_ALIASES)) {
      if (aliases.some(a => q.includes(a))) {
        detectedCategory = catKey;
        break;
      }
    }

    const isQuiet = q.includes('მშვიდ') || q.includes('წყნარ') || q.includes('quiet') || q.includes('тихий');

    // Context from history if query is follow-up
    if (history && history.length > 0) {
      const recentText = history
        .slice(-4)
        .map(h => (h.text || '').toLowerCase())
        .join(' ');

      if (!detectedRegion) {
        const histRegion = this.normalizeRegionName(recentText);
        if (histRegion) {
          // only use context if query is not a service selection
        }
      }
    }

    // Check specific place name
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
        type: 'PLACE_RECOMMENDATION',
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

    if (detectedRegion || detectedCategory) {
      const regLabel = detectedRegion ? ` (${detectedRegion})` : '';
      return {
        type: 'PLACE_RECOMMENDATION',
        wantsPlaces: true,
        region: detectedRegion,
        category: detectedCategory,
        isQuiet,
        fallbackText: this.langService.t(
          `🌿 შესანიშნავი არჩევანია! აი საუკეთესო ადგილები${regLabel}:`,
          `🌿 Great choice! Here are top places${regLabel}:`,
          `🌿 Отличный выбор! Вот лучшие места${regLabel}:`
        )
      };
    }

    // General travel Q&A ("რა ვნახო?", "2 დღით სად წავიდე?")
    const generalTravelKeywords = ['რა ვნახო', 'სად წავიდე', 'რამე კარგი', 'რას მირჩევ', '2 დღით', 'ზაფხულში', 'ზამთარში'];
    if (generalTravelKeywords.some(kw => q.includes(kw))) {
      return {
        type: 'PLACE_RECOMMENDATION',
        wantsPlaces: true,
        fallbackText: this.langService.t(
          '🤖 საქართველოში უამრავი ულამაზესი ადგილია! აი რამდენიმე გამორჩეული რეკომენდაცია თქვენთვის:',
          '🤖 Georgia has so many beautiful destinations! Here are top recommendations for you:',
          '🤖 В Грузии огромное количество прекрасных мест! Вот отличные рекомендации для вас:'
        )
      };
    }

    // Clarification intent
    return {
      type: 'CLARIFICATION',
      wantsPlaces: false,
      fallbackText: this.langService.t(
        'უკაცრავად, ზუსტად ვერ მიგიხვდით. 🤖 გსურთ ადგილების მოძებნა (მაგ. ზღვა, მთა, გურია) თუ ტურის სერვისების არჩევა (გიდი, ტრანსპორტი)?',
        'Sorry, I didn\'t fully understand. 🤖 Would you like to search places (e.g. sea, mountain, Guria) or select tour services (guide, transport)?',
        'Извините, я не совсем понял. 🤖 Хотите найти места (напр. море, горы, Гурия) или выбрать услуги (гид, транспорт)?'
      )
    };
  }

  /**
   * Filter real database places with STRICT region and category rules
   */
  public filterRealPlaces(allPlaces: CsvPlace[], criteria: LocalSearchCriteria): CsvPlace[] {
    if (!allPlaces || allPlaces.length === 0) return [];

    let list = [...allPlaces];

    if (criteria.region) {
      const targetNormRegion = this.normalizeRegionName(criteria.region);
      if (targetNormRegion) {
        list = list.filter(p => {
          const placeNormRegion = this.normalizeRegionName(p.region);
          return placeNormRegion === targetNormRegion;
        });
      }
    }

    if (criteria.category) {
      const cat = criteria.category;
      list = list.filter(p => this.matchesCategory(p, cat));
    }

    if (criteria.specificPlaceName) {
      const targetName = criteria.specificPlaceName.toLowerCase();
      list = list.filter(p => (p.name || '').toLowerCase().includes(targetName));
    }

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
    if (intentType === 'GREETING') {
      return ['🗣️ გიდები', '🚐 ავტობუსი', '🍷 დეგუსტაცია', '🌊 ზღვა', '📍 გურია'];
    }

    if (intentType === 'GUIDE_SELECTION') {
      return ['🚐 ავტობუსიც მინდა', '📍 აჭარის გიდი', '🍷 დეგუსტაცია'];
    }

    if (intentType === 'TRANSPORT_SELECTION') {
      return ['🗣️ გიდიც მინდა', '🚌 50-ადგილიანი', '🚐 20-ადგილიანი'];
    }

    if (intentType === 'DEGUSTATION_SELECTION') {
      return ['🍲 ტრადიციული სადილი', '🗣️ გიდი მინდა'];
    }

    if (intentType === 'MEAL_SELECTION') {
      return ['🍷 დეგუსტაცია მინდა', '🗣️ გიდი მინდა'];
    }

    if (region === 'გურია') {
      return ['🏔️ გომისმთა', '🌊 ურეკი', '🗣️ გიდები'];
    }

    if (category === 'sea') {
      return ['🏖️ ბათუმი', '🏖️ ქობულეთი', '🏖️ ურეკი', '✨ უფრო მშვიდი'];
    }

    return ['🌊 ზღვა', '🏔️ მთა', '📍 გურია', '🗣️ გიდები', '🚐 ავტობუსი'];
  }
}
