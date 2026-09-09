import { Injectable } from '@angular/core';
import {
  TransportOption,
  LunchOption,
  TastingOption,
  GuideOption,
  ExtraServiceOption,
  TourServicesState,
  TourPriceBreakdown,
  PriceBreakdownItem
} from '../models/tour-services.model';

@Injectable({
  providedIn: 'root'
})
export class TourServicesService {

  readonly transportOptions: TransportOption[] = [
    {
      id: 'minibus-20',
      name: '20-seat minibus',
      capacity: 20,
      price: 300,
      photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
      description: 'კომფორტული მიკროავტობუსი კონდიციონერითა და რბილი სავარძლებით 20 მგზავრამდე.',
      pricingType: 'per_vehicle'
    },
    {
      id: 'minibus-30',
      name: '30-seat minibus',
      capacity: 30,
      price: 400,
      photo: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
      description: 'ტევადი საშუალო ზომის ავტობუსი პანორამული ფანჯრებითა და ბარგის განყოფილებით.',
      pricingType: 'per_vehicle'
    },
    {
      id: 'bus-50',
      name: 'Large bus (50 seats)',
      capacity: 50,
      price: 500,
      photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
      description: 'დიდი ტურისტული ავტობუსი უმაღლესი კომფორტით, Wi-Fi-ით და მიკროფონით.',
      pricingType: 'per_vehicle'
    },
    {
      id: 'vip-sprinter-15',
      name: 'VIP Mercedes Sprinter (15 seats)',
      capacity: 15,
      price: 350,
      photo: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?q=80&w=800&auto=format&fit=crop',
      description: 'პრემიუმ კლასის ტრანსპორტი ტყავის სავარძლებითა და ინდივიდუალური კლიმატკონტროლით.',
      pricingType: 'per_vehicle'
    }
  ];

  readonly lunchOptions: LunchOption[] = [
    {
      id: 'trad-lunch',
      name: 'Traditional Georgian Lunch',
      pricePerPerson: 45,
      photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
      description: 'ავთენტური ქართული სუფრა ადგილობრივ მარანში ტრადიციული კერძებით.',
      itemsIncluded: [
        'Khachapuri',
        'Khinkali',
        'Mtsvadi',
        'Lobio',
        'Georgian salad',
        'Bread',
        'Soft drink'
      ]
    },
    {
      id: 'royal-supra',
      name: 'Royal Supra Feast',
      pricePerPerson: 65,
      photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
      description: 'მდიდრული სადღესასწაულო სუფრა გაფართოებული მენიუთი და ცოცხალი მუსიკალური გაფორმებით.',
      itemsIncluded: [
        'Megruli Khachapuri',
        'Mtsvadi platter',
        'Shkmeruli',
        'Chakhokhbili',
        'Pkhali assortment',
        'Homemade Wine & Soft Drinks',
        'Traditional Desserts'
      ]
    },
    {
      id: 'veg-lunch',
      name: 'Vegetarian Georgian Feast',
      pricePerPerson: 35,
      photo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
      description: 'ჯანსაღი ვეგეტარიანული მენიუ ახალი ბოსტნეულითა და ტრადიციული საკაზმებით.',
      itemsIncluded: [
        'Imeruli Khachapuri',
        'Lobio in clay pot',
        'Ajapsandali',
        'Eggplant with walnuts',
        'Georgian salad',
        'Cornbread (Mchadi)',
        'Fresh Lemonade'
      ]
    }
  ];

  readonly tastingOptions: TastingOption[] = [
    {
      id: 'wine-tasting-30',
      name: 'Wine Tasting',
      pricePerPerson: 30,
      photo: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop',
      description: 'ქვევრის ღვინისა და ჭაჭის დეგუსტაცია სომელიეს თანხლებით.',
      itemsIncluded: [
        '5 varieties of Qvevri wine',
        'Georgian Chacha',
        'Artisanal Cheese platter',
        'Traditional bread & nuts'
      ]
    },
    {
      id: 'qvevri-masterclass',
      name: 'Qvevri Masterclass & Tasting',
      pricePerPerson: 45,
      photo: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop',
      description: 'მარნის ისტორიული დათვალიერება, ქვევრის მოხდის ცერემონია და იშვიათი სარეზერვო ღვინოები.',
      itemsIncluded: [
        'Guided cellar tour',
        'Qvevri opening demonstration',
        '6 Reserve Qvevri wines tasting',
        'Cured meats & Churchkhela'
      ]
    },
    {
      id: 'cheese-wine-pairing',
      name: 'Artisan Cheese & Wine Pairing',
      pricePerPerson: 35,
      photo: 'https://images.unsplash.com/photo-1528823872057-9c018a7a70b3?q=80&w=800&auto=format&fit=crop',
      description: 'საქართველოს სხვადასხვა რეგიონის ოთხი იშვიათი ყველის შეხამება ნატურალურ ღვინოებთან.',
      itemsIncluded: [
        '4 Artisanal Georgian Cheeses',
        '4 Matched Organic Wines',
        'Honey & Dried Fruits platter'
      ]
    }
  ];

