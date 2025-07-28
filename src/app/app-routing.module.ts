import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, AutoRedirectGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { VerifyEmailComponent } from './modules/auth/pages/verify-email/verify-email.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/main/main.module').then((m) => m.MainModule),
  },

  {
    path: 'home',
    loadChildren: () =>
      import('./pages/private/private.module').then((m) => m.PrivateModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'reset-password',
    loadChildren: () =>
      import('./modules/auth/pages/new-password/new-password.module').then(
        (m) => m.NewPasswordModule
      ),
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },

  {
    path: 'user/delete-account',
    loadComponent: () =>
      import(
        './modules/user/pages/delete-account/delete-account.component'
      ).then((m) => m.DeleteAccountComponent),
    canActivate: [AuthGuard],
  },

  {
    path: 'user-form',
    loadChildren: () =>
      import('./modules/user/user.module').then((m) => m.UserModule),
  },

  {
    path: 'user',
    loadChildren: () =>
      import('./pages/private/private.module').then(
        (m) => m.PrivateModule
      ),
  },

  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: '**', redirectTo: 'inicio' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
