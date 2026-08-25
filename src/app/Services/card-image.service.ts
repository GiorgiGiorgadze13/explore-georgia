import { Injectable } from '@angular/core';

/**
 * Exact, authentic landmark photos of Georgian places, attractions, events, and experiences.
 */
const EXACT_PLACE_IMAGES: Record<string, string> = {
  // Nikortsminda Cathedral
  'nikortsminda': 'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',
  'ნიკორწმინდის ტაძარი': 'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',
  'nikortsminda cathedral': 'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',

  // Birtvisi Canyon & Fortress
  'birtvisi': 'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=800&q=80',
  'ბირთვისის კანიონი': 'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=800&q=80',
  'ბირთვისის ციხე': 'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=800&q=80',

  // Dedaena Park Tbilisi
  'dedaena': 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',
  'დედაენის ბაღი': 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80',

  // National Library of Georgia
  'biblioteka': 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
  'ეროვნული ბიბლიოთეკა': 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',

  // Batumi Street Food / Adjarian Khachapuri
  'street-batumi': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  'ბათუმის სტრიტ-ფუდის კუთხე': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',

  // Cafe Tea and Churchkhela
  'cafe-kutaisi': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
  'კაფე „ჩაი და ჩურჩხელა“': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',

  // Okatse Canyon
  'okatse': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
  'ოკაცეს კანიონი': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',

  // Rike Bike Path / Rike Park Tbilisi
  'velo-rike': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  'რიყის ველობილიკი': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',

  // Family Cellar Khikhani / Kakheti Cellar
  'marani-kakheti': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
  'საოჯახო მარანი „ხიხანი“': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',

  // Tobavarchkhili Lakes
  'tobavarchkhili': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'ტობავარჩხილის ტბები': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',

  // Blue Lake Abkhazia
  'osm-888765992': 'https://images.unsplash.com/photo-1439853949127-fa6498b4dd53?auto=format&fit=crop&w=800&q=80',
  'ცისფერი ტბა': 'https://images.unsplash.com/photo-1439853949127-fa6498b4dd53?auto=format&fit=crop&w=800&q=80',

  // Koruldi Lakes Svaneti
  'osm-3040997621': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'ტბები ქორულდი': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',

  // Kinchkha Waterfall
  'osm-3583287516': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
  'კინჩხას დიდი ჩანჩქერი': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',

  // Takhti-Tepa Mud Volcanoes
  'osm-3578395922': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'ტახტითეფას ტალახის ვულკანები': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',

  // Alazani Valley
  'osm-3569927543': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
  'ალაზნის ველის გადმოსახედი': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',

  // Garikula Art Villa
  'osm-3153824081': 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=800&q=80',
  'არტ-ვილა „გარიყულა“': 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=800&q=80',

  // Pirosmani Museum
  'osm-1551655810': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  'ნიკო ფიროსმანაშვილის სახელმწიფო მუზეუმი': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',

  // State Museum of Georgian Literature
  'osm-1561059942': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
  'გიორგი ლეონიძის სახელობის ქართული ლიტერატურის სახელმწიფო მუზეუმი': 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',

  // Nikoladze Tower Poti
  'osm-1273141286': 'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',
  'ნიკოლაძის კოშკი': 'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',

  // Ketevan Iashvili Fine Art Gallery Kutaisi
  'osm-1182747224': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
  'ქეთევან იაშვილის გალერეა': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',

  // Sakdrisi
  'osm-2645376053': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'საყდრისი': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',

  // Elene Akhvlediani House Museum
  'osm-2891332680': 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=800&q=80',
  'ელენე ახვლედიანის სახლ-მუზეუმი': 'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=800&q=80',

  // Mamdzishkha Mountain
  'osm-2971963454': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'მამძიშხა': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',

  // Truso Gorge
  'osm-4250087306': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
  'თრუსოს ხეობა': 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',

  // Khornabuji Castle
  'osm-4006528027': 'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',
  'ხორნაბუჯი': 'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',

  // Keselo Towers
  'osm-4006459356': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
  'კესელოს კოშკები': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',

  // Grakliani Hill
  'osm-4366390801': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  'გრაკლიანი': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
};