  readonly guideOptions: GuideOption[] = [
    {
      id: 'guide-giorgi',
      name: 'Giorgi',
      price: 150,
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
      description: 'სერტიფიცირებული გიდი საქართველოს ისტორიისა და კულტურის ღრმა ცოდნით.',
      languages: ['Georgian', 'English'],
      experienceYears: 5,
      rating: 4.9
    },
    {
      id: 'guide-nino',
      name: 'Nino',
      price: 180,
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
      description: 'ღვინისა და გასტრონომიული ტურების ექსპერტი მრავალწლიანი გამოცდილებით.',
      languages: ['Georgian', 'English', 'German'],
      experienceYears: 7,
      rating: 5.0
    },
    {
      id: 'guide-davit',
      name: 'Davit',
      price: 160,
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      description: 'სათავგადასავლო და ისტორიული მარშრუტების გამოცდილი გიდი.',
      languages: ['Georgian', 'English', 'Russian'],
      experienceYears: 6,
      rating: 4.8
    }
  ];

  readonly extraServicesOptions: ExtraServiceOption[] = [
    {
      id: 'extra-cable-car',
      name: 'Cable Car Ticket',
      price: 15,
      pricingType: 'per_person',
      photo: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800&auto=format&fit=crop',
      description: 'პანორამული საბაგიროთი მგზავრობის ორმხრივი ბილეთი.',
      category: 'Activities'
    },
    {
      id: 'extra-horse-riding',
      name: 'Horse Riding Tour',
      price: 60,
      pricingType: 'per_person',
      photo: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=800&auto=format&fit=crop',
      description: '1-საათიანი ცხენოსნობის ტური ულამაზეს ბუნებაში ინსტრუქტორთან ერთად.',
      category: 'Adventure'
    },
    {
      id: 'extra-museum-tickets',
      name: 'Entrance Tickets',
      price: 25,
      pricingType: 'per_person',
      photo: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=800&auto=format&fit=crop',
      description: 'ყველა ისტორიული ძეგლისა და მუზეუმის შესასვლელი ბილეთები.',
      category: 'Culture'
    },
    {
      id: 'extra-boat-trip',
      name: 'Scenic Boat Trip',
      price: 35,
      pricingType: 'per_person',
      photo: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
      description: '45-წუთიანი გასეირნება კანიონში ან მდინარეზე.',
      category: 'Activities'
    },
    {
      id: 'extra-photographer',
      name: 'Professional Photographer',
      price: 200,
      pricingType: 'fixed',
      photo: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800&auto=format&fit=crop',
      description: 'პროფესიონალი ფოტოგრაფის თანხლება და 50+ დამუშავებული ფოტო.',
      category: 'Media'
    },
    {
      id: 'extra-airport-transfer',
      name: 'Airport Transfer',
      price: 120,
      pricingType: 'per_vehicle',
      photo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop',
      description: 'დახვედრა/ცილება აეროპორტიდან კომფორტული ავტომობილით.',
      category: 'Logistics'
    }
  ];

  isTransportAllowed(transport: TransportOption, travelerCount: number): boolean {
    return transport.capacity >= travelerCount;
  }

  getSuitableTransport(travelerCount: number, currentTransportId: string | null): string | null {
    const validTransports = this.transportOptions.filter(t => t.capacity >= travelerCount);
    if (validTransports.length === 0) return null;

    if (currentTransportId) {
      const current = this.transportOptions.find(t => t.id === currentTransportId);
      if (current && current.capacity >= travelerCount) {
        return current.id;
      }
    }

    // Auto select the smallest vehicle that fits
    validTransports.sort((a, b) => a.capacity - b.capacity);
    return validTransports[0].id;
  }

