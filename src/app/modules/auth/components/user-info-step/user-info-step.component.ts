import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessRegistryService } from '../../services/business-registry.service';

@Component({
  selector: 'app-user-info-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-info-step.component.html',
  styleUrls: ['./user-info-step.component.scss']
})
export class UserInfoStepComponent implements OnInit {
  private fb = inject(FormBuilder);
  private businessRegistryService = inject(BusinessRegistryService);
  
  userInfoForm!: FormGroup;
  
  // Opciones para los selects
  identificationTypes = signal([
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PP', label: 'Pasaporte' },
    { value: 'NIT', label: 'NIT' }
  ]);
  
  genderOptions = signal([
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'O', label: 'Otro' },
    { value: 'N', label: 'Prefiero no decir' }
  ]);
  
  // Computed para validar si el formulario es válido
  isFormValid = computed(() => {
    return this.userInfoForm?.valid || false;
  });
  
  ngOnInit() {
    this.initializeForm();
    this.loadExistingData();
  }
  
  private initializeForm() {
    this.userInfoForm = this.fb.group({
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$')
      ]],
      last_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$')
      ]],
      identification_type: ['', [Validators.required]],
      identification_number: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.pattern('^[0-9]+$')
      ]],
      gender: ['', [Validators.required]],
      birth_date: ['', [Validators.required, this.ageValidator]]
    });
    
    // Suscribirse a cambios del formulario
    this.userInfoForm.valueChanges.subscribe(() => {
      this.saveFormData();
    });
  }
  
  private ageValidator(control: any) {
    if (!control.value) return null;
    
    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 < 18 ? { minAge: true } : null;
    }
    
    return age < 18 ? { minAge: true } : null;
  }
  
  private loadExistingData() {
    const userData = this.businessRegistryService.userData();
    
    if (userData) {
      this.userInfoForm.patchValue({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        identification_type: userData.identification_type || '',
        identification_number: userData.identification_number || ''
      });
    }
  }
  
  private saveFormData() {
    if (this.userInfoForm.valid) {
      const formValue = this.userInfoForm.value;
      
      this.businessRegistryService.updateUserData({
        first_name: formValue.first_name,
        last_name: formValue.last_name,
        identification_type: formValue.identification_type,
        identification_number: formValue.identification_number
      });
    }
  }
  
  getFieldError(fieldName: string): string {
    const field = this.userInfoForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (field?.hasError('minLength')) {
      const minLength = field.errors?.['minLength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    
    if (field?.hasError('maxLength')) {
      const maxLength = field.errors?.['maxLength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    
    if (field?.hasError('pattern')) {
      if (fieldName === 'first_name' || fieldName === 'last_name') {
        return 'Solo se permiten letras y espacios';
      }
      if (fieldName === 'identification_number') {
        return 'Solo se permiten números';
      }
    }
    
    if (field?.hasError('minAge')) {
      return 'Debe ser mayor de 18 años';
    }
    
    return '';
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userInfoForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }
  
  // Método para obtener la fecha máxima (18 años atrás)
  getMaxDate(): string {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  }
}