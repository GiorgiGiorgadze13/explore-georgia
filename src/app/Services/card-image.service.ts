import { Injectable } from '@angular/core';

const LOCAL_IMAGES = [
  '/kakheti.png',
  '/imgg.png',
  '/landscape.png',
  '/hero.jpg',
  '/Frame 1992.jpg',
  '/hero-georgia.jpg',
  '/background.jpg'
];

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
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  '/kakheti.png',
  '/imgg.png',
  '/landscape.png',
  '/hero.jpg',
  '/Frame 1992.jpg',
  '/hero-georgia.jpg'
];

@Injectable({
  providedIn: 'root'
})
export class CardImageService {

  getImageForItem(id: string, title = '', category = '', region = ''): string {
    const text = `${id}-${title}-${category}-${region}`.toLowerCase();

    // Hash function to get deterministic index for this item
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    // Check category matches
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
    if (text.includes('კვება') || text.includes('ღვინო') || text.includes('მარანი') || text.includes('რესტორანი') || text.includes('food') || text.includes('wine')) {
      const pool = CATEGORY_POOLS['food'];
      return pool[positiveHash % pool.length];
    }
    if (text.includes('თბილისი') || text.includes('ბათუმი') || text.includes('ქალაქი') || text.includes('city')) {
      const pool = CATEGORY_POOLS['city'];
      return pool[positiveHash % pool.length];
    }

    // Default: use diverse general pool indexed deterministically by ID hash
    return DIVERSE_GENERAL_POOL[positiveHash % DIVERSE_GENERAL_POOL.length];
  }
}
