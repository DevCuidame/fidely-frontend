import { Component, OnInit, signal, computed, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessRegistryService } from '../../services/business-registry.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-contact-info-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-info-step.component.html',
  styleUrls: ['./contact-info-step.component.scss']
})
export class ContactInfoStepComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  private fb = inject(FormBuilder);
  private businessRegistryService = inject(BusinessRegistryService);
  private locationService = inject(LocationService);
  
  contactInfoForm!: FormGroup;
  departments = signal<any[]>([]);
  cities = signal<any[]>([]);
  selectedImage = signal<string | null>(null);
  
  // Computed para validar si el formulario es válido
  isFormValid = computed(() => {
    return this.contactInfoForm?.valid || false;
  });
  
  ngOnInit() {
    this.initializeForm();
    this.loadDepartments();
    this.loadExistingData();
  }
  
  private initializeForm() {
    this.contactInfoForm = this.fb.group({
      phone: ['', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      website_url: ['', [Validators.pattern('^https?:\/\/.+')]],
      address_line1: ['', [Validators.required, Validators.maxLength(200)]],
      department: [null, [Validators.required]],
      city_id: [null, [Validators.required]]
    });
    
    // Suscribirse a cambios del formulario
    this.contactInfoForm.valueChanges.subscribe(() => {
      this.saveFormData();
    });
    
    // Suscribirse a cambios del departamento
    this.contactInfoForm.get('department')?.valueChanges.subscribe((departmentId) => {
      if (departmentId) {
        this.loadCities(departmentId);
        this.contactInfoForm.get('city_id')?.setValue(null);
      }
    });
  }
  
  private loadDepartments() {
    this.locationService.fetchDepartments();
    this.locationService.departments$.subscribe({
      next: (departments: any[]) => {
        this.departments.set(departments);
      },
      error: (error: any) => {
        console.error('Error loading departments:', error);
      }
    });
  }
  
  private loadCities(departmentId: number) {
    this.locationService.fetchCitiesByDepartment(departmentId);
    this.locationService.cities$.subscribe({
      next: (cities: any[]) => {
        this.cities.set(cities);
      },
      error: (error: any) => {
        console.error('Error loading cities:', error);
      }
    });
  }
  
  private loadExistingData() {
    const businessData = this.businessRegistryService.businessData();
    const userData = this.businessRegistryService.userData();
    const bannerImage = this.businessRegistryService.bannerImage();
    
    if (businessData || userData) {
      this.contactInfoForm.patchValue({
        phone: businessData.phone || '',
        website_url: businessData.website_url || '',
        address_line1: businessData.address_line1 || '',
        city_id: userData.city_id || null
      });
      
      // Cargar departamento si hay ciudad seleccionada
      if (userData.city_id) {
        this.loadDepartmentByCity(userData.city_id);
      }
    }
    
    if (bannerImage) {
      this.selectedImage.set(bannerImage);
    }
  }
  
  private loadDepartmentByCity(cityId: number) {
    // Note: getDepartmentByCity method doesn't exist in LocationService
    // This functionality would need to be implemented in the service
    console.log('Loading department for city:', cityId);
  }
  
  private saveFormData() {
    if (this.contactInfoForm.valid) {
      const formValue = this.contactInfoForm.value;
      
      // Actualizar datos del negocio
      this.businessRegistryService.updateBusinessData({
        phone: formValue.phone,
        website_url: formValue.website_url,
        address_line1: formValue.address_line1
      });
      
      // Actualizar datos del usuario
      this.businessRegistryService.updateUserData({
        city_id: formValue.city_id
      });
    }
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.selectedImage.set(result);
        this.businessRegistryService.updateBannerImage(result);
      };
      reader.readAsDataURL(file);
    }
  }
  
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  
  removeImage() {
    this.selectedImage.set(null);
    this.businessRegistryService.updateBannerImage('');
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
  
  getFieldError(fieldName: string): string {
    const field = this.contactInfoForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (field?.hasError('pattern')) {
      if (fieldName === 'phone') {
        return 'Debe ser un número de teléfono válido de 10 dígitos';
      }
      if (fieldName === 'website_url') {
        return 'Debe ser una URL válida (http:// o https://)';
      }
    }
    
    if (field?.hasError('minLength') || field?.hasError('maxLength')) {
      if (fieldName === 'phone') {
        return 'El teléfono debe tener exactamente 10 dígitos';
      }
    }
    
    if (field?.hasError('maxLength')) {
      return `Máximo ${field.errors?.['maxLength'].requiredLength} caracteres`;
    }
    
    return '';
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactInfoForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }
}