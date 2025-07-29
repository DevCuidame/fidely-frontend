import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IBusinessResponse, BusinessStatus } from '../interfaces/business-registry.interface';
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

  // Computed signals públicos
  businesses = computed(() => this._businesses());
  loading = computed(() => this._loading());
  error = computed(() => this._error());

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
   * Limpia el estado del servicio
   */
  clearState(): void {
    this._businesses.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}