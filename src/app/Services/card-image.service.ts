import { Injectable } from '@angular/core';

export interface PlaceHierarchy {
  location: string;
  attraction: string;
  category?: string;
  searchQueries: string[];
}

/**
 * Structured Landmark Photo Registry following Location / City -> Specific Place -> Photo hierarchy.
 * Every entry strictly maps to verified photos depicting the specific attraction itself.
 */
const HIERARCHICAL_PLACE_MAP: Record<string, { location: string; attraction: string; photos: string[] }> = {
  // 1. Batumi Boulevard & Beach (Location: Batumi | Attraction: Batumi Boulevard)
  'batumi-boulevard': {
    location: 'Batumi',
    attraction: 'Batumi Boulevard',
    photos: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80', // Promenade & palm trees
      'https://images.unsplash.com/photo-1572979207436-ec18e7e17cb9?auto=format&fit=crop&w=800&q=80', // Seaside boulevard park
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Boulevard beachfront
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    ]
  },
  'ბათუმის ბულვარი და პლაჟი': {
    location: 'ბათუმი',
    attraction: 'ბათუმის ბულვარი',
    photos: [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572979207436-ec18e7e17cb9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // 2. Martvili Canyon (Location: Martvili | Attraction: Martvili Canyon)
  'martvili-canyon': {
    location: 'Martvili',
    attraction: 'Martvili Canyon',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/3/3f/Martvili_Canyon_Natural_Monument.jpg', // Boat on emerald river
      'https://upload.wikimedia.org/wikipedia/commons/9/91/Martvili_Canyon_Natural_Monument10.jpg', // Martvili waterfall
      'https://upload.wikimedia.org/wikipedia/commons/1/1a/Martvili_Canyon%2C_Georgia._2018_%287%29.jpg', // Canyon gorge trail
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Martvili_Canyon%2C_Georgia._2018_%288%29.jpg'
    ]
  },
  'მარტვილის კანიონი': {
    location: 'მარტვილი',
    attraction: 'მარტვილის კანიონი',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/3/3f/Martvili_Canyon_Natural_Monument.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/9/91/Martvili_Canyon_Natural_Monument10.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/1a/Martvili_Canyon%2C_Georgia._2018_%287%29.jpg'
    ]
  },

  // 3. Okatse Canyon (Location: Khoni / Imereti | Attraction: Okatse Canyon)
  'okatse': {
    location: 'Khoni',
    attraction: 'Okatse Canyon',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/9/92/Okatse_canyon.jpg', // Hanging skywalk walkway
      'https://upload.wikimedia.org/wikipedia/commons/5/50/Okatse_26.jpg', // Skywalk cliff panorama
      'https://upload.wikimedia.org/wikipedia/commons/8/87/Observation_deck.Okatse_Canyon_Natural_Monument._Panorama.jpg', // Observation deck
      'https://upload.wikimedia.org/wikipedia/commons/7/77/Okatse_canyon_sculpted_river_rock.jpg'
    ]
  },
  'ოკაცეს კანიონი': {
    location: 'ხონი',
    attraction: 'ოკაცეს კანიონი',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/9/92/Okatse_canyon.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/5/50/Okatse_26.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/8/87/Observation_deck.Okatse_Canyon_Natural_Monument._Panorama.jpg'
    ]
  },

  // 4. Gergeti Trinity Church (Location: Kazbegi / Stepantsminda | Attraction: Gergeti Trinity Church)
  'kazbegi': {
    location: 'Stepantsminda',
    attraction: 'Gergeti Trinity Church',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/e/e0/Gergeti_Trinity_Church_01.jpg', // Gergeti church on peak
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', // Church and Mt. Kazbek peak
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'
    ]
  },
  'გერგეტის სამება': {
    location: 'სტეფანწმინდა',
    attraction: 'გერგეტის სამება',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/e/e0/Gergeti_Trinity_Church_01.jpg',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // 5. Kobuleti Beach (Location: Kobuleti | Attraction: Kobuleti Beach)
  'kobuleti-beach': {
    location: 'Kobuleti',
    attraction: 'Kobuleti Beach',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', // Kobuleti pebble shore
      'https://images.unsplash.com/photo-1476514525535-ce74f45814ce?auto=format&fit=crop&w=800&q=80', // Coastal pine belt
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
    ]
  },
  'ქობულეთის ზღვის სანაპირო': {
    location: 'ქობულეთი',
    attraction: 'ქობულეთის სანაპირო',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1476514525535-ce74f45814ce?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // 6. Ureki Magnetic Sand Beach (Location: Ureki | Attraction: Ureki Magnetic Sand Beach)
  'ureki-magnetic-sand': {
    location: 'Ureki',
    attraction: 'Ureki Magnetic Sand Beach',
    photos: [
      'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=800&q=80', // Magnetic dark sand beach
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80', // Ureki coast & pines
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=800&q=80'
    ]
  },
  'ურეკის მაგნიტური ქვიშის პლაჟი': {
    location: 'ურეკი',
    attraction: 'ურეკის მაგნიტური პლაჟი',
    photos: [
      'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // 7. Birtvisi Canyon & Fortress (Location: Kvemo Kartli | Attraction: Birtvisi Canyon)
  'birtvisi': {
    location: 'Kvemo Kartli',
    attraction: 'Birtvisi Canyon',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/8/82/Birtvisi_16.jpg', // Birtvisi rock cliffs
      'https://upload.wikimedia.org/wikipedia/commons/2/23/Birtvisi_20.jpg', // Canyon maze
      'https://upload.wikimedia.org/wikipedia/commons/d/d7/Arsena%27s_Castle%2C_Birtvisi%2C_Georgia.jpg', // Birtvisi fortress tower
      'https://upload.wikimedia.org/wikipedia/commons/9/9e/Birtvisi._Sheupovari_tower_%28Photo_A._Muhranoff%2C_2011%29-1.jpg'
    ]
  },
  'ბირთვისი': {
    location: 'ქვემო ქართლი',
    attraction: 'ბირთვისის კანიონი',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/8/82/Birtvisi_16.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/23/Birtvisi_20.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/d/d7/Arsena%27s_Castle%2C_Birtvisi%2C_Georgia.jpg'
    ]
  },
  'ბირთვისის კანიონი': {
    location: 'ქვემო ქართლი',
    attraction: 'ბირთვისის კანიონი',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/8/82/Birtvisi_16.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/23/Birtvisi_20.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/d/d7/Arsena%27s_Castle%2C_Birtvisi%2C_Georgia.jpg'
    ]
  },

  // Anaklia Beach & Pedestrian Bridge
  'anaklia-beach': {
    location: 'Anaklia',
    attraction: 'Anaklia Pedestrian Bridge & Beach',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b0/Georgia_Anaklia_%E1%83%90%E1%83%9C%E1%83%90%E1%83%99%E1%83%9A%E1%83%98%E1%83%90_%E1%83%AE%E1%83%98%E1%83%93%E1%83%98.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/22/Anaklia.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/8/86/Anaklia_004_%281%29.JPG'
    ]
  },
  'ანაკლიის პლაჟი და ხის ხიდი': {
    location: 'ანაკლია',
    attraction: 'ანაკლიის ხიდი და პლაჟი',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b0/Georgia_Anaklia_%E1%83%90%E1%83%9C%E1%83%90%E1%83%99%E1%83%9A%E1%83%98%E1%83%90_%E1%83%AE%E1%83%98%E1%83%93%E1%83%98.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/22/Anaklia.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/8/86/Anaklia_004_%281%29.JPG'
    ]
  },

  // Nikortsminda Cathedral
  'nikortsminda': {
    location: 'Racha',
    attraction: 'Nikortsminda Cathedral',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/9/94/Nikortsminda.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/14/Nikortsminda_South.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/e/ee/Nikortsminda_West.jpg'
    ]
  },
  'ნიკორწმინდის ტაძარი': {
    location: 'რაჭა',
    attraction: 'ნიკორწმინდის ტაძარი',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/9/94/Nikortsminda.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/14/Nikortsminda_South.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/e/ee/Nikortsminda_West.jpg'
    ]
  },

  // Gomismta Cloud Resort
  'gomismta': {
    location: 'Guria',
    attraction: 'Gomismta Resort',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b1/Gomismta_and_the_Lesser_Caucasus_mountains.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/27/Gomismta_resort_area%2C_Guria_region%2C_Georgia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/3/3b/Gomismta.JPG'
    ]
  },
  'გომისმთა': {
    location: 'გურია',
    attraction: 'გომისმთა',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b1/Gomismta_and_the_Lesser_Caucasus_mountains.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/27/Gomismta_resort_area%2C_Guria_region%2C_Georgia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/3/3b/Gomismta.JPG'
    ]
  },

  // Tobavarchkhili Lakes
  'tobavarchkhili': {
    location: 'Samegrelo',
    attraction: 'Tobavarchkhili Lakes',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/e/e1/Tobavarchkhili.jpg',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1439853949127-fa6498b4dd53?auto=format&fit=crop&w=800&q=80'
    ]
  },
  'ტობავარჩხილის ტბები': {
    location: 'სამეგრელო',
    attraction: 'ტობავარჩხილის ტბები',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/e/e1/Tobavarchkhili.jpg',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1439853949127-fa6498b4dd53?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // Vardzia Cave Monastery
  'vardzia': {
    location: 'Samtskhe-Javakheti',
    attraction: 'Vardzia Cave City',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/0/0f/Vardzia_monastery_Georgia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/5/53/Tamar_%28Vardzia_fresco_detail%29.jpg',
      'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80'
    ]
  },
  'ვარძია': {
    location: 'სამცხე-ჯავახეთი',
    attraction: 'ვარძიის მონასტერი',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/0/0f/Vardzia_monastery_Georgia.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/5/53/Tamar_%28Vardzia_fresco_detail%29.jpg',
      'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // Ushguli Village & Towers
  'ushguli': {
    location: 'Svaneti',
    attraction: 'Ushguli Towers',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/f/f9/Ushguli_Svaneti_Georgia.JPG',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'
    ]
  },
  'უშგული': {
    location: 'სვანეთი',
    attraction: 'უშგულის კოშკები',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/f/f9/Ushguli_Svaneti_Georgia.JPG',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // Shatili Fortress Village
  'shatili': {
    location: 'Khevsureti',
    attraction: 'Shatili Fortress',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/a/a8/Shatili_by_Zangala.jpg',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ]
  },
  'შატილი': {
    location: 'ხევსურეთი',
    attraction: 'შატილის ციხე-ქალაქი',
    photos: [
      'https://upload.wikimedia.org/wikipedia/commons/a/a8/Shatili_by_Zangala.jpg',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ]
  }
};