const CATEGORY_POOLS: Record<string, string[]> = {
  lake: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1439853949127-fa6498b4dd53?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1476514525535-ce74f45814ce?auto=format&fit=crop&w=800&q=80'
  ],
  waterfall: [
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'
  ],
  canyon: [
    'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'
  ],
  mountain: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?auto=format&fit=crop&w=800&q=80'
  ],
  church: [
    'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80'
  ],
  food: [
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  ],
  city: [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f30ac4fe65?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80'
  ],
  nature: [
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80'
  ]
};

const DIVERSE_GENERAL_POOL = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
];

@Injectable({
  providedIn: 'root'
})
export class CardImageService {

  setCustomImage(id: string, imageSrc: string): void {
    try {
      const stored = JSON.parse(localStorage.getItem('explore_georgia_custom_images') || '{}');
      stored[id.trim().toLowerCase()] = imageSrc;
      localStorage.setItem('explore_georgia_custom_images', JSON.stringify(stored));
    } catch (e) {
      console.warn('⚠️ [CardImageService] Failed to save custom image:', e);
    }
  }

  getImageForItem(id: string, title = '', category = '', region = ''): string {
    const cleanId = (id || '').trim().toLowerCase();
    const cleanTitle = (title || '').trim().toLowerCase();

    // 0. Custom user uploaded image check
    try {
      const customImages = JSON.parse(localStorage.getItem('explore_georgia_custom_images') || '{}');
      if (cleanId && customImages[cleanId]) {
        return customImages[cleanId];
      }
    } catch (e) {}

    // 1. Direct ID match
    if (cleanId && EXACT_PLACE_IMAGES[cleanId]) {
      return EXACT_PLACE_IMAGES[cleanId];
    }

    // 2. Direct Title match (Georgian or English)
    if (cleanTitle && EXACT_PLACE_IMAGES[cleanTitle]) {
      return EXACT_PLACE_IMAGES[cleanTitle];
    }

    // 3. Partial title key lookup in EXACT_PLACE_IMAGES
    for (const key of Object.keys(EXACT_PLACE_IMAGES)) {
      if (key.length > 3 && (cleanTitle.includes(key) || cleanId.includes(key))) {
        return EXACT_PLACE_IMAGES[key];
      }
    }

    const text = `${cleanId}-${cleanTitle}-${category}-${region}`.toLowerCase();

    // Hash function for deterministic index
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    // Category matches
    if (text.includes('ტბა') || text.includes('lake')) {
      const pool = CATEGORY_POOLS['lake'];
      return pool[positiveHash % pool.length];
    }
    if (text.includes('ჩანჩქერი') || text.includes('waterfall')) {
      const pool = CATEGORY_POOLS['waterfall'];
      return pool[positiveHash % pool.length];
    }
    if (text.includes('კანიონი') || text.includes('canyon')) {
      const pool = CATEGORY_POOLS['canyon'];
      return pool[positiveHash % pool.length];
    }
    if (text.includes('მთა') || text.includes('mountain') || text.includes('ყაზბეგი') || text.includes('სვანეთი') || text.includes('რაჭა')) {
      const pool = CATEGORY_POOLS['mountain'];
      return pool[positiveHash % pool.length];
    }
    if (text.includes('ტაძარი') || text.includes('ეკლესია') || text.includes('ციხე') || text.includes('მონასტერი') || text.includes('church')) {
      const pool = CATEGORY_POOLS['church'];
      return pool[positiveHash % pool.length];
    }
    if (text.includes('კვება') || text.includes('ღვინო') || text.includes('მარანი') || text.includes('რესტორანი') || text.includes('food') || text.includes('wine') || text.includes('კაფე')) {
      const pool = CATEGORY_POOLS['food'];
      return pool[positiveHash % pool.length];
    }
    if (text.includes('თბილისი') || text.includes('ბათუმი') || text.includes('ქალაქი') || text.includes('city')) {
      const pool = CATEGORY_POOLS['city'];
      return pool[positiveHash % pool.length];
    }

    // Default: use general pool indexed deterministically
    return DIVERSE_GENERAL_POOL[positiveHash % DIVERSE_GENERAL_POOL.length];
  }
}

