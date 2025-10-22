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
  imageWidth = signal<number | null>(null);
  imageHeight = signal<number | null>(null);

  // Advertencia de dimensiones basada en mínimos y proporción 3:1
  dimensionWarning = computed(() => {
    const w = this.imageWidth();
    const h = this.imageHeight();
    if (!w || !h) return '';
    const minW = 1024;
    const minH = 341;
    const ratio = w / h;
    const ratioTolerance = 0.15; // ~5% margen
    if (w < minW || h < minH) {
      return 'La imagen es menor al mínimo aceptable (1024x341).';
    }
    if (Math.abs(ratio - 3) > ratioTolerance) {
      return 'Tu imagen no tiene proporción 3:1; se recomienda 1920x640 o 1600x533.';
    }
    return '';
  });
  
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
      city_id: [null, [Validators.required]],
      banner: ['', [Validators.required]]
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
      
      // Si hay nombres guardados, buscar y seleccionar el departamento correspondiente
      if (userData.department_name && userData.city_name) {
        this.loadDepartments();
        
        // Esperar a que se carguen los departamentos y luego seleccionar
        this.locationService.departments$.subscribe(departments => {
          const department = departments.find(d => d.name === userData.department_name);
          if (department) {
            this.contactInfoForm.patchValue({ department: department.id });
            this.loadCities(department.id);
            
            // Esperar a que se carguen las ciudades y luego seleccionar
            this.locationService.cities$.subscribe(cities => {
              const city = cities.find(c => c.name === userData.city_name);
              if (city) {
                this.contactInfoForm.patchValue({ city_id: city.id });
              }
            });
          }
        });
      } else if (userData.city_id) {
        // Fallback: cargar por ID si no hay nombres
        this.loadDepartmentByCity(userData.city_id);
      }
    }
    
    if (bannerImage) {
      this.selectedImage.set(bannerImage);
      this.contactInfoForm.get('banner')?.setValue(bannerImage);
      // No tenemos dimensiones previas guardadas; se calcularán con nueva selección
    } else {
      this.contactInfoForm.get('banner')?.setValue('');
    }
  }
  
  private loadDepartmentByCity(cityId: number) {
  }
  
  onDepartmentChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const departmentId = parseInt(target.value);
    
    if (departmentId) {
      // Cargar ciudades del departamento seleccionado
      this.loadCities(departmentId);
      
      // Limpiar la selección de ciudad
      this.contactInfoForm.patchValue({ city_id: '' });
      
      // Guardar datos automáticamente
      this.saveFormData();
    }
  }
  
  onCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const cityId = target.value;
    
    if (cityId) {
      // Guardar datos automáticamente cuando se selecciona una ciudad
      this.saveFormData();
    }
  }
  
  private saveFormData() {
    const formValue = this.contactInfoForm.value;
    
    // Encontrar el nombre de la ciudad y departamento seleccionados
    const selectedCity = this.cities().find(city => city.id == formValue.city_id);
    const selectedDepartment = this.departments().find(dept => dept.id == formValue.department);
    
    // Actualizar datos del negocio
    this.businessRegistryService.updateBusinessData({
      phone: formValue.phone || '',
      website_url: formValue.website_url || '',
      address_line1: formValue.address_line1 || ''
    });
    
    // Actualizar datos del usuario con nombres de ciudad y departamento
    this.businessRegistryService.updateUserData({
      city_id: formValue.city_id || '',
      city_name: selectedCity?.name || '',
      department_name: selectedDepartment?.name || '',
      address: formValue.address_line1 || ''
    });
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
        // Calcular dimensiones
        const img = new Image();
        img.onload = () => {
          this.imageWidth.set(img.width);
          this.imageHeight.set(img.height);
        };
        img.src = result;
        
        this.selectedImage.set(result);
        this.businessRegistryService.updateBannerImage(result);
        this.contactInfoForm.get('banner')?.setValue(result);
      };
      reader.readAsDataURL(file);
    }
  }
  
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  
  removeImage() {
    this.selectedImage.set(null);
    this.imageWidth.set(null);
    this.imageHeight.set(null);
    this.businessRegistryService.updateBannerImage('');
    this.contactInfoForm.get('banner')?.setValue('');
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