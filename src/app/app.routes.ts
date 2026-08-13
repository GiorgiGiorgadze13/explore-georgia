import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EventsMainComponent } from './Events/events-main/events-main.component';
import { ExperienceComponent } from './experiences/experience/experience.component';
import { RecomendationsComponent } from './recomendations/recomendations/recomendations.component';

export const routes: Routes = [
    {path:'',component:HomeComponent},
    {path:'events',component:EventsMainComponent},
    {path:'experience',component:ExperienceComponent},
    {path:'recomendation',component:RecomendationsComponent}
];
