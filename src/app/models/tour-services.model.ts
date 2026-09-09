export type PricingType = 'per_person' | 'per_group' | 'per_vehicle' | 'per_day' | 'fixed';

export interface TransportOption {
  id: string;
  name: string;
  capacity: number;
  price: number;
  photo: string;
  description: string;
  pricingType: PricingType;
}

export interface LunchOption {
  id: string;
  name: string;
  pricePerPerson: number;
  photo: string;
  description: string;
  itemsIncluded: string[];
}

export interface TastingOption {
  id: string;
  name: string;
  pricePerPerson: number;
  photo: string;
  description: string;
  itemsIncluded: string[];
}

export interface GuideOption {
  id: string;
  name: string;
  price: number;
  photo: string;
  description: string;
  languages: string[];
  experienceYears: number;
  rating: number;
}

export interface ExtraServiceOption {
  id: string;
  name: string;
  price: number;
  pricingType: PricingType;
  photo: string;
  description: string;
  category: string;
}

export interface TourServicesState {
  travelerCount: number;
  transportId: string | null;
  lunchId: string | null;
  tastingIds: string[];
  guideId: string | null;
  extraServiceIds: string[];
  basePricePerPerson?: number;
}

export interface PriceBreakdownItem {
  id: string;
  category: 'transport' | 'lunch' | 'tasting' | 'guide' | 'extra' | 'base';
  label: string;
  count: number;
  unitPrice: number;
  totalCost: number;
  pricingType: PricingType;
  detailText?: string;
}

export interface TourPriceBreakdown {
  items: PriceBreakdownItem[];
  transportCost: number;
  lunchCost: number;
  tastingCost: number;
  guideCost: number;
  extraServicesCost: number;
  baseCost: number;
  totalPrice: number;
  pricePerPerson: number;
}
