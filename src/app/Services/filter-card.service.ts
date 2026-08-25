import { Injectable, signal } from '@angular/core';

export const CATEGORY_MAP: Record<string, string[]> = {
  nature: [
    'nature', 'ბუნება', 'buneba', 'waterfall', 'waterfalls', 'canyon', 'canyons', 'cave', 'caves', 'lake', 'lakes',
    'river', 'rivers', 'mountain', 'mountains', 'forest', 'national-park', 'protected-area', 'valley', 'coast', 'spring',
    'ჩანჩქერი', 'ჩანჩქერები', 'კანიონი', 'კანიონები', 'მღვიმე', 'მღვიმეები', 'გამოქვაბული', 'ტბა', 'ტბები',
    'მდინარე', 'მდინარეები', 'მთა', 'მთები', 'მწვერვალი', 'ტყე', 'ტყეები', 'ეროვნული პარკი', 'ნაკრძალი',
    'დაცული ტერიტორია', 'ხეობა', 'სანაპირო', 'ზღვა', 'წყარო', 'ბუნებრივი წყარო'
  ],
  leisure: [
    'leisure', 'დასვენება', 'dasveneba', 'park', 'coast', 'resort', 'hotel', 'relax', 'beach',
    'პარკი', 'ბაღი', 'სანაპირო', 'ზღვის სანაპირო', 'კურორტი', 'სასტუმრო', 'დასვენება', 'გართობა', 'ატრაქციონი'
  ],
  culture: [
    'culture', 'კულტურა', 'kultura', 'church', 'monastery', 'fortress', 'castle', 'winery', 'wine', 'museum', 'bridge', 'history', 'heritage',
    'ტაძარი', 'ეკლესია', 'მონასტერი', 'ჯვარი', 'ნიში', 'ციხე', 'ციხესიმაგრე', 'კოშკი', 'მარანი', 'ღვინო', 'მუზეუმი', 'ხიდი', 'ისტორია', 'კულტურა'
  ],
  food: [
    'food', 'კვება', 'kveba', 'საკვები', 'რესტორანი', 'კაფე', 'სწრაფი კვება', 'სტრიტ-ფუდი', 'დესერტი', 'მარანი', 'ღვინო', 'ჭამა', 'გასტრონომია'
  ],
  waterfall: ['waterfall', 'waterfalls', 'ჩანჩქერი', 'ჩანჩქერები', 'chanchkeri', 'chanckeri'],
  canyon: ['canyon', 'canyons', 'კანიონი', 'კანიონები', 'kanioni'],
  cave: ['cave', 'caves', 'მღვიმე', 'მღვიამე', 'გამოქვაბული', 'მღვიმეები', 'mghvime', 'mgvime'],
  lake: ['lake', 'lakes', 'ტბა', 'ტბები', 'tba', 'tbebi'],
  river: ['river', 'rivers', 'მდინარე', 'მდინარეები', 'mdinare'],
  mountain: ['mountain', 'mountains', 'მთა', 'მთები', 'მწვერვალი', 'mta'],
  forest: ['forest', 'ტყე', 'ტყეები', 'tye'],
  'national-park': ['national park', 'ეროვნული პარკი', 'ნაკრძალი'],
  'protected-area': ['protected area', 'დაცული ტერიტორია'],
  valley: ['valley', 'ხეობა', 'xeoba'],
  coast: ['coast', 'sea coast', 'ზღვის სანაპირო', 'სანაპირო', 'ზღვა'],
  spring: ['spring', 'natural spring', 'ბუნებრივი წყარო', 'წყარო', 'აბანო'],
  park: ['park', 'პარკი', 'ბაღი'],
  church: ['church', 'monastery', 'ტაძარი', 'ეკლესია', 'მონასტერი', 'ჯვარი', 'ნიში'],
  fortress: ['fortress', 'castle', 'ციხე', 'ციხესიმაგრე', 'კოშკი'],
  winery: ['winery', 'wine', 'მარანი', 'ღვინო'],
  museum: ['museum', 'მუზეუმი'],
  bridge: ['bridge', 'ხიდი']
};

