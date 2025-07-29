import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IUserMilestoneRewards, MilestoneRewardsApiResponse } from '../interfaces/milestone-rewards.interface';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MilestoneRewardsService {
  private http = inject(HttpClient);
  private apiUrl = environment.url || 'http://localhost:4000/';

  // Signals para el estado del servicio
  private _milestoneRewards = signal<IUserMilestoneRewards | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Computed signals públicos
  milestoneRewards = computed(() => this._milestoneRewards());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

  // Computed signals para datos específicos
  availableRewards = computed(() => this._milestoneRewards()?.availableRewards || []);
  usedRewards = computed(() => this._milestoneRewards()?.usedRewards || []);
  totalMilestones = computed(() => this._milestoneRewards()?.totalMilestones || 0);

  // Computed signal para verificar si hay premios disponibles
  hasAvailableRewards = computed(() => this.availableRewards().length > 0);

  /**
   * Obtiene los premios del usuario desde la API
   */
  loadMilestoneRewards(): void {
    // Evitar llamadas duplicadas si ya se están cargando los datos
    if (this._loading()) {
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.getMilestoneRewards().subscribe({
      next: (response) => {
        if (response.success) {
          this._milestoneRewards.set(response.data);
        } else {
          this._error.set('Error al cargar los premios');
        }
        this._loading.set(false);
      },
      error: (error) => {
        console.error('Error loading milestone rewards:', error);
        this._error.set('Error de conexión al cargar los premios');
        this._loading.set(false);
      }
    });
  }

  /**
   * Realiza la petición HTTP para obtener los premios del usuario
   */
  private getMilestoneRewards(): Observable<MilestoneRewardsApiResponse> {
    const url = `${this.apiUrl}api/milestones/my-rewards`;
    return this.http.get<MilestoneRewardsApiResponse>(url).pipe(
      catchError(error => {
        console.error('HTTP Error:', error);
        const fallbackResponse: MilestoneRewardsApiResponse = {
          success: false,
          data: {
            availableRewards: [],
            usedRewards: [],
            totalMilestones: 0
          }
        };
        return of(fallbackResponse);
      })
    );
  }

  /**
   * Obtiene un premio específico por ID
   */
  getRewardById(id: number) {
    return computed(() => {
      const rewards = this.availableRewards();
      return rewards.find(reward => reward.id === id);
    });
  }

  /**
   * Filtra premios por negocio
   */
  getRewardsByBusiness(businessId: number) {
    return computed(() => {
      const rewards = this.availableRewards();
      return rewards.filter(reward => reward.businessId === businessId);
    });
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this._milestoneRewards.set(null);
    this._loading.set(false);
    this._error.set(null);
  }

  /**
   * Refresca los datos de premios
   */
  refresh(): void {
    this.loadMilestoneRewards();
  }
}