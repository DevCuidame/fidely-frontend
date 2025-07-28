import { Injectable, Injector } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
} from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take, catchError, tap, switchMap } from 'rxjs/operators';
import { NavController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService: AuthService | null = null;

  constructor(private router: Router, private injector: Injector) {}

  // Obtener AuthService de forma perezosa
  // Obtener AuthService de forma perezosa
  private getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    return this.authService;
  }

  canActivate(): Observable<boolean | UrlTree> {
    return this.getAuthService()
      .isAuthenticated$()
      .pipe(
        take(1),
        tap((isAuthenticated) => {
        }),
        map((isAuthenticated) => {
          if (!isAuthenticated) {

            // Intentar limpiar tokens para evitar problemas
            try {
              localStorage.removeItem('token');
              localStorage.removeItem('refresh-token');
            } catch (e) {}

            // Usar router.createUrlTree en lugar de navegar directamente
            return this.router.createUrlTree(['/auth/login']);
          }
          return true;
        }),
        catchError((error) => {
          console.error('Error en AuthGuard:', error);
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh-token');
          } catch (e) {}
          return of(this.router.createUrlTree(['/auth/login']));
        })
      );
  }
}
@Injectable({ providedIn: 'root' })
export class AutoRedirectGuard implements CanActivate {
  private authService: AuthService | null = null;

  constructor(
    private router: Router,
    private injector: Injector,
    private navController: NavController
  ) {}

  // Obtener AuthService de forma perezosa
  private getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    return this.authService;
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.getAuthService().isAuthenticated$().pipe(
      take(1),
      switchMap((isAuthenticated) => {
        if (isAuthenticated) {
          // Verificar si estamos en una ruta de auth
          const currentUrl = this.router.url;
          const isAuthRoute = currentUrl.startsWith('/auth');
          
          if (isAuthRoute) {
            // Si está autenticado y trata de acceder a auth, redirigir según el rol
            return this.getAuthService().getUserData().pipe(
              map(user => {
                const redirectTo = user && user.role === 'Admin' ? '/schedule-panel' : '/home';
                return this.router.createUrlTree([redirectTo]);
              })
            );
          } else {
            // Si está autenticado y no está en auth, verificar el rol para redirección
            return this.getAuthService().getUserData().pipe(
              map(user => {
                const redirectTo = user && user.role === 'Admin' ? '/schedule-panel' : '/home';
                return this.router.createUrlTree([redirectTo]);
              })
            );
          }
        }
        return of(true);  // Si no está autenticado, permite el acceso
      }),
      catchError((error) => {
        return of(true); // Si hay error, permitir acceso por defecto
      })
    );
  }
}