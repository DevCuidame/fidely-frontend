import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

// Pages
import { UpdateProfileComponent } from './pages/profile/update-profile.component';
import { ScheduleComponent } from '../professionals/pages/schedule/schedule.component';
import { ClientsComponent } from '../professionals/pages/clients/clients.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    component: UpdateProfileComponent,
    canActivate: [AuthGuard], 
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }