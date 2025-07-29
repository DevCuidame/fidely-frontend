// src/app/core/services/auth.service.ts
import { Injectable, Injector, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of, from } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { RegisterData, User } from 'src/app/core/interfaces/auth.interface';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { NavController } from '@ionic/angular';
import { StorageService } from 'src/app/core/services/storage.service';
const apiUrl = environment.url;

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signals para el estado de autenticación
  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<User | null>(null);
  
  // Computed signals públicos
  public isAuthenticated = computed(() => this._isAuthenticated());
  public currentUser = computed(() => this._currentUser());
  

  
  private navController: NavController | null = null;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private injector: Injector,
    private storage: StorageService
  ) {
    // Inicializar signals
    this._isAuthenticated.set(this.hasToken());
    this._currentUser.set(null);
    this.checkAuthState();
    this.loadUserFromStorage();
  }

  private checkAuthState(): void {
    this.storage.getItem('token').subscribe(
      (token) => {
        this._isAuthenticated.set(!!token);
      },
      (error) => {
        console.error('Error checking auth state:', error);
        this._isAuthenticated.set(false);
      }
    );
  }

  private loadUserFromStorage(): void {
    this.storage.getItem('user').subscribe(
      (userData) => {
        if (userData) {
          this._currentUser.set(userData as User);
          this.userService.setUser(userData as User);
        }
      },
      (error) => {
        console.error('Error loading user data:', error);
      }
    );
  }

  /**
   * Verifica si el usuario está autenticado de forma reactiva
   * @returns Observable<boolean> que emite true si el usuario está autenticado, false en caso contrario
   */
  isAuthenticated$(): Observable<boolean> {
    // Primero verificar estado actual
    if (this._isAuthenticated() === true) {
      return of(true);
    }

    // Si el estado dice que no está autenticado, verificar si hay token
    return this.storage.getItem('token').pipe(
      map((token) => {
        const isAuth = !!token;

        // Si encontramos un token, actualizar el estado
        if (isAuth && this._isAuthenticated() !== true) {
          this._isAuthenticated.set(true);
        }

        return isAuth;
      }),
      catchError((error) => {
        console.warn('Error verificando token en storage:', error);
        
        // Si hay error en storage, asumir no autenticado
        this._isAuthenticated.set(false);
        return of(false);
      })
    );
  }
  /**
   * Método de inicio de sesión mejorado con manejo de errores
   * y almacenamiento asíncrono
   */

  login(credentials: { email: string; password: string }): Observable<any> {
    // Convertir email a minúsculas antes de enviarlo
    const normalizedCredentials = {
      ...credentials,
      email: credentials.email.toLowerCase(),
    };

    return this.http
      .post(`${apiUrl}api/auth/login`, normalizedCredentials)
      .pipe(
        catchError((error) => {
          return throwError(() => ({
            status: error.status,
            error: error.error,
            message:
              error.error?.error ||
              'Inicio de sesión fallido. Verifica tus credenciales.',
          }));
        }),
        tap(),
        switchMap((response: any) => {
          return this.saveTokens(response).pipe(
            switchMap(() => this.saveUserData(response)),
            map(() => response)
          );
        })
      );
  }

  // Métodos auxiliares para separar la lógica

  private saveTokens(response: any): Observable<any> {
    // Guardar access_token
    return this.storage.setItem('token', response.data.access_token).pipe(
      catchError((error) => {
        console.warn('Error al guardar token:', error);
        console.error('No se pudo guardar token en storage');
        return of(null);
      }),
      // Guardar refresh_token
      switchMap(() => {
        return this.storage
          .setItem('refresh-token', response.data.refresh_token)
          .pipe(
            catchError((error) => {
              console.warn('Error al guardar refresh token:', error);
              console.error('No se pudo guardar refresh token en storage');
              return of(null);
            })
          );
      })
    );
  }

  private saveUserData(response: any): Observable<any> {
    const userData = response.data.user;

    // Actualizar estado en memoria inmediatamente
    this.userService.setUser(userData as User);
    this._currentUser.set(userData as User);
    this._isAuthenticated.set(true);

    // Guardar en almacenamiento
    return this.storage.setItem('user', userData).pipe(
      catchError((error) => {
        console.warn('Error al guardar datos de usuario:', error);
        return of(userData);
      })
    );
  }

  register(credentials: RegisterData): Observable<any> {
    // Normalizar email a minúsculas
    const normalizedCredentials = {
      ...credentials,
      email: credentials.email.toLowerCase(),
    };

    return this.http
      .post(`${apiUrl}api/auth/register`, normalizedCredentials)
      .pipe(
        catchError((error) => {
          let errorMessage = 'Error en el registro';

          if (error.error) {
            if (
              typeof error.error === 'string' &&
              error.error.includes('Error:')
            ) {
              const errorMatch = error.error.match(/Error: ([^<]+)</);
              if (errorMatch && errorMatch[1]) {
                errorMessage = errorMatch[1].trim();
              }
            } else if (error.error.message) {
              errorMessage = error.error.message;
            }
          }

          return throwError(() => ({
            status: error.status,
            message: errorMessage,
            originalError: error,
          }));
        })
      );
  }

  /**
   * Reenvía el correo de verificación al usuario
   * @param email Email del usuario
   */
  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${apiUrl}api/email/resend`, { email }).pipe(
      catchError((error) => {
        console.error('Error al reenviar correo de verificación:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra sesión y limpia los datos de usuario
   * @returns Observable que completa cuando se cierra la sesión
   */
  logout(): Observable<void> {
    // Primero limpiamos estado en memoria para respuesta inmediata
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.userService.clearUser();

    // Luego intentamos limpiar almacenamiento
    return this.storage.clear().pipe(
      catchError((error) => {
        console.warn('Error al limpiar almacenamiento durante logout:', error);
        
        // El estado ya está limpio en memoria, continuar sin fallback
        console.error('No se pudo limpiar storage completamente, pero el estado está limpio');
        
        // Devolver completado aún con error
        return of(undefined);
      }),
      // Convertir undefined a void para tipo correcto
      map(() => void 0)
    );
  }

  getUserData(): Observable<User> {
    return this.storage.getItem('user');
  }

  getDataFromApi(): Observable<any> {
    return this.http.get(`${apiUrl}api/users/profile`).pipe(
      catchError((error) => {
        console.error(
          'Error al obtener los datos completos del usuario:',
          error
        );
        return throwError(() => error);
      })
    );
  }



  isAdmin(): boolean {
    return this._currentUser()?.role === 'admin';
  }

  /**
   * Método mejorado para refrescar el token de autenticación
   * @returns Observable con los nuevos tokens
   */
  refreshToken(): Observable<any> {
    return this.storage.getSecureItem('refresh-token').pipe(
      switchMap((refresh_token) => {
        if (!refresh_token) {
          return throwError(() => new Error('No refresh token available'));
        }

        return this.http
          .post(`${apiUrl}api/auth/refresh-token`, { refresh_token })
          .pipe(
            switchMap((response: any) => {
              // Guardar los nuevos tokens
              return this.storage
                .setItem('token', response.data.access_token)
                .pipe(
                  switchMap(() =>
                    this.storage.setItem(
                      'refresh-token',
                      response.data.refresh_token
                    )
                  ),
                  map(() => response.data)
                );
            }),
            catchError((error) => {
              // En caso de error, hacer logout
              return this.logout().pipe(
                switchMap(() => throwError(() => error))
              );
            })
          );
      })
    );
  }

  refreshUserData(): void {
    this.getUserData().subscribe({
      next: (user) => {
        if (user) {
          const normalizedUser = Array.isArray(user) ? user[0] : user;

          if (
            normalizedUser.location &&
            Array.isArray(normalizedUser.location) &&
            normalizedUser.location.length > 0
          ) {
            normalizedUser.location = normalizedUser.location[0];
          }

          // Actualizar el signal del AuthService
          this._currentUser.set(normalizedUser);
          // También actualizar el UserService
          this.userService.setUser(normalizedUser);
        }
      },
      error: (error) => {
        console.error('Error refreshing user data:', error);
      }
    });
  }

  private hasToken(): boolean {
    // Usar signals para verificación inicial
    // El estado real se maneja de forma reactiva en checkAuthState()
    try {
      return this._isAuthenticated();
    } catch {
      return false;
    }
  }

  // Método para obtener NavController de forma perezosa
  private getNavController(): NavController {
    if (!this.navController) {
      this.navController = this.injector.get(NavController);
    }
    return this.navController;
  }

  public get currentUserValue(): User | null {
    return this._currentUser();
  }

  setUser(user: User): void {
    this.storage.setItem('user', user).subscribe({
      next: () => {
        this._currentUser.set(user);
      },
      error: (error) => {
        console.warn('Error saving user to storage:', error);
        // Fallback: actualizar solo en memoria
        this._currentUser.set(user);
      }
    });
  }

  getUser(): User | null {
    return this.getUserFromStorage();
  }

  private getUserFromStorage(): User | null {
    // Este método se mantiene para compatibilidad, pero el estado real
    // se maneja de forma reactiva en loadUserFromStorage()
    return this._currentUser();
  }

  // Enviar código para verificar el correo
  sendVerifyCode(email: string): Observable<any> {
    return this.http.post(`${environment.url}api/email/resend`, { email });
  }

  // Verificar el correo con el código
  verifyEmail(code: string): Observable<any> {
    return this.http.post(`${environment.url}api/email/verify`, { code });
  }

  /**
   * Elimina la cuenta del usuario actual
   * @param data Datos necesarios para la eliminación (contraseña, razón, etc.)
   * @returns Observable con la respuesta del servidor
   */
  deleteAccount(data: {
    password: string;
    reason?: string;
    otherReason?: string;
    confirmation: string;
  }): Observable<any> {
    const endpoint = `${environment.url}api/auth/delete-account`;

    return this.http.delete(endpoint, {
      body: {
        password: data.password,
        reason: data.reason,
        otherReason: data.otherReason,
        confirmation: data.confirmation,
      },
    });
  }

  getAccountDeletionInfo(): Observable<any> {
    const endpoint = `${environment.url}api/auth/account-deletion-info`;
    return this.http.get(endpoint);
  }

  verifyPasswordForDeletion(password: string): Observable<any> {
    const endpoint = `${environment.url}api/auth/verify-password`;
    return this.http.post(endpoint, { password });
  }
}
