import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
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
    console.log('🚀 goToStep ejecutado:', {
      targetStep: step,
      currentStep: this.currentStep(),
      isValidStep: step >= 1 && step <= 4
    });
    
    if (step >= 1 && step <= 4) {
      this.currentStep.set(step);
      console.log('✅ Paso actualizado a:', this.currentStep());
    } else {
      console.log('❌ Paso inválido:', step);
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
    console.log(`🔍 Validando paso ${step}`);
    
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
    const isValid = !!(business.business_name && business.business_type && business.tax_id && 
             business.email && user.password_hash);
    
    console.log('🔍 Validando Basic Info:', {
      business_name: business.business_name,
      business_type: business.business_type,
      tax_id: business.tax_id,
      email: business.email,
      password_hash: user.password_hash ? '***' : undefined,
      isValid
    });
    
    return isValid;
  }
  
  private isContactInfoValid(): boolean {
    const business = this.businessData();
    const user = this.userData();
    const isValid = !!(business.phone && business.address_line1 && user.city_id);
    
    console.log('🔍 Validando Contact Info:', {
      phone: business.phone,
      address_line1: business.address_line1,
      city_id: user.city_id,
      isValid
    });
    
    return isValid;
  }
  
  private isUserInfoValid(): boolean {
    const user = this.userData();
    const isValid = !!(user.first_name && user.last_name && user.identification_type && 
             user.identification_number && user.gender && user.birth_date);
    
    console.log('🔍 Validando User Info:', {
      first_name: user.first_name,
      last_name: user.last_name,
      identification_type: user.identification_type,
      identification_number: user.identification_number,
      gender: user.gender,
      birth_date: user.birth_date,
      isValid
    });
    
    return isValid;
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
    
    console.log('Datos de registro de negocio:', registrationData);
    console.log('BusinessData actual:', this.businessData());
    console.log('UserData actual:', this.userData());
    console.log('BannerImage actual:', this.bannerImage());
    
    // Llamada real al endpoint de registro
    const url = `${this.apiUrl}api/businesses/register-user-business`;
    return this.http.post(url, registrationData).pipe(
      catchError(error => {
        console.error('Error en el registro:', error);
        
        let errorMessage = 'Error al registrar el negocio';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 409) {
          errorMessage = 'Ya existe un usuario con estos datos';
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos. Por favor verifica la información';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor. Inténtalo más tarde';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        }
        
        return throwError(() => ({ ...error, userMessage: errorMessage }));
      })
    );
  }
}