import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IBusinessResponse, BusinessStatus } from '../interfaces/business-registry.interface';
import { CustomerSearchResponseDto, CustomerSearchApiResponse } from '../interfaces/customer-search.interface';
import { 
  RewardCatalogResponse, 
  MilestoneResponse, 
  ClaimRewardRequest, 
  ClaimRewardResponse, 
  RewardDeliveryState, 
  MilestoneData
} from '../interfaces/reward-catalog.interface';
import { Observable, catchError, map, of } from 'rxjs';

interface BusinessApiResponse {
  success: boolean;
  data: IBusinessResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private http = inject(HttpClient);
  private apiUrl = environment.url || 'http://localhost:4000/api';

  // Signals para el estado del servicio
  private _businesses = signal<IBusinessResponse[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _userBusiness = signal<IBusinessResponse | null>(null);
  private _loadingUserBusiness = signal<boolean>(false);
  private _searchedCustomer = signal<CustomerSearchResponseDto | null>(null);
  private _loadingCustomerSearch = signal<boolean>(false);
  private _customerSearchError = signal<string | null>(null);
  
  // Signals para el sistema de premios
  private _rewardCatalog = signal<RewardCatalogResponse | null>(null);
  private _loadingRewardCatalog = signal<boolean>(false);
  private _milestoneData = signal<MilestoneResponse | null>(null);
  private _loadingMilestone = signal<boolean>(false);
  private _rewardDeliveryState = signal<RewardDeliveryState>({ 
    isLoading: false, 
    milestone: null,
    selectedReward: null,
    error: null, 
    isClaimingReward: false,
    success: false 
  });

  // Computed signals públicos
  businesses = computed(() => this._businesses());
  loading = computed(() => this._loading());
  error = computed(() => this._error());
  userBusiness = computed(() => this._userBusiness());
  loadingUserBusiness = computed(() => this._loadingUserBusiness());
  searchedCustomer = computed(() => this._searchedCustomer());
  loadingCustomerSearch = computed(() => this._loadingCustomerSearch());
  customerSearchError = computed(() => this._customerSearchError());
  
  // Computed signals para premios
  rewardCatalog = computed(() => this._rewardCatalog());
  loadingRewardCatalog = computed(() => this._loadingRewardCatalog());
  milestoneData = computed(() => this._milestoneData());
  loadingMilestone = computed(() => this._loadingMilestone());
  rewardDeliveryState = computed(() => this._rewardDeliveryState());

  // Computed signal para negocios aprobados
  approvedBusinesses = computed(() => 
    this._businesses().filter(business => business.status === BusinessStatus.APPROVED)
  );

  /**
   * Obtiene los negocios aliados aprobados desde la API
   */
  loadApprovedBusinesses(): void {
    // Evitar llamadas duplicadas si ya se están cargando los datos o ya existen
    if (this._loading() || this._businesses().length > 0) {
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.getApprovedBusinesses().subscribe({
      next: (response) => {
        if (response.success) {
          this._businesses.set(response.data);
        } else {
          this._error.set('Error al cargar los negocios aliados');
        }
        this._loading.set(false);
      },
      error: (error) => {
        console.error('Error loading businesses:', error);
        this._error.set('Error de conexión al cargar los negocios');
        this._loading.set(false);
      }
    });
  }

  /**
   * Realiza la petición HTTP para obtener negocios aprobados
   */
  private getApprovedBusinesses(): Observable<BusinessApiResponse> {
    const url = `${this.apiUrl}api/businesses/search?status=approved`;
    return this.http.get<BusinessApiResponse>(url).pipe(
      map(response => {
        console.log('API Response:', response);
        return response;
      }),
      catchError(error => {
        console.error('HTTP Error:', error);
        return of({
          success: false,
          data: [],
          pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        });
      })
    );
  }

  /**
   * Busca un negocio por ID
   */
  getBusinessById(id: number): IBusinessResponse | undefined {
    return this._businesses().find(business => business.id === id);
  }

  /**
   * Filtra negocios por tipo
   */
  getBusinessesByType(type: string): IBusinessResponse[] {
    return this._businesses().filter(business => 
      business.business_type?.toLowerCase().includes(type.toLowerCase())
    );
  }

  /**
   * Obtiene el negocio del usuario logueado usando signals
   */
  loadUserBusiness(): void {
    this._loadingUserBusiness.set(true);
    this._error.set(null);

    this.getUserBusiness();
  }

  /**
   * Realiza la petición HTTP para obtener el negocio del usuario logueado usando signals
   */
  private getUserBusiness(): void {
    const url = `${this.apiUrl}api/businesses/my`;
    
    this.http.get<{success: boolean, data: IBusinessResponse[]}>(url).pipe(
      map(response => {
        console.log('User Business API Response:', response);
        // Los datos llegan como array, tomar el primer elemento
        const businessData = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null;
        return {
          success: response.success,
          data: businessData
        };
      }),
      catchError(error => {
        console.error('HTTP Error:', error);
        this._error.set('Error al cargar el negocio del usuario');
        this._loadingUserBusiness.set(false);
        return of({
          success: false,
          data: null
        });
      })
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._userBusiness.set(response.data);
          this._error.set(null);
        } else {
          this._error.set('No se encontraron datos del negocio');
        }
        this._loadingUserBusiness.set(false);
      },
      error: (error) => {
        console.error('Subscription Error:', error);
        this._error.set('Error al cargar el negocio del usuario');
        this._loadingUserBusiness.set(false);
      }
    });
  }

  /**
   * Busca un cliente por número de documento
   */
  searchCustomer(documentNumber: string): void {
    if (!documentNumber.trim()) {
      this._customerSearchError.set('El número de documento es requerido');
      return;
    }

    this._loadingCustomerSearch.set(true);
    this._customerSearchError.set(null);
    this._searchedCustomer.set(null);

    const url = `${this.apiUrl}api/businesses/customer/search/${documentNumber.trim()}`;
    
    this.http.get<CustomerSearchApiResponse>(url).pipe(
      catchError(error => {
        console.error('Error searching customer:', error);
        let errorMessage = 'Error al buscar el cliente';
        
        if (error.status === 404) {
          errorMessage = 'Cliente no encontrado';
        } else if (error.status === 400) {
          errorMessage = 'Número de documento inválido';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this._customerSearchError.set(errorMessage);
        this._loadingCustomerSearch.set(false);
        return of({
          success: false,
          data: null as any
        });
      })
    ).subscribe({
      next: (response) => {
        console.log("🚀 ~ BusinessService ~ searchCustomer ~ response:", response)
        if (response.success && response.data) {
          this._searchedCustomer.set(response.data);
          this._customerSearchError.set(null);
        } else {
          this._customerSearchError.set('Cliente no encontrado');
        }
        this._loadingCustomerSearch.set(false);
      },
      error: (error) => {
        console.error('Subscription Error:', error);
        this._customerSearchError.set('Error al buscar el cliente');
        this._loadingCustomerSearch.set(false);
      }
    });
  }

  /**
   * Limpia los resultados de búsqueda de cliente
   */
  clearCustomerSearch(): void {
    this._searchedCustomer.set(null);
    this._customerSearchError.set(null);
    this._loadingCustomerSearch.set(false);
  }

  /**
   * Limpia el estado del servicio
   */
  clearState(): void {
    this._businesses.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._userBusiness.set(null);
    this._loadingUserBusiness.set(false);
    this.clearCustomerSearch();
    this.clearRewardState();
  }

  /**
   * Obtiene el catálogo de premios del negocio
   */
  loadRewardCatalog(businessId: number): void {
    this._loadingRewardCatalog.set(true);
    this._error.set(null);

    const url = `${this.apiUrl}api/rewards/catalog?businessId=${businessId}`;
    
    this.http.get<RewardCatalogResponse>(url).pipe(
      catchError(error => {
        console.error('Error loading reward catalog:', error);
        this._error.set('Error al cargar el catálogo de premios');
        this._loadingRewardCatalog.set(false);
        return of({
          success: false,
          data: [],
          pagination: { total: 0, page: 1, totalPages: 0, limit: 20 }
        });
      })
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this._rewardCatalog.set(response);
          this._error.set(null);
        } else {
          this._error.set('No se pudo cargar el catálogo de premios');
        }
        this._loadingRewardCatalog.set(false);
      },
      error: (error) => {
        console.error('Subscription Error:', error);
        this._error.set('Error al cargar el catálogo de premios');
        this._loadingRewardCatalog.set(false);
      }
    });
  }

  /**
   * Busca información del código de premio
   */
  searchRewardCode(code: string): Observable<{ success: boolean; data: MilestoneData }> {
    return this.http.get<{ success: boolean; data: MilestoneData }>(`${this.apiUrl}api/milestones/code/${code}`);
  }

  /**
   * Obtiene los datos del milestone por código de premio
   */
  getMilestoneByCode(rewardCode: string): void {
    if (!rewardCode.trim()) {
      this._error.set('El código de premio es requerido');
      return;
    }

    this._loadingMilestone.set(true);
    this._error.set(null);
    this._milestoneData.set(null);

    const url = `${this.apiUrl}api/milestones/code/${rewardCode.trim()}`;
    
    this.http.get<MilestoneResponse>(url).pipe(
      catchError(error => {
        console.error('Error getting milestone data:', error);
        let errorMessage = 'Error al obtener los datos del premio';
        
        if (error.status === 404) {
          errorMessage = 'Código de premio no encontrado o ya utilizado';
        } else if (error.status === 400) {
          errorMessage = 'Código de premio inválido';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this._error.set(errorMessage);
        this._loadingMilestone.set(false);
        return of({
          success: false,
          data: null as any
        });
      })
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this._milestoneData.set(response);
          this._error.set(null);
        } else {
          this._error.set('Código de premio no válido');
        }
        this._loadingMilestone.set(false);
      },
      error: (error) => {
        console.error('Subscription Error:', error);
        this._error.set('Error al obtener los datos del premio');
        this._loadingMilestone.set(false);
      }
    });
  }

  /**
   * Reclama un premio específico
   */
  claimReward(rewardCode: string, selectedRewardId: number): Observable<ClaimRewardResponse> {
    this._rewardDeliveryState.set({ 
      isLoading: true, 
      milestone: null,
      selectedReward: null,
      error: null, 
      isClaimingReward: true,
      success: false 
    });

    const requestBody: ClaimRewardRequest = {
      rewardCode: rewardCode.trim(),
      selectedRewardId
    };

    const url = `${this.apiUrl}api/milestones/claim`;
    
    return this.http.post<ClaimRewardResponse>(url, requestBody).pipe(
      map((response) => {
        if (response.success) {
          this._rewardDeliveryState.set({ 
            isLoading: false, 
            milestone: null,
            selectedReward: null,
            error: null, 
            isClaimingReward: false,
            success: true 
          });
          // Limpiar los datos del milestone después de un reclamo exitoso
          this._milestoneData.set(null);
        } else {
          this._rewardDeliveryState.set({ 
            isLoading: false, 
            milestone: null,
            selectedReward: null,
            error: response.message || 'No se pudo entregar el premio', 
            isClaimingReward: false,
            success: false 
          });
        }
        return response;
      }),
      catchError(error => {
        console.error('Error claiming reward:', error);
        let errorMessage = 'Error al entregar el premio';
        
        if (error.status === 404) {
          errorMessage = 'Premio no encontrado o ya reclamado';
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos para reclamar el premio';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this._rewardDeliveryState.set({ 
          isLoading: false, 
          milestone: null,
          selectedReward: null,
          error: errorMessage, 
          isClaimingReward: false,
          success: false 
        });
        
        throw error;
      })
    );
  }

  /**
   * Limpia los datos del milestone
   */
  clearMilestoneData(): void {
    this._milestoneData.set(null);
    this._loadingMilestone.set(false);
  }

  /**
   * Limpia el estado de entrega de premios
   */
  clearRewardDeliveryState(): void {
    this._rewardDeliveryState.set({ 
      isLoading: false, 
      milestone: null,
      selectedReward: null,
      error: null, 
      isClaimingReward: false,
      success: false 
    });
  }

  /**
   * Limpia todo el estado relacionado con premios
   */
  clearRewardState(): void {
    this._rewardCatalog.set(null);
    this._loadingRewardCatalog.set(false);
    this.clearMilestoneData();
    this.clearRewardDeliveryState();
  }
}