  calculateBreakdown(state: TourServicesState): TourPriceBreakdown {
    const items: PriceBreakdownItem[] = [];
    const travelers = Math.max(1, state.travelerCount);

    let baseCost = 0;
    if (state.basePricePerPerson && state.basePricePerPerson > 0) {
      baseCost = state.basePricePerPerson * travelers;
      items.push({
        id: 'base-tour-ticket',
        category: 'base',
        label: 'Tour Ticket',
        count: travelers,
        unitPrice: state.basePricePerPerson,
        totalCost: baseCost,
        pricingType: 'per_person',
        detailText: `${state.basePricePerPerson} GEL × ${travelers}`
      });
    }

    let transportCost = 0;
    if (state.transportId) {
      const transport = this.transportOptions.find(t => t.id === state.transportId);
      if (transport && transport.capacity >= travelers) {
        transportCost = transport.price;
        items.push({
          id: transport.id,
          category: 'transport',
          label: transport.name,
          count: 1,
          unitPrice: transport.price,
          totalCost: transportCost,
          pricingType: transport.pricingType,
          detailText: `${transport.price} GEL`
        });
      }
    }

    let lunchCost = 0;
    if (state.lunchId) {
      const lunch = this.lunchOptions.find(l => l.id === state.lunchId);
      if (lunch) {
        lunchCost = lunch.pricePerPerson * travelers;
        items.push({
          id: lunch.id,
          category: 'lunch',
          label: lunch.name,
          count: travelers,
          unitPrice: lunch.pricePerPerson,
          totalCost: lunchCost,
          pricingType: 'per_person',
          detailText: `${lunch.pricePerPerson} × ${travelers} = ${lunchCost} GEL`
        });
      }
    }

    let tastingCost = 0;
    if (state.tastingIds && state.tastingIds.length > 0) {
      for (const tid of state.tastingIds) {
        const tasting = this.tastingOptions.find(t => t.id === tid);
        if (tasting) {
          const cost = tasting.pricePerPerson * travelers;
          tastingCost += cost;
          items.push({
            id: tasting.id,
            category: 'tasting',
            label: tasting.name,
            count: travelers,
            unitPrice: tasting.pricePerPerson,
            totalCost: cost,
            pricingType: 'per_person',
            detailText: `${tasting.pricePerPerson} × ${travelers} = ${cost} GEL`
          });
        }
      }
    }

    let guideCost = 0;
    if (state.guideId) {
      const guide = this.guideOptions.find(g => g.id === state.guideId);
      if (guide) {
        guideCost = guide.price;
        items.push({
          id: guide.id,
          category: 'guide',
          label: `Guide: ${guide.name}`,
          count: 1,
          unitPrice: guide.price,
          totalCost: guideCost,
          pricingType: 'fixed',
          detailText: `${guide.price} GEL`
        });
      }
    }

    let extraServicesCost = 0;
    if (state.extraServiceIds && state.extraServiceIds.length > 0) {
      for (const eid of state.extraServiceIds) {
        const extra = this.extraServicesOptions.find(e => e.id === eid);
        if (extra) {
          let cost = extra.price;
          if (extra.pricingType === 'per_person') {
            cost = extra.price * travelers;
          }
          extraServicesCost += cost;
          items.push({
            id: extra.id,
            category: 'extra',
            label: extra.name,
            count: extra.pricingType === 'per_person' ? travelers : 1,
            unitPrice: extra.price,
            totalCost: cost,
            pricingType: extra.pricingType,
            detailText: extra.pricingType === 'per_person'
              ? `${extra.price} × ${travelers} = ${cost} GEL`
              : `${extra.price} GEL`
          });
        }
      }
    }

    const totalPrice = baseCost + transportCost + lunchCost + tastingCost + guideCost + extraServicesCost;
    const pricePerPerson = Math.round((totalPrice / travelers) * 100) / 100;

    return {
      items,
      transportCost,
      lunchCost,
      tastingCost,
      guideCost,
      extraServicesCost,
      baseCost,
      totalPrice,
      pricePerPerson
    };
  }
}
