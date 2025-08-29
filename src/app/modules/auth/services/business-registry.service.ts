import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BusinessRegistryData } from 'src/app/core/interfaces/business-registry.interface';
import { RegisterData } from 'src/app/core/interfaces/auth.interface';

export interface BusinessRegistrationRequest {
  businessData: Partial<BusinessRegistryData>;
  userData: RegisterData;
  bannerImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BusinessRegistryService {
  private apiUrl = environment.url;
  
  // Signals para el estado del formulario
  currentStep = signal<number>(1);
  businessData = signal<Partial<BusinessRegistryData>>({});
  userData = signal<Partial<RegisterData>>({});
  bannerImage = signal<string | null>(null);
  
  constructor(private http: HttpClient) {}
  
  // Métodos para manejar los pasos
  nextStep(): void {
    if (this.currentStep() < 4) {
      this.currentStep.update(step => step + 1);
    }
  }
  
  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(step => step - 1);
    }
  }
  
  goToStep(step: number): void {
    if (step >= 1 && step <= 4) {
      this.currentStep.set(step);
    }
  }
  
  // Métodos para actualizar datos
  updateBusinessData(data: Partial<BusinessRegistryData>): void {
    this.businessData.update(current => ({ ...current, ...data }));
  }
  
  updateUserData(data: Partial<RegisterData>): void {
    this.userData.update(current => ({ ...current, ...data }));
  }
  
  updateBannerImage(image: string): void {
    this.bannerImage.set(image);
  }
  
  // Método para resetear el formulario
  resetForm(): void {
    this.currentStep.set(1);
    this.businessData.set({});
    this.userData.set({});
    this.bannerImage.set(null);
  }
  
  // Método para validar paso actual
  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.isBasicInfoValid();
      case 2:
        return this.isContactInfoValid();
      case 3:
        return this.isUserInfoValid();
      case 4:
        return true; // Paso de confirmación
      default:
        return false;
    }
  }
  
  private isBasicInfoValid(): boolean {
    const business = this.businessData();
    const user = this.userData();
    return !!(business.business_name && business.business_type && business.tax_id && 
             user.email && user.password_hash);
  }
  
  private isContactInfoValid(): boolean {
    const business = this.businessData();
    const user = this.userData();
    return !!(business.phone && business.address_line1 && user.city_id);
  }
  
  private isUserInfoValid(): boolean {
    const user = this.userData();
    return !!(user.first_name && user.last_name && user.identification_type && 
             user.identification_number);
  }
  
  // Método para enviar el registro al backend
  submitBusinessRegistration(): Observable<any> {
    const registrationData: BusinessRegistrationRequest = {
      businessData: {
        ...this.businessData(),
        status: 'pending',
        country: 'Colombia',
        subscription_plan: 'basic',
        features_enabled: {}
      },
      userData: this.userData() as RegisterData,
      bannerImage: this.bannerImage() || undefined
    };
    
    // Por ahora solo mostrar en consola como solicita el usuario
    console.log('Datos de registro de negocio:', registrationData);
    
    // Simular respuesta exitosa
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Registro exitoso' });
        observer.complete();
      }, 2000);
    });
    
    // Cuando se implemente el backend real:
    // return this.http.post(`${this.apiUrl}/business/register`, registrationData);
  }
}