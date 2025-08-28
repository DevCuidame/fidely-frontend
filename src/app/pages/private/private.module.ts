import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { UserGuard } from '../../core/guards/user.guard';
import { AdminGuard } from '../../core/guards/admin.guard';
import { AuthInterceptor } from '../../core/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UpdateProfileComponent } from 'src/app/modules/home/pages/profile/update-profile.component';
import { ChangePasswordComponent } from 'src/app/modules/user/pages/change-password/change-password.component';
import { DeleteAccountComponent } from 'src/app/modules/user/pages/delete-account/delete-account.component';
import { UserHomeComponent } from './user-home/user-home.component';
import { MyStampsComponent } from './my-stamps/my-stamps.component';
import { HomeComponent } from './home/home.component';
import { RedeemComponent } from './redeem/redeem.component';

// Definición de rutas con layout privado
const routes: Routes = [
  {
    path: '',
    component: UserHomeComponent,
    canActivate: [UserGuard],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        component: HomeComponent,
        canActivate: [UserGuard],
      },
      {
        path: 'my-stamps',
        component: MyStampsComponent,
        canActivate: [UserGuard],
      },
      {
        path: 'redeem',
        component: RedeemComponent,
        canActivate: [UserGuard],
      },
      {
        path: 'profile',
        component: UpdateProfileComponent,
        canActivate: [UserGuard],
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        canActivate: [UserGuard],
      },
      {
        path: 'delete-account',
        component: DeleteAccountComponent,
        // canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    AuthGuard,
    UserGuard,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrivateModule {}
