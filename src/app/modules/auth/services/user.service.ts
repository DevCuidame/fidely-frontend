import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  tap,
  throwError,
  switchMap,
} from 'rxjs';
import { User } from 'src/app/core/interfaces/auth.interface';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/app/core/services/storage.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();
  private baseUrl = environment.url;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Intentar cargar usuario desde el almacenamiento al inicio
    this.loadUserFromStorage();
  }

  /**
   * Carga el usuario desde el almacenamiento
   */
  private loadUserFromStorage(): void {
    // Usar solo StorageService para consistencia
    this.storageService.getItem('user').subscribe(
      (userData) => {
        if (userData && userData.id) {
          this.userSubject.next(userData);
        }
      },
      (error) => {
        console.warn('Error al cargar usuario desde StorageService:', error);
      }
    );
  }

  /**
   * Establece los datos del usuario y los guarda en almacenamiento
   * @param userData Datos del usuario
   */
  setUser(userData: User): void {
    if (!userData) return;

    // Normalizar usuario si es un array
    let normalizedUser = userData;
    if (Array.isArray(userData)) {
      normalizedUser = userData[0];
    }

    // Normalizar campos anidados
    // if (normalizedUser.location && Array.isArray(normalizedUser.location) && normalizedUser.location.length > 0) {
    //   normalizedUser.location = normalizedUser.location[0];
    // }

    // Actualizar el estado en memoria primero (para respuesta inmediata)
    this.userSubject.next(normalizedUser);

    // Guardar en StorageService
    this.storageService.setItem('user', normalizedUser).subscribe(
      () => {
        console.log('Usuario guardado exitosamente en storage');
      },
      (error) => {
        console.warn('Error al guardar usuario en StorageService:', error);
        // El usuario ya está actualizado en memoria, continuar sin fallback
      }
    );
  }

  /**
   * Obtiene el usuario actual
   * @returns Datos del usuario o null
   */
  getUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Busca un usuario por identificación
   * @param identificationType Tipo de identificación
   * @param identificationNumber Número de identificación
   * @returns Observable con el usuario encontrado o null
   */
  findByIdentification(
    identificationType: string,
    identificationNumber: string
  ): Observable<User | null> {
    if (!identificationType || !identificationNumber) {
      return of(null);
    }

    const url = `${this.baseUrl}api/patients/identification/${identificationType}/${identificationNumber}`;

    return this.http.get<User>(url).pipe(
      map((response: any) => {
        const userData = response.data || response;
        return userData;
      }),
      catchError((error) => {
        console.error('Error fetching user by identification:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza los datos del usuario desde el servidor
   * @param userId ID del usuario
   * @returns Observable con los datos actualizados
   */
  refreshUserData(userId: number): Observable<any> {
    const apiUrl = `${this.baseUrl}api/users/profile`;

    return this.http.get(apiUrl).pipe(
      switchMap((response: any) => {
        if (response && response.data) {
          const userData = response.data;

          // Normalizar datos
          if (
            userData.location &&
            Array.isArray(userData.location) &&
            userData.location.length > 0
          ) {
            userData.location = userData.location[0];
          }

          // Eliminar campos grandes para evitar problemas de almacenamiento
          const { imagebs64, ...userDataWithoutLargeFields } = userData;

          // Actualizar estado en memoria
          this.userSubject.next(userDataWithoutLargeFields);

          // Guardar en almacenamiento
          return this.storageService
            .setItem('user', userDataWithoutLargeFields)
            .pipe(
              map(() => userData), // Devolver datos completos al llamador
              catchError((error) => {
                console.warn(
                  'Error al guardar usuario en StorageService:',
                  error
                );

                // El usuario ya está actualizado en memoria, continuar sin fallback
                 console.error(
                   'No se pudo guardar usuario en storage, pero continúa en memoria'
                 );

                return of(userData); // Aún así, devolver datos al llamador
              })
            );
        }

        return throwError(
          () => new Error('No se pudo obtener datos del usuario')
        );
      }),
      catchError((error) => {
        console.error('Error refreshing user data:', error);
        return throwError(
          () => new Error(error.message || 'Error refreshing user data')
        );
      })
    );
  }

  /**
   * Actualiza el usuario con datos de salud
   * @param healthData Datos de salud
   */
  updateUserWithHealthData(healthData: any): void {
    const currentUser = this.userSubject.getValue();

    if (!currentUser) {
      return;
    }

    // Crear versión actualizada del usuario
    let updatedUser: User;
    if (Array.isArray(currentUser)) {
      updatedUser = {
        ...currentUser[0],
        health: healthData,
      };
    } else {
      updatedUser = {
        ...currentUser,
        // health: healthData,
      };
    }

    // Actualizar en memoria
    this.userSubject.next(updatedUser);

    // Guardar en almacenamiento
    this.storageService.setItem('user', updatedUser).subscribe(
      () => {
        console.log('Usuario con datos de salud guardado exitosamente');
      },
      error => {
        console.warn('Error al guardar usuario con datos de salud:', error);
        // El usuario ya está actualizado en memoria, continuar sin fallback
      }
    );
  }

  /**
   * Actualiza el perfil del usuario
   * @param userData Datos a actualizar
   * @returns Observable con la respuesta
   */
  updateProfile(userData: any): Observable<any> {
    const apiUrl = `${this.baseUrl}api/users/profile-complete`;

    return this.http.put(apiUrl, userData).pipe(
      switchMap((response: any) => {
        if (response && response.data) {
          // Obtener usuario actual
          const currentUser = this.getUser();

          // Crear objeto actualizado
          let updatedUser: User;
          if (Array.isArray(currentUser)) {
            updatedUser = {
              ...currentUser[0],
              ...response.data,
            };
          } else {
            updatedUser = {
              ...(currentUser || {}),
              ...response.data,
            };
          }

          // Actualizar en memoria
          this.userSubject.next(updatedUser);

          // Guardar en almacenamiento
          return this.storageService.setItem('user', updatedUser).pipe(
            map(() => response),
            catchError((error) => {
              console.warn('Error al guardar usuario actualizado:', error);
              // El usuario ya está actualizado en memoria, continuar sin fallback
              return of(response);
            })
          );
        }

        return of(response);
      }),
      catchError((error) => {
        console.error('Error updating user profile:', error);
        return throwError(
          () => new Error(error.message || 'Error updating profile')
        );
      })
    );
  }

  /**
   * Limpia los datos del usuario actual
   */
  clearUser() {
    this.userSubject.next(null);
    this.storageService.removeItem('user').subscribe(
      () => {
        console.log('Usuario eliminado exitosamente del storage');
      },
      error => {
        console.warn('Error al eliminar usuario del almacenamiento:', error);
        // El usuario ya está limpio en memoria, continuar sin fallback
      }
    );
  }
}
