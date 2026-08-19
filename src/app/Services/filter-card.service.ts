import { Injectable, signal } from '@angular/core';

export const CATEGORY_MAP: Record<string, string[]> = {
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
  bridge: ['bridge', 'ხიდი'],
  food: ['food', 'საკვები', 'რესტორანი', 'კაფე', 'სწრაფი კვება', 'სტრიტ-ფუდი', 'დესერტი']
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

@Injectable({
  providedIn: 'root'
})
export class FilterCardService {

  selectedRegion = signal<string>('');
  selectedNature = signal<string>('');
  wheelchairAccessible = signal<boolean>(false);

  matchesRegion(itemRegion = '', itemName = '', queryRegion = ''): boolean {
    if (!queryRegion || queryRegion.trim() === '' || queryRegion === 'აირჩიეთ რეგიონი') {
      return true;
    }

    const q = queryRegion.trim().toLowerCase();
    const ir = itemRegion.trim().toLowerCase();
    const nm = itemName.trim().toLowerCase();

    if (ir && (ir.includes(q) || q.includes(ir))) {
      return true;
    }

    // Check mapping dictionary
    const aliases = REGION_MAP[queryRegion] || REGION_MAP[q];
    if (aliases) {
      return aliases.some(a => {
        const al = a.toLowerCase();
        return ir.includes(al) || al.includes(ir) || nm.includes(al);
      });
    }

    // Search all REGION_MAP keys
    for (const [key, aliasList] of Object.entries(REGION_MAP)) {
      const matchesQuery = key.toLowerCase().includes(q) || aliasList.some(a => a.toLowerCase() === q);
      if (matchesQuery) {
        if (aliasList.some(a => {
          const al = a.toLowerCase();
          return ir.includes(al) || nm.includes(al);
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
    const cat = category.toLowerCase();
    const tt = title.toLowerCase();
    const desc = description.toLowerCase();
    const tg = Array.isArray(tags) ? tags.join(' ').toLowerCase() : String(tags).toLowerCase();

    // Determine target search terms
    let searchTerms = [q];
    if (CATEGORY_MAP[q]) {
      searchTerms = [q, ...CATEGORY_MAP[q]];
    } else {
      // Check if q matches any key or alias in CATEGORY_MAP
      for (const [key, aliases] of Object.entries(CATEGORY_MAP)) {
        if (key === q || aliases.some(a => a.toLowerCase() === q)) {
          searchTerms = [key, ...aliases];
          break;
        }
      }
    }

    return searchTerms.some(term => {
      const t = term.toLowerCase();
      return cat.includes(t) || tt.includes(t) || desc.includes(t) || tg.includes(t);
    });
  }

}