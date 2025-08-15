import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout.component';
import { AdminHomeComponent } from 'src/app/pages/private/admin-home/admin-home.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    //canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: AdminHomeComponent
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
export class AdminRoutingModule { }
