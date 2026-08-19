export interface AccessInfo {
  parking?: boolean;
  toilet?: boolean;
  ramp?: boolean;
  wheelchair?: boolean;
  elevator?: boolean;
}

export interface Place {
  id: string;
  name: string;
  region: string;
  group_key: 'nature' | 'leisure' | 'culture' | 'food' | string;
  category: string;
  tags: string[];
  hidden: boolean;
  is_local: boolean;
  rating: number;
  description: string;
  access: AccessInfo;
  coord_x: number;
  coord_y: number;
  created_at?: string;
  lat: number;
  lng: number;
}