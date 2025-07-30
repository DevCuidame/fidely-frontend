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
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
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
    path: 'delete-account',
    loadComponent: () =>
      import(
        './pages/public/delete-account-public/delete-account-public.component'
      ).then((m) => m.DeleteAccountPublicComponent),
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

  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