export const REGION_MAP: Record<string, string[]> = {
  'აჭარა': ['აჭარა', 'adjara', 'ბათუმი', 'ქობულეთი', 'ქედა', 'შუახევი', 'ხულო'],
  'გურია': ['გურია', 'guria', 'ოზურგეთი', 'ლანჩხუთი', 'ჩოხატაური'],
  'იმერეთი': ['იმერეთი', 'imereti', 'ქუთაისი', 'წყალტუბო', 'საჩხერე', 'ხონი'],
  'კახეთი': ['კახეთი', 'kakheti', 'თელავი', 'სიღნაღი', 'ყვარელი', 'გურჯაანი', 'ლაგოდეხი', 'ახმეტა', 'დედოფლისწყარო'],
  'მცხეთა-მთიანეთი': ['მცხეთა-მთიანეთი', 'მცხეთა', 'mtskheta', 'ყაზბეგი', 'სტეფანწმინდა', 'დუშეთი', 'თიანეთი'],
  'რაჭა-ლეჩხუმი': ['რაჭა-ლეჩხუმი', 'რაჭა', 'racha', 'ამბროლაური', 'ონი', 'ცაგერი', 'ლეჩხუმი', 'სვანეთი'],
  'რაჭა-ლეჩხუმი და ქვემო სვანეთი': ['რაჭა-ლეჩხუმი', 'რაჭა', 'racha', 'ამბროლაური', 'ონი', 'ცაგერი', 'ლეჩხუმი', 'სვანეთი'],
  'სამეგრელო-ზემო სვანეთი': ['სამეგრელო', 'სვანეთი', 'samegrelo', 'svaneti', 'ზუგდიდი', 'მესტია', 'მარტვილი', 'ფოთი'],
  'სამეგრელო': ['სამეგრელო', 'სვანეთი', 'samegrelo', 'svaneti', 'ზუგდიდი', 'მესტია', 'მარტვილი', 'ფოთი'],
  'სვანეთი': ['სვანეთი', 'სამეგრელო', 'svaneti', 'მესტია'],
  'სამცხე-ჯავახეთი': ['სამცხე-ჯავახეთი', 'samtskhe', 'javakheti', 'ახალციხე', 'ბორჯომი', 'ახალქალაქი', 'ნინოწმინდა', 'ადიგენი', 'ასპინძა'],
  'ქვემო ქართლი': ['ქვემო ქართლი', 'kvemo kartli', 'რუსთავი', 'ბოლნისი', 'დმანისი', 'გარდაბანი', 'მარნეული', 'წალკა'],
  'შიდა ქართლი': ['შიდა ქართლი', 'shida kartli', 'გორი', 'კასპი', 'ქარელი', 'ხაშური'],
  'თბილისი': ['თბილისი', 'tbilisi']
};

const simpleLatinCache = new Map<string, string>();

export function toSimpleLatin(text: string): string {
  if (!text) return '';
  const cached = simpleLatinCache.get(text);
  if (cached !== undefined) return cached;

  let str = text.toLowerCase();

  // Multi-character Latin transliteration normalization first
  str = str
    .replace(/sh/g, 's')
    .replace(/ch/g, 'c')
    .replace(/kh/g, 'h')
    .replace(/gh/g, 'g')
    .replace(/ts/g, 'c')
    .replace(/dz/g, 'z')
    .replace(/zh/g, 'z')
    .replace(/ph/g, 'p')
    .replace(/th/g, 't')
    .replace(/ck/g, 'k');

  const geoMap: Record<string, string> = {
    'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v', 'ზ': 'z',
    'თ': 't', 'ტ': 't', 'ი': 'i', 'კ': 'k', 'ქ': 'k', 'ყ': 'k', 'ლ': 'l',
    'მ': 'm', 'ნ': 'n', 'ო': 'o', 'პ': 'p', 'ფ': 'p', 'ჟ': 'z', 'რ': 'r',
    'ს': 's', 'უ': 'u', 'ღ': 'g', 'შ': 's', 'ჩ': 'c', 'ჭ': 'c', 'ც': 'c',
    'წ': 'c', 'ძ': 'z', 'ხ': 'h', 'ჯ': 'j', 'ჰ': 'h'
  };

  let result = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    result += geoMap[ch] || ch;
  }

  if (simpleLatinCache.size > 2000) {
    simpleLatinCache.clear();
  }
  simpleLatinCache.set(text, result);
  return result;
}

@Injectable({
  providedIn: 'root'
})
export class FilterCardService {

  selectedRegion = signal<string>('');
  selectedNature = signal<string>('');
  wheelchairAccessible = signal<boolean>(false);
  searchInput = signal<string>('');

  matchesRegion(itemRegion = '', itemName = '', queryRegion = ''): boolean {
    if (!queryRegion || queryRegion.trim() === '' || queryRegion === 'აირჩიეთ რეგიონი') {
      return true;
    }

    const q = queryRegion.trim().toLowerCase();
    const ir = itemRegion.trim().toLowerCase();
    const nm = itemName.trim().toLowerCase();
    const simpleQ = toSimpleLatin(q);
    const simpleIr = toSimpleLatin(ir);
    const simpleNm = toSimpleLatin(nm);

    if (ir && (ir.includes(q) || q.includes(ir) || simpleIr.includes(simpleQ))) {
      return true;
    }

    // Check mapping dictionary
    const aliases = REGION_MAP[queryRegion] || REGION_MAP[q];
    if (aliases) {
      return aliases.some(a => {
        const al = a.toLowerCase();
        const simpleAl = toSimpleLatin(al);
        return ir.includes(al) || al.includes(ir) || nm.includes(al) ||
               simpleIr.includes(simpleAl) || simpleNm.includes(simpleAl);
      });
    }

    // Search all REGION_MAP keys
    for (const [key, aliasList] of Object.entries(REGION_MAP)) {
      const simpleKey = toSimpleLatin(key);
      const matchesQuery = key.toLowerCase().includes(q) ||
                           simpleKey.includes(simpleQ) ||
                           aliasList.some(a => a.toLowerCase() === q || toSimpleLatin(a).includes(simpleQ));
      if (matchesQuery) {
        if (aliasList.some(a => {
          const al = a.toLowerCase();
          const simpleAl = toSimpleLatin(al);
          return ir.includes(al) || nm.includes(al) || simpleIr.includes(simpleAl) || simpleNm.includes(simpleAl);
        })) {
          return true;
        }
      }
    }

    return false;
  }

