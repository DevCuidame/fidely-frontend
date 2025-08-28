import { Injectable, Injector } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../modules/auth/services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take, catchError, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserGuard implements CanActivate {
  private authService: AuthService | null = null;

  constructor(
    private router: Router, 
    private injector: Injector
  ) {}

  // Obtener AuthService de forma perezosa para evitar dependencias circulares
  private getAuthService(): AuthService {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    return this.authService;
  }

  canActivate(): Observable<boolean | UrlTree> {
    return this.getAuthService().isAuthenticated$().pipe(
      take(1),
      switchMap((isAuthenticated) => {
        if (!isAuthenticated) {
          // Si no está autenticado, redirigir al login
          return of(this.router.createUrlTree(['/auth/login']));
        }
        
        // Verificar si el usuario tiene rol user (no business)
        return this.getAuthService().getUserData().pipe(
          map(user => {
            if (user && user.role === 'user') {
              // Si es user, permitir acceso
              return true;
            } else if (user && user.role === 'business') {
              // Si es business, redirigir a business dashboard
              return this.router.createUrlTree(['/business']);
            } else {
              // Si no tiene rol válido, redirigir al login
              return this.router.createUrlTree(['/auth/login']);
            }
          })
        );
      }),
      catchError(() => {
        // En caso de error, redirigir al login
        return of(this.router.createUrlTree(['/auth/login']));
      })
    );
  }
}