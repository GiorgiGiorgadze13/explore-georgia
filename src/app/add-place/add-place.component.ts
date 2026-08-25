import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../home/header/header.component';
import { FooterComponent } from '../home/footer/footer.component';
import { MapComponent } from '../home/map/map.component';
import { PlacesService } from '../Services/places.service';
import { CardImageService } from '../Services/card-image.service';
import { LanguageService } from '../Services/language.service';

@Component({
  selector: 'app-add-place',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, MapComponent],
  templateUrl: './add-place.component.html',
  styleUrl: './add-place.component.css'
})
export class AddPlaceComponent {
  private placesService = inject(PlacesService);
  private imageService = inject(CardImageService);
  public langService = inject(LanguageService);
  private router = inject(Router);

  name: string = '';
  category: string = '';
  region: string = '';
  description: string = '';
  wheelchair: boolean = false;
  parking: boolean = false;
  food: boolean = false;
  wifi: boolean = false;
  hiddenGem: boolean = false;

  imagePreview: string | null = null;
  imageFileName: string = '';

  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;

  categories: string[] = [
    'ჩანჩქერი',
    'კანიონი',
    'მღვიმე',
    'ტბა',
    'მდინარე',
    'მთა',
    'ტყე',
    'ეროვნული პარკი',
    'ტაძარი / ეკლესია',
    'ციხე / კოშკი',
    'მარანი / ღვინო',
    'მუზეუმი',
    'კვების ობიექტი',
    'სხვა'
  ];

  regions: string[] = [
    'აჭარა',
    'გურია',
    'იმერეთი',
    'კახეთი',
    'მცხეთა-მთიანეთი',
    'რაჭა-ლეჩხუმი',
    'სამეგრელო-ზემო სვანეთი',
    'სამცხე-ჯავახეთი',
    'ქვემო ქართლი',
    'შიდა ქართლი',
    'თბილისი'
  ];

  toggleWheelchair() {
    this.wheelchair = !this.wheelchair;
  }

  toggleParking() {
    this.parking = !this.parking;
  }

  toggleFood() {
    this.food = !this.food;
  }

  toggleWifi() {
    this.wifi = !this.wifi;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'გთხოვთ აირჩიოთ ვალიდური ფოტოს ფაილი (JPG, PNG)';
      return;
    }
    this.imageFileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.errorMessage = '';
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imagePreview = null;
    this.imageFileName = '';
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name.trim()) {
      this.errorMessage = 'გთხოვთ მიუთითოთ ადგილის სახელწოდება';
      return;
    }
    if (!this.category) {
      this.errorMessage = 'გთხოვთ აირჩიოთ კატეგორია';
      return;
    }
    if (!this.region || this.region === 'აირჩიეთ რეგიონი') {
      this.errorMessage = 'გთხოვთ აირჩიოთ რეგიონი';
      return;
    }
    if (!this.description.trim()) {
      this.errorMessage = 'გთხოვთ შეიყვანოთ ადგილის აღწერა / ისტორია';
      return;
    }

    this.isSubmitting = true;

    try {
      const createdPlace = this.placesService.addPlace({
        name: this.name.trim(),
        category: this.category,
        region: this.region,
        description: this.description.trim(),
        wheelchair: this.wheelchair,
        parking: this.parking,
        food: this.food,
        wifi: this.wifi,
        hiddenGem: this.hiddenGem,
        lat: 41.7151 + (Math.random() * 0.4 - 0.2),
        lng: 44.8271 + (Math.random() * 0.4 - 0.2)
      });

      if (this.imagePreview) {
        this.imageService.setCustomImage(createdPlace.id, this.imagePreview);
      }

      const finalImage = this.imagePreview || this.imageService.getImageForItem(createdPlace.id, createdPlace.name, createdPlace.category, createdPlace.region);

      this.successMessage = 'ადგილი წარმატებით დაემატა!';
      
      setTimeout(() => {
        this.router.navigate(['/details'], {
          queryParams: {
            id: createdPlace.id,
            title: createdPlace.name,
            location: createdPlace.region,
            badge: createdPlace.category,
            image: finalImage,
            description: createdPlace.description
          },
          state: {
            card: {
              id: createdPlace.id,
              title: createdPlace.name,
              badge: createdPlace.category,
              description: createdPlace.description,
              location: createdPlace.region,
              image: finalImage,
              type: 'place'
            }
          }
        });
      }, 1000);

    } catch (e) {
      this.errorMessage = 'ადგილის დამატებისას დაფიქსირდა შეცდომა';
      this.isSubmitting = false;
    }
  }
}
