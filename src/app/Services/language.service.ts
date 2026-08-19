import { Injectable, signal, computed } from '@angular/core';

export type Language = 'geo' | 'eng';

const TRANSLATION_MAP: Record<string, string> = {
  // Hero section
  'აღმოაჩინე': 'Discover',
  'საქართველო': 'Georgia',
  'ადგილობრივი ლოკაციები, ღონისძიებები, გამოცდილებები და ის ადგილები, რომლებიც სხვა პლატფორმებზე თითქმის არ ჩანს.':
    'Local spots, events, experiences, and hidden gems rarely found on other platforms.',
  '+ 500': '+ 500',
  'ლოკაცია': 'Locations',
  '+ 100': '+ 100',
  'ღონისძიება': 'Events',
  '+ 300': '+ 300',
  'ადგილობრივის რჩევა': 'Local Advice',

  // Navigation & Quick Filters
  'ადგილის ძებნა': 'Find Place',
  'ღონისძიებები': 'Events',
  'გამოცდილებები': 'Experiences',
  'რეკომენდაციები': 'Recommendations',
  'ტრადიცია': 'Traditions',
  'ყველა': 'All',
  'ბუნება': 'Nature',
  'დასვენება': 'Leisure',
  'კულტურა': 'Culture',
  'კვება': 'Food',
  'დამატებითი ფილტრაცია': 'More Filters',
  'ყველა ბუნება (All Nature)': 'All Nature',
  'ყველა რეგიონი (All Regions)': 'All Regions',
  'ეტლით მისასვლელი': 'Wheelchair Accessible',
  'გასუფთავება': 'Clear Filters',
  'დაჯავშნე': 'Book Now',
  'უფასო': 'Free',
  'ფასიანი': 'Paid',
  'რუკით ძიება': 'Search on Map',

  // Select dropdown options
  'ჩანჩქერი': 'Waterfall',
  'კანიონი': 'Canyon',
  'მღვიმე': 'Cave',
  'ტბა': 'Lake',
  'მდინარე': 'River',
  'მთა': 'Mountain',
  'ტყე': 'Forest',
  'ეროვნული პარკი': 'National Park',
  'დაცული ტერიტორია': 'Protected Area',
  'ხეობა': 'Valley',
  'ზღვის სანაპირო': 'Sea Coast',
  'ბუნებრივი წყარო': 'Natural Spring',
  'პარკი': 'Park',
  'ბიბლიოთეკა': 'Library',
  'კაფე': 'Cafe',
  'ისტორიული ადგილი': 'Historical Site',
  'სწრაფი კვება': 'Fast Food',
  'ხედი': 'Scenic View',
  'ღირსშესანიშნაობა': 'Attraction',
  'რესტორანი': 'Restaurant',
  'მუზეუმი': 'Museum',
  'არქეოლოგიური ძეგლი': 'Archaeological Site',
  'ზოოპარკი': 'Zoo',
  'ველობილიკი': 'Bike Path',

  // Regions
  'აჭარა': 'Adjara',
  'გურია': 'Guria',
  'იმერეთი': 'Imereti',
  'კახეთი': 'Kakheti',
  'მცხეთა-მთიანეთი': 'Mtskheta-Mtianeti',
  'რაჭა-ლეჩხუმი და ქვემო სვანეთი': 'Racha-Lechkhumi & Kvemo Svaneti',
  'რაჭა-ლეჩხუმი': 'Racha-Lechkhumi',
  'რაჭა': 'Racha',
  'სამეგრელო-ზემო სვანეთი': 'Samegrelo-Zemo Svaneti',
  'სამეგრელო': 'Samegrelo',
  'სვანეთი': 'Svaneti',
  'სამცხე-ჯავახეთი': 'Samtskhe-Javakheti',
  'ქვემო ქართლი': 'Kvemo Kartli',
  'შიდა ქართლი': 'Shida Kartli',
  'თბილისი': 'Tbilisi',

  // Tags
  'ერთდღიანი': 'One-day',
  'კლდეები': 'Rocks',
  'ოჯახური': 'Family',
  'პიკნიკი': 'Picnic',
  'სტუდენტური': 'Student',
  'სამუშაო სივრცე': 'Work Space',
  'არქიტექტურა': 'Architecture',
  'XI საუკუნე': '11th Century',

  // Specific Titles requested
  'ბათუმის სტრიტ-ფუდის კუთხე': 'Batumi Street Food Corner',
  'ბირთვისის კანიონი': 'Birtvisi Canyon',
  'დედაენის ბაღი': 'Dedaena Park',
  'ეროვნული ბიბლიოთეკა': 'National Library',
  'კაფე „ჩაი და ჩურჩხელა“': 'Cafe "Tea and Churchkhela"',
  'ნიკორწმინდის ტაძარი': 'Nikortsminda Cathedral',
  'დალიდაღი': 'Dalidaghi',

  // Descriptions requested
  'აჭარული ხაჭაპური და კუბდარი ერთ ქუჩაზე.': 'Adjarian Khachapuri and Kubdari on one street.',
  'კლდოვანი ლაბირინთი თბილისიდან ერთ საათში.': 'Rocky labyrinth one hour from Tbilisi.',
  'მდინარისპირა პარკი სასეირნო ბილიკებითა და ბავშვთა სივრცით.': 'Riverside park with walking paths and children\'s area.',
  'სამკითხველო დარბაზები და ეზო ქალაქის ცენტრში.': 'Reading halls and courtyard in the city center.',
  'პატარა კაფე ცენტრალურ ბაზართან, ადგილობრივი დესერტებით.': 'Small cafe near the central market with local desserts.',
  'ქვის რელიეფებით დაფარული ტაძარი რაჭის მთებში.': 'Cathedral covered in stone reliefs in the mountains of Racha.',
  'მწვერვალი — ქვემო ქართლი.': 'Peak — Kvemo Kartli.'
};

const GEO_TO_ENG_CHAR_MAP: Record<string, string> = {
  'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v', 'ზ': 'z',
  'თ': 't', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm', 'ნ': 'n', 'ო': 'o',
  'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's', 'ტ': 't', 'უ': 'u', 'ფ': 'p',
  'ქ': 'k', 'ღ': 'gh', 'ყ': 'k', 'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz',
  'წ': 'ts', 'ჭ': 'ch', 'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h'
};

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

  translate(text: string): string {
    if (!text) return '';
    if (this.isGeo()) return text; // Keep exact Georgian text when Georgian language is active

    const trimmed = text.trim();
    if (TRANSLATION_MAP[trimmed]) {
      return TRANSLATION_MAP[trimmed];
    }

    // Replace known dictionary substrings
    let result = text;
    for (const [geoKey, engVal] of Object.entries(TRANSLATION_MAP)) {
      if (geoKey.length > 2 && result.includes(geoKey)) {
        result = result.replaceAll(geoKey, engVal);
      }
    }

    // If still contains Georgian letters, transliterate remaining Georgian characters
    if (/[\u10A0-\u10FF]/.test(result)) {
      result = result.split('').map(ch => GEO_TO_ENG_CHAR_MAP[ch] || ch).join('');
    }

    return result;
  }
}
