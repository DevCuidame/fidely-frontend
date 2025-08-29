import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessRegistryService } from '../../services/business-registry.service';

@Component({
  selector: 'app-basic-info-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './basic-info-step.component.html',
  styleUrls: ['./basic-info-step.component.scss']
})
export class BasicInfoStepComponent implements OnInit {
  private fb = inject(FormBuilder);
  private businessRegistryService = inject(BusinessRegistryService);
  
  basicInfoForm!: FormGroup;
  passwordVisible = signal<boolean>(false);
  confirmPasswordVisible = signal<boolean>(false);
  
  businessTypes = signal<string[]>([
    'Restaurante',
    'Tienda de ropa',
    'Supermercado',
    'Farmacia',
    'Peluquería',
    'Gimnasio',
    'Cafetería',
    'Panadería',
    'Ferretería',
    'Librería',
    'Otro'
  ]);
  
  // Computed para validar si el formulario es válido
  isFormValid = computed(() => {
    return this.basicInfoForm?.valid || false;
  });
  
  ngOnInit() {
    this.initializeForm();
    this.loadExistingData();
  }
  
  private initializeForm() {
    this.basicInfoForm = this.fb.group({
      business_name: ['', [Validators.required, Validators.maxLength(100)]],
      business_type: ['', [Validators.required]],
      tax_id: ['', [Validators.required, Validators.pattern('^[0-9-]+$'), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password_hash: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(50),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    // Suscribirse a cambios del formulario
    this.basicInfoForm.valueChanges.subscribe(() => {
      this.saveFormData();
    });
  }
  
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password_hash');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    if (confirmPassword?.hasError('mismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }
  
  private loadExistingData() {
    const businessData = this.businessRegistryService.businessData();
    const userData = this.businessRegistryService.userData();
    
    if (businessData || userData) {
      this.basicInfoForm.patchValue({
        business_name: businessData.business_name || '',
        business_type: businessData.business_type || '',
        tax_id: businessData.tax_id || '',
        email: userData.email || '',
        password_hash: userData.password_hash || ''
      });
    }
  }
  
  private saveFormData() {
    if (this.basicInfoForm.valid) {
      const formValue = this.basicInfoForm.value;
      
      // Actualizar datos del negocio
      this.businessRegistryService.updateBusinessData({
        business_name: formValue.business_name,
        business_type: formValue.business_type,
        tax_id: formValue.tax_id
      });
      
      // Actualizar datos del usuario
      this.businessRegistryService.updateUserData({
        email: formValue.email,
        password_hash: formValue.password_hash
      });
    }
  }
  
  togglePasswordVisibility() {
    this.passwordVisible.update(visible => !visible);
  }
  
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible.update(visible => !visible);
  }
  
  getFieldError(fieldName: string): string {
    const field = this.basicInfoForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (field?.hasError('email')) {
      return 'Ingrese un correo electrónico válido';
    }
    
    if (field?.hasError('maxLength')) {
      return `Máximo ${field.errors?.['maxLength'].requiredLength} caracteres`;
    }
    
    if (field?.hasError('minLength')) {
      return `Mínimo ${field.errors?.['minLength'].requiredLength} caracteres`;
    }
    
    if (field?.hasError('pattern')) {
      if (fieldName === 'tax_id') {
        return 'Solo se permiten números y guiones';
      }
      if (fieldName === 'password_hash') {
        return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
      }
    }
    
    if (field?.hasError('mismatch')) {
      return 'Las contraseñas no coinciden';
    }
    
    return '';
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.basicInfoForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }
}