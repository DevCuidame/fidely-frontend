import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BusinessRegistryService } from '../../services/business-registry.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { AlertService } from '../../../../core/services/alert.service';
import { StepIndicatorComponent } from '../../components/step-indicator/step-indicator.component';
import { BasicInfoStepComponent } from '../../components/basic-info-step/basic-info-step.component';
import { ContactInfoStepComponent } from '../../components/contact-info-step/contact-info-step.component';
import { UserInfoStepComponent } from '../../components/user-info-step/user-info-step.component';
import { ConfirmationStepComponent } from '../../components/confirmation-step/confirmation-step.component';

@Component({
  selector: 'app-business-register',
  standalone: true,
  imports: [
    CommonModule,
    StepIndicatorComponent,
    BasicInfoStepComponent,
    ContactInfoStepComponent,
    UserInfoStepComponent,
    ConfirmationStepComponent
  ],
  templateUrl: './business-register.component.html',
  styleUrls: ['./business-register.component.scss']
})
export class BusinessRegisterComponent implements OnInit {
  private router = inject(Router);
  private businessRegistryService = inject(BusinessRegistryService);
  private loadingService = inject(LoadingService);
  private alertService = inject(AlertService);
  
  currentStep = this.businessRegistryService.currentStep;
  totalSteps = signal(4);
  isSubmitting = signal(false);
  
  // Computed para determinar si se puede avanzar al siguiente paso
  canProceedToNext = computed(() => {
    const step = this.currentStep();
    return this.businessRegistryService.isStepValid(step);
  });
  
  // Computed para determinar si estamos en el último paso
  isLastStep = computed(() => {
    return this.currentStep() === this.totalSteps();
  });
  
  // Computed para determinar si estamos en el primer paso
  isFirstStep = computed(() => {
    return this.currentStep() === 1;
  });
  
  // Computed para el texto del botón
  buttonText = computed(() => {
    return this.isLastStep() ? 'Guardar' : 'Siguiente';
  });
  
  ngOnInit() {
    // Resetear el formulario al inicializar
    this.businessRegistryService.resetForm();
  }
  
  onPreviousStep() {
    if (!this.isFirstStep()) {
      this.businessRegistryService.previousStep();
    }
  }
  
  async onNextStep() {
    if (!this.canProceedToNext()) {
      await this.alertService.showInfoAlert(
        'Información incompleta',
        'Por favor, completa todos los campos obligatorios antes de continuar.'
      );
      return;
    }
    
    if (this.isLastStep()) {
      await this.submitRegistration();
    } else {
      this.businessRegistryService.nextStep();
    }
  }
  
  private async submitRegistration() {
    try {
      this.isSubmitting.set(true);
      await this.loadingService.showLoading('Registrando negocio...');
      
      this.businessRegistryService.submitBusinessRegistration().subscribe({
        next: async (result) => {
          if (result.success) {
            this.isSubmitting.set(false);
            await this.loadingService.hideLoading();
            
            await this.alertService.showSuccessAlert(
              'Tu negocio ha sido registrado correctamente. Recibirás una confirmación por correo electrónico.'
            );
            
            // Redirigir al login después del registro exitoso
            setTimeout(() => {
              this.router.navigate(['/auth/login']);
            }, 2000);
          } else {
            throw new Error(result.message || 'Error al registrar el negocio');
          }
        },
        error: async (error: any) => {
          console.error('Error submitting registration:', error);
          // Resetear el estado inmediatamente para liberar la UI
          this.isSubmitting.set(false);
          await this.loadingService.hideLoading();
          
          // Mostrar el error después de resetear el estado
          const errorMessage = error.userMessage || error.error?.message || error.message || 'Ocurrió un error al registrar tu negocio. Por favor, inténtalo de nuevo.';
          await this.alertService.showErrorAlert(errorMessage);
        },
        complete: () => {
          // Solo resetear si no se ha reseteado ya en el error
          if (this.isSubmitting()) {
            this.isSubmitting.set(false);
            this.loadingService.hideLoading();
          }
        }
      });
    } catch (error: any) {
      console.error('Error submitting registration:', error);
      const errorMessage = error.userMessage || error.error?.message || error.message || 'Ocurrió un error al registrar tu negocio. Por favor, inténtalo de nuevo.';
      await this.alertService.showErrorAlert(errorMessage);
      this.isSubmitting.set(false);
      await this.loadingService.hideLoading();
    }
  }
  
  onStepClick(step: number) {
    
    // Permitir navegar solo a pasos anteriores o al paso actual
    if (step <= this.currentStep()) {
      this.businessRegistryService.goToStep(step);
    }
  }
}