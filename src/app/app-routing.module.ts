import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {HeroesComponent} from '@components/heroes/heroes.component'
import {DashboardComponent} from '@components/dashboard/dashboard.component'
import {HeroDetailComponent} from '@components/heroes/hero-detail/hero-detail.component'

const routes: Routes = [
  {path: 'heroes', component: HeroesComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'detail/:id', component:HeroDetailComponent},
  {path: '', redirectTo: '/dashbord', pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
