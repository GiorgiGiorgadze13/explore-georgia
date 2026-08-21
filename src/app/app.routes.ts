import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventsMainComponent } from './Events/events-main/events-main.component';
import { ExperienceComponent } from './experiences/experience/experience.component';
import { RecomendationsComponent } from './recomendations/recomendations/recomendations.component';
import { TraditionsComponent } from './traditions/traditions.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { AddPlaceComponent } from './add-place/add-place.component';
 import { CardDetailsComponent } from './card-details/card-details.component';
import { AuthComponent } from './RegistrationForms/auth/auth.component';
import { RegisterComponent } from './RegistrationForms/register/register.component';
import { RecoverComponent } from './RegistrationForms/recover/recover.component';
import { RecoverCodeComponent } from './RegistrationForms/recover-code/recover-code.component';
import { RetypePasswordComponent } from './RegistrationForms/retype-password/retype-password.component';
import { CreditCardDetailsComponent } from './card-detailscomp/credit-card-details/credit-card-details.component';
import { CardDetailsConfirmationComponent } from './card-detailscomp/card-details-confirmation/card-details-confirmation.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
    data: {
      title: 'მთავარი | აღმოაჩინე საქართველო',
      description: 'აღმოაჩინეთ საქართველოს ულამაზესი კუთხეები, ისტორიული ადგილები, ტრადიციები, ღონისძიებები და ტურისტული მარშრუტები.'
    }
  },
  {
    path: 'events',
    component: EventsMainComponent,
    data: {
      title: 'ღონისძიებები',
      description: 'საქართველოში დაგეგმილი კულტურული, მუსიკალური და სპორტული ღონისძიებების კალენდარი.'
    }
  },
  {
    path: 'experience',
    component: ExperienceComponent,
    data: {
      title: 'გამოცდილება',
      description: 'გაიზიარეთ და აღმოაჩინეთ უნიკალური ტურისტული გამოცდილებები, თავგადასავლები და ტურები საქართველოს მასშტაბით.'
    }
  },
  {
    path: 'recomendation',
    component: RecomendationsComponent,
    data: {
      title: 'რეკომენდაციები',
      description: 'საუკეთესო რეკომენდებული ადგილები, რესტორნები, სასტუმროები და ღირსშესანიშნაობები საქართველოში.'
    }
  },
  {
    path: 'tradition',
    component: TraditionsComponent,
    data: {
      title: 'ტრადიციები',
      description: 'ქართული კულტურა, უძველესი ტრადიციები, ფოლკლორი, ღვინის დაყენების წესები და გასტრონომია.'
    }
  },
  {
    path: 'favourite',
    component: FavoritesComponent,
    data: {
      title: 'ფავორიტები',
      description: 'თქვენი შენახული და რჩეული ადგილები საქართველოში.'
    }
  },
  {
    path: 'addplace',
    component: AddPlaceComponent,
    data: {
      title: 'ადგილის დამატება',
      description: 'დაამატეთ ახალი საინტერესო ადგილი ან ღირსშესანიშნაობა Explore Georgia-ს პლატფორმაზე.'
    }
  },
  {
    path: 'details',
    component: CardDetailsComponent,
    data: {
      title: 'დეტალები',
      description: 'დეტალური ინფორმაცია არჩეული ადგილის ან ღონისძიების შესახებ.'
    }
  },
  {
    path: 'auth',
    component: AuthComponent,
    data: {
      title: 'ავტორიზაცია',
      description: 'შესვლა Explore Georgia-ს სისტემაში.'
    }
  },
  {
    path: 'createAcc',
    component: RegisterComponent,
    data: {
      title: 'რეგისტრაცია',
      description: 'შექმენით ანგარიში Explore Georgia-ზე.'
    }
  },
  {
    path: 'recover',
    component: RecoverComponent,
    data: {
      title: 'პაროლის აღდგენა',
      description: 'პაროლის აღდგენის გვერდი.'
    }
  },
  {
    path: 'recoverCode',
    component: RecoverCodeComponent,
    data: {
      title: 'აღდგენის კოდი',
      description: 'შეიყვანეთ უსაფრთხოების კოდი.'
    }
  },
  {
    path: 'retypePassword',
    component: RetypePasswordComponent,
    data: {
      title: 'ახალი პაროლი',
      description: 'შეიყვანეთ ახალი პაროლი.'
    }
  },
  {
    path: 'book',
    component: CreditCardDetailsComponent,
    data: {
      title: 'დაჯავშნა',
      description: 'დაჯავშნა და გადახდის დეტალები.'
    }
  },
  {
    path: 'cc-confirm',
    component: CardDetailsConfirmationComponent,
    data: {
      title: 'დაჯავშნის დადასტურება',
      description: 'თქვენი ჯავშანი წარმატებით დადასტურდა.'
    }
  }
];
