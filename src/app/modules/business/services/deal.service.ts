import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, of, tap } from 'rxjs';
import { DealInterface, DealStatus, RewardSourceType } from '../../../core/interfaces/deal.interface';

export interface CreateDealRequest {
  business_id: number;
  user_id: number;
  title: string;
  required_visits: number;
  expires_at: Date;
  reward_source_type: RewardSourceType;
  reward_catalog_id?: number;
  custom_reward_description?: string;
  custom_reward_value?: number;
  notes?: string;
}

export interface CreateDealResponse {
  success: boolean;
  data?: DealInterface;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DealService {
  private http = inject(HttpClient);
  private apiUrl = environment.url || 'http://localhost:4000';

  // Signals para el estado del servicio
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _lastDeal = signal<DealInterface | null>(null);

  // Computed signals públicos
  loading = computed(() => this._loading());
  error = computed(() => this._error());
  lastDeal = computed(() => this._lastDeal());

  /**
   * Crea un nuevo deal
   */
  createDeal(dealData: CreateDealRequest): Observable<CreateDealResponse> {
    this._loading.set(true);
    this._error.set(null);

    const payload = {
      ...dealData,
      current_visits: 0,
      status: DealStatus.ACTIVE
    };

    return this.http.post<CreateDealResponse>(`${this.apiUrl}api/transactions/deals/create`, payload)
      .pipe(
        tap(response => {
          this._loading.set(false);
          if (response.success && response.data) {
            this._lastDeal.set(response.data);
          } else {
            this._error.set(response.message || 'Error al crear el deal');
          }
        }),
        catchError(error => {
          this._loading.set(false);
          this._error.set(error.error?.message || 'Error de conexión');
          return of({
            success: false,
            message: error.error?.message || 'Error de conexión'
          });
        })
      );
  }

  /**
   * Obtiene los deals de un usuario específico
   */
  getUserDeals(userId: number): Observable<{ success: boolean; data: DealInterface[]; message?: string }> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<{ success: boolean; data: DealInterface[]; message?: string }>(
      `${this.apiUrl}api/deals/user/${userId}`
    ).pipe(
      tap(response => {
        this._loading.set(false);
        if (!response.success) {
          this._error.set(response.message || 'Error al obtener deals');
        }
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set(error.error?.message || 'Error de conexión');
        return of({
          success: false,
          data: [],
          message: error.error?.message || 'Error de conexión'
        });
      })
    );
  }

  /**
   * Obtiene los deals de un negocio específico
   */
  getBusinessDeals(businessId: number): Observable<{ success: boolean; data: DealInterface[]; message?: string }> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<{ success: boolean; data: DealInterface[]; message?: string }>(
      `${this.apiUrl}api/deals/business/${businessId}`
    ).pipe(
      tap(response => {
        this._loading.set(false);
        if (!response.success) {
          this._error.set(response.message || 'Error al obtener deals');
        }
      }),
      catchError(error => {
        this._loading.set(false);
        this._error.set(error.error?.message || 'Error de conexión');
        return of({
          success: false,
          data: [],
          message: error.error?.message || 'Error de conexión'
        });
      })
    );
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this._loading.set(false);
    this._error.set(null);
    this._lastDeal.set(null);
  }
}