  matchesNature(
    category = '',
    title = '',
    description = '',
    tags: string | string[] = '',
    queryNature = ''
  ): boolean {
    if (!queryNature || queryNature.trim() === '' || queryNature === 'აირჩიეთ ბუნება') {
      return true;
    }

    const q = queryNature.trim().toLowerCase();
    const simpleQ = toSimpleLatin(q);
    const cat = category.toLowerCase();
    const tt = title.toLowerCase();
    const desc = description.toLowerCase();
    const tg = Array.isArray(tags) ? tags.join(' ').toLowerCase() : String(tags).toLowerCase();

    const simpleCat = toSimpleLatin(cat);
    const simpleTt = toSimpleLatin(tt);
    const simpleDesc = toSimpleLatin(desc);
    const simpleTg = toSimpleLatin(tg);

    // Determine target search terms
    let searchTerms = [q];
    if (CATEGORY_MAP[q]) {
      searchTerms = [q, ...CATEGORY_MAP[q]];
    } else {
      // Check if q matches any key or alias in CATEGORY_MAP
      for (const [key, aliases] of Object.entries(CATEGORY_MAP)) {
        const simpleKey = toSimpleLatin(key);
        if (key === q || simpleKey === simpleQ || aliases.some(a => a.toLowerCase() === q || toSimpleLatin(a) === simpleQ)) {
          searchTerms = [key, ...aliases];
          break;
        }
      }
    }

    return searchTerms.some(term => {
      const t = term.toLowerCase();
      const st = toSimpleLatin(t);
      return cat.includes(t) || tt.includes(t) || desc.includes(t) || tg.includes(t) ||
             simpleCat.includes(st) || simpleTt.includes(st) || simpleDesc.includes(st) || simpleTg.includes(st);
    });
  }

  matchesSearch(
    item: {
      title?: string;
      name?: string;
      description?: string;
      location?: string;
      region?: string;
      badge?: string;
      category?: string;
      tags?: string | string[];
    },
    searchQuery = ''
  ): boolean {
    if (!searchQuery || searchQuery.trim() === '') {
      return true;
    }

    const q = searchQuery.trim().toLowerCase();
    const title = (item.title || item.name || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const location = (item.location || item.region || '').toLowerCase();
    const badge = (item.badge || item.category || '').toLowerCase();
    const tagsStr = Array.isArray(item.tags)
      ? item.tags.join(' ').toLowerCase()
      : String(item.tags || '').toLowerCase();

    // 1. Direct substring check
    if (
      title.includes(q) ||
      description.includes(q) ||
      location.includes(q) ||
      badge.includes(q) ||
      tagsStr.includes(q)
    ) {
      return true;
    }

    // 2. Transliterated Simple Latin check (e.g. English query "birtvisi" matching Georgian "ბირთვისის")
    const simpleQ = toSimpleLatin(q);
    if (simpleQ.length >= 2) {
      const simpleTitle = toSimpleLatin(title);
      const simpleDesc = toSimpleLatin(description);
      const simpleLoc = toSimpleLatin(location);
      const simpleBadge = toSimpleLatin(badge);
      const simpleTags = toSimpleLatin(tagsStr);

      if (
        simpleTitle.includes(simpleQ) ||
        simpleDesc.includes(simpleQ) ||
        simpleLoc.includes(simpleQ) ||
        simpleBadge.includes(simpleQ) ||
        simpleTags.includes(simpleQ)
      ) {
        return true;
      }
    }

    // 3. Region map check
    if (this.matchesRegion(location, title, q) || (simpleQ.length >= 2 && this.matchesRegion(location, title, simpleQ))) {
      return true;
    }

    // 4. Category/nature map check
    if (this.matchesNature(badge, title, description, tagsStr, q) || (simpleQ.length >= 2 && this.matchesNature(badge, title, description, tagsStr, simpleQ))) {
      return true;
    }

    // 5. Multi-term query matching
    const terms = q.split(/\s+/).filter(Boolean);
    if (terms.length > 1) {
      const allTermsMatch = terms.every(term => {
        const sTerm = toSimpleLatin(term);
        return (
          title.includes(term) ||
          description.includes(term) ||
          location.includes(term) ||
          badge.includes(term) ||
          tagsStr.includes(term) ||
          (sTerm.length >= 2 && (
            toSimpleLatin(title).includes(sTerm) ||
            toSimpleLatin(description).includes(sTerm) ||
            toSimpleLatin(location).includes(sTerm) ||
            toSimpleLatin(badge).includes(sTerm) ||
            toSimpleLatin(tagsStr).includes(sTerm)
          )) ||
          this.matchesRegion(location, title, term) ||
          this.matchesNature(badge, title, description, tagsStr, term)
        );
      });
      if (allTermsMatch) {
        return true;
      }
    }

    return false;
  }
}