import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { AdminGuard } from '../../core/guards/admin.guard';
import { AuthInterceptor } from '../../core/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { PrivateLayoutComponent } from './components/private-layout/private-layout.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UpdateProfileComponent } from 'src/app/modules/home/pages/profile/update-profile.component';
import { ChangePasswordComponent } from 'src/app/modules/user/pages/change-password/change-password.component';
import { DeleteAccountComponent } from 'src/app/modules/user/pages/delete-account/delete-account.component';

// Definición de rutas con layout privado
const routes: Routes = [
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'profile',
        component: UpdateProfileComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'delete-account',
        component: DeleteAccountComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrivateModule {}