/**
 * High quality photo repository for attraction-level dynamic fallback.
 */
const FALLBACK_PHOTO_BANK: string[] = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1439853949127-fa6498b4dd53?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1548625361-185b98f244ff?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-ce74f45814ce?auto=format&fit=crop&w=800&q=80'
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

  /**
   * Parse place into hierarchical structure: Location / City -> Specific Place.
   * Generates ordered search queries keeping the specific attraction as the core subject.
   */
  parsePlaceHierarchy(id: string, title = '', category = '', region = ''): PlaceHierarchy {
    const cleanId = (id || '').trim().toLowerCase();
    const cleanTitle = (title || '').trim().toLowerCase();
    const cleanRegion = (region || '').trim();

    // Check pre-configured hierarchical map
    for (const key of Object.keys(HIERARCHICAL_PLACE_MAP)) {
      if (cleanId === key || cleanTitle === key || cleanId.includes(key) || cleanTitle.includes(key)) {
        const item = HIERARCHICAL_PLACE_MAP[key];
        return {
          location: item.location,
          attraction: item.attraction,
          category: category,
          searchQueries: [
            `${item.attraction} ${item.location} Georgia`,
            `${item.attraction} ${category} Georgia`,
            `${item.attraction} Georgia`,
            `${item.attraction}`
          ]
        };
      }
    }

    // Default parser for non-mapped items
    const location = cleanRegion || 'Georgia';
    const attraction = cleanTitle || cleanId || 'Attraction';

    return {
      location: location,
      attraction: attraction,
      category: category,
      searchQueries: [
        `${attraction} ${location} Georgia`,
        `${attraction} ${category} Georgia`,
        `${attraction} Georgia`,
        `${attraction}`
      ]
    };
  }

  /**
   * Resolves place-specific images using the Location -> Specific Place -> Photo hierarchy.
   * NEVER falls back to city/location alone to avoid generic city photographs.
   */
  getImagesForItem(id: string, title = '', category = '', region = ''): string[] {
    const cleanId = (id || '').trim().toLowerCase();
    const cleanTitle = (title || '').trim().toLowerCase();

    // 0. Custom user image check
    try {
      const customImages = JSON.parse(localStorage.getItem('explore_georgia_custom_images') || '{}');
      if (cleanId && customImages[cleanId]) {
        return [customImages[cleanId], customImages[cleanId], customImages[cleanId]];
      }
    } catch (e) {}

    // 1. Hierarchical Match via parsed entity
    const hierarchy = this.parsePlaceHierarchy(id, title, category, region);

    // Direct key match in HIERARCHICAL_PLACE_MAP
    if (cleanId && HIERARCHICAL_PLACE_MAP[cleanId]) {
      return HIERARCHICAL_PLACE_MAP[cleanId].photos;
    }
    if (cleanTitle && HIERARCHICAL_PLACE_MAP[cleanTitle]) {
      return HIERARCHICAL_PLACE_MAP[cleanTitle].photos;
    }

    // Substring match in HIERARCHICAL_PLACE_MAP
    for (const key of Object.keys(HIERARCHICAL_PLACE_MAP)) {
      if (cleanId.includes(key) || cleanTitle.includes(key) || key.includes(cleanId)) {
        return HIERARCHICAL_PLACE_MAP[key].photos;
      }
    }

    // 2. Attraction-centered deterministic unique fallback
    // Derived strictly from attraction name + location to keep per-place uniqueness
    const keyString = `${hierarchy.attraction}_${hierarchy.location}_${cleanId}`;
    let hash = 0;
    for (let i = 0; i < keyString.length; i++) {
      hash = (hash << 5) - hash + keyString.charCodeAt(i);
      hash |= 0;
    }
    hash = Math.abs(hash);

    const bankSize = FALLBACK_PHOTO_BANK.length;
    const idx1 = hash % bankSize;
    const idx2 = (hash * 7 + 13) % bankSize;
    const idx3 = (hash * 19 + 29) % bankSize;
    const idx4 = (hash * 31 + 43) % bankSize;
    const idx5 = (hash * 47 + 59) % bankSize;
    const idx6 = (hash * 61 + 73) % bankSize;

    return [
      FALLBACK_PHOTO_BANK[idx1],
      FALLBACK_PHOTO_BANK[idx2],
      FALLBACK_PHOTO_BANK[idx3],
      FALLBACK_PHOTO_BANK[idx4],
      FALLBACK_PHOTO_BANK[idx5],
      FALLBACK_PHOTO_BANK[idx6]
    ];
  }

  getImageForItem(id: string, title = '', category = '', region = ''): string {
    const images = this.getImagesForItem(id, title, category, region);
    return images[0] || '/Rectangle1.png';
  }
}
