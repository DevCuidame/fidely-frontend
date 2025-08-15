import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, of, tap } from 'rxjs';

export interface CreateTransactionRequest {
  userId: number;
  businessId: number;
  type: 'earn' | 'redeem' | 'adjustment' | 'bonus' | 'penalty';
  points: number;
  purchaseAmount: number;
  currency: string;
  description: string;
  invoiceNumber: string;
}

export interface CreateTransactionResponse {
  success: boolean;
  data?: {
    id: number;
    userId: number;
    businessId: number;
    type: string;
    points: number;
    purchaseAmount: number;
    currency: string;
    description: string;
    invoiceNumber: string;
    createdAt: string;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = environment.url || 'http://localhost:4000';

  // Signals para el estado del servicio
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _lastTransaction = signal<CreateTransactionResponse['data'] | null>(null);

  // Computed signals públicos
  loading = computed(() => this._loading());
  error = computed(() => this._error());
  lastTransaction = computed(() => this._lastTransaction());

  /**
   * Crea una nueva transacción (sellar visita)
   */
  createTransaction(transactionData: CreateTransactionRequest): Observable<CreateTransactionResponse> {
    console.log("🚀 ~ TransactionService ~ createTransaction ~ transactionData:", transactionData)
    this._loading.set(true);
    this._error.set(null);

    const url = `${this.apiUrl}api/transactions/create`;
    
    return this.http.post<CreateTransactionResponse>(url, transactionData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this._lastTransaction.set(response.data);
          this._error.set(null);
        } else {
          this._error.set(response.message || 'Error al crear la transacción');
        }
        this._loading.set(false);
      }),
      catchError(error => {
        console.error('Error creating transaction:', error);
        let errorMessage = 'Error al sellar la visita';
        
        if (error.status === 400) {
          errorMessage = 'Datos de transacción inválidos';
        } else if (error.status === 404) {
          errorMessage = 'Usuario o negocio no encontrado';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this._error.set(errorMessage);
        this._loading.set(false);
        
        return of({
          success: false,
          message: errorMessage
        });
      })
    );
  }

  /**
   * Resetea el estado del servicio
   */
  resetState(): void {
    this._loading.set(false);
    this._error.set(null);
    this._lastTransaction.set(null);
  }

  /**
   * Limpia solo el error
   */
  clearError(): void {
    this._error.set(null);
  }
}