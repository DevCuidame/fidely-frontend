import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IUserPointsResponse, IUserBusinessPointsBalance, IGlobalPointsBalance } from '../interfaces/user-business-points.interface';
import { Observable, catchError, of, tap } from 'rxjs';

interface UserPointsApiResponse {
  success: boolean;
  data: IUserPointsResponse;
}

@Injectable({
  providedIn: 'root'
})
export class UserPointsService {
  private http = inject(HttpClient);
  private apiUrl = environment.url || 'http://localhost:4000/api';

  // Signals para el estado del servicio
  private _userPoints = signal<IUserPointsResponse | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Computed signals públicos
  userPoints = computed(() => this._userPoints());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Computed signals para datos específicos
  globalBalance = computed(() => this._userPoints()?.globalBalance || null);
  businessBalances = computed(() => this._userPoints()?.businessBalances || []);
  totalAvailablePoints = computed(() => this._userPoints()?.totalAvailablePoints || 0);

  // Computed signal para obtener puntos por negocio
  getPointsByBusiness = computed(() => {
    const balances = this.businessBalances();
    return (businessId: number) => balances.find(b => b.businessId === businessId);
  });

  // Computed signal para verificar si el usuario tiene puntos
  hasPoints = computed(() => this.totalAvailablePoints() > 0);

  /**
   * Obtiene los puntos completos del usuario desde la API
   */
  loadUserPoints(): void {
    // Evitar llamadas duplicadas si ya se están cargando los datos
    if (this._loading()) {
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.getUserPointsComplete().subscribe({
      next: (response) => {
        if (response.success) {
          this._userPoints.set(response.data);
        } else {
          this._error.set('Error al cargar los puntos del usuario');
        }
        this._loading.set(false);
      },
      error: (error) => {
        console.error('Error loading user points:', error);
        this._error.set('Error de conexión al cargar los puntos');
        this._loading.set(false);
      }
    });
  }

  /**
   * Realiza la petición HTTP para obtener los puntos del usuario
   */
  private getUserPointsComplete(): Observable<UserPointsApiResponse> {
    const url = `${this.apiUrl}api/transactions/my-points/complete`;
    return this.http.get<UserPointsApiResponse>(url).pipe(
      catchError(error => {
        console.error('HTTP Error:', error);
        const fallbackResponse = {
          success: false,
          data: {
            userId: 0,
            globalBalance: {
              userId: 0,
              totalPoints: 0,
              availablePoints: 0,
              lifetimePoints: 0,
              pendingPoints: 0,
              has_active_deal: false,
              required_points: 0,
              redeemedPoints: 0
            },
            businessBalances: [],
            totalAvailablePoints: 0
          }
        };
        console.log('Fallback Response:', fallbackResponse);
        return of(fallbackResponse);
      })
    );
  }
  /**
   * Obtiene el balance de puntos para un negocio específico
   */
  getBusinessBalance(businessId: number): IUserBusinessPointsBalance | undefined {
    return this.businessBalances().find(balance => balance.businessId === businessId);
  }

  /**
   * Verifica si el usuario tiene suficientes puntos para una transacción
   */
  hasEnoughPoints(requiredPoints: number, businessId?: number): boolean {
    if (businessId) {
      const businessBalance = this.getBusinessBalance(businessId);
      return (businessBalance?.availablePoints || 0) >= requiredPoints;
    }
    return this.totalAvailablePoints() >= requiredPoints;
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this._userPoints.set(null);
    this._loading.set(false);
    this._error.set(null);
  }

  /**
   * Refresca los datos de puntos
   */
  refresh(): void {
    this.loadUserPoints();
  }
}