import {
  AfterViewInit,
  Component,
  OnDestroy
} from '@angular/core';

import * as L from 'leaflet';

export interface Landmark {
  id: number;
  name: string;
  region: string;
  coordinates: [number, number];
  description: string;
}

const GEORGIA_LANDMARKS: Landmark[] = [
  {
    id: 1,
    name: 'Gergeti Trinity Church',
    region: 'Kazbegi',
    coordinates: [42.6629, 44.6202],
    description: 'Iconic 14th-century church situated under Mount Kazbek.'
  },
  {
    id: 2,
    name: 'Narikala Fortress',
    region: 'Tbilisi',
    coordinates: [41.6880, 44.8083],
    description: 'Ancient fortress overlooking the capital city of Tbilisi.'
  },
  {
    id: 3,
    name: 'Svetitskhoveli Cathedral',
    region: 'Mtskheta',
    coordinates: [41.8423, 44.7212],
    description: 'UNESCO World Heritage site and historic coronation church.'
  },
  {
    id: 4,
    name: 'Vardzia Cave Complex',
    region: 'Samtskhe-Javakheti',
    coordinates: [41.3812, 43.2842],
    description: 'Spectacular 12th-century cave monastery carved into the cliff.'
  },
  {
    id: 5,
    name: 'Rabati Castle',
    region: 'Akhaltsikhe',
    coordinates: [41.6427, 42.9839],
    description: 'Restored medieval castle complex reflecting multicultural heritage.'
  },
  {
    id: 6,
    name: 'Batumi Boulevard & Coast',
    region: 'Adjara',
    coordinates: [41.6508, 41.6360],
    description: 'Promenade along the Black Sea coast in Batumi.'
  },
  {
    id: 7,
    name: 'Uplistsikhe Cave Town',
    region: 'Shida Kartli',
    coordinates: [41.9672, 44.2081],
    description: 'Rock-cut town spanning from the Early Iron Age to Late Middle Ages.'
  }
];

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit, OnDestroy {

  private map!: L.Map;
  public landmarks: Landmark[] = GEORGIA_LANDMARKS;

  ngAfterViewInit(): void {

    // Fix Leaflet marker icon paths in Angular
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png'
    });

    // Approximate boundaries of Georgia
    const georgiaBounds = L.latLngBounds(
      [41.0, 40.0],
      [43.7, 46.8]
    );

    // Create map
    this.map = L.map('map', {
      minZoom: 7,
      maxZoom: 19,
      maxBounds: georgiaBounds,
      maxBoundsViscosity: 1.0
    });

    // Show whole Georgia when the map opens
    this.map.fitBounds(georgiaBounds);

    // Add OpenStreetMap
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }
    ).addTo(this.map);

    // Render all markers dynamically from dataset
    this.addLandmarkMarkers();
  }

  private addLandmarkMarkers(): void {
    this.landmarks.forEach((landmark) => {
      const marker = L.marker(landmark.coordinates).addTo(this.map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; max-width: 200px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; color: #1e293b;">${landmark.name}</h4>
          <span style="display: inline-block; font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 6px;">
            📍 ${landmark.region}
          </span>
          <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">
            ${landmark.description}
          </p>
        </div>
      `);
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}