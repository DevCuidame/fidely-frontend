import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessGuard } from 'src/app/core/guards/business.guard';
import { BusinessLayoutComponent } from './layouts/business-layout.component';
import { BusinessHomeComponent } from 'src/app/pages/private/admin-home/business-home.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessLayoutComponent,
    canActivate: [BusinessGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: BusinessHomeComponent
      },
      // Aquí puedes agregar más rutas para el admin
      // {
      //   path: 'promos',
      //   component: AdminPromosComponent
      // },
      // {
      //   path: 'clients',
      //   component: AdminClientsComponent
      // },
      // {
      //   path: 'rewards',
      //   component: AdminRewardsComponent
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessRoutingModule { }
