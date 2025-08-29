import { Injectable, signal } from '@angular/core';
import { IUserBusinessPointsBalance } from '../interfaces/user-business-points.interface';

@Injectable({
  providedIn: 'root'
})
export class StampNavigationService {
  // Signal para almacenar el stamp seleccionado
  private _selectedStamp = signal<IUserBusinessPointsBalance | null>(null);
  
  // Signal público de solo lectura
  public selectedStamp = this._selectedStamp.asReadonly();
  
  /**
   * Establece el stamp seleccionado
   * @param stamp - El stamp seleccionado del carousel
   */
  setSelectedStamp(stamp: IUserBusinessPointsBalance): void {
    this._selectedStamp.set(stamp);
  }
  
  /**
   * Limpia el stamp seleccionado
   */
  clearSelectedStamp(): void {
    this._selectedStamp.set(null);
  }
  
  /**
   * Verifica si hay un stamp seleccionado
   */
  hasSelectedStamp(): boolean {
    return this._selectedStamp() !== null;
  }
}