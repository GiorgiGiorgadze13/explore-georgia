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
  { path: '', component: HomeComponent },
  { path: 'events', component: EventsMainComponent },
  { path: 'experience', component: ExperienceComponent },
  { path: 'recomendation', component: RecomendationsComponent },
  { path: 'tradition', component: TraditionsComponent },
  { path: 'favourite', component: FavoritesComponent },
  { path: 'addplace', component: AddPlaceComponent },
  {path:'details', component:CardDetailsComponent},
    {path:'auth', component:AuthComponent},
 {path:'createAcc', component:RegisterComponent},
  {path:'recover', component:RecoverComponent},
  {path:'recoverCode', component:RecoverCodeComponent},
  {path:'retypePassword', component:RetypePasswordComponent},
  {path:'book', component:CreditCardDetailsComponent},
  {path:'cc-confirm', component:CardDetailsConfirmationComponent},

];
