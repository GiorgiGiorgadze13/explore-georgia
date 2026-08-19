import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterCardService {

  selectedRegion = signal<string>('');

  selectedNature = signal<string>('');

  wheelchairAccessible = signal<boolean>(false);

}