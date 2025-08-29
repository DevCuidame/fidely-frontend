import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessRegistryService } from '../../services/business-registry.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-confirmation-step',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-step.component.html',
  styleUrls: ['./confirmation-step.component.scss']
})
export class ConfirmationStepComponent implements OnInit {
  private businessRegistryService = inject(BusinessRegistryService);
  private locationService = inject(LocationService);
  
  businessData = this.businessRegistryService.businessData;
  userData = this.businessRegistryService.userData;
  bannerImage = this.businessRegistryService.bannerImage;
  
  cityName = signal<string>('');
  departmentName = signal<string>('');
  
  // Mapeo de tipos de identificación
  identificationTypeMap = {
    'CC': 'Cédula de Ciudadanía',
    'CE': 'Cédula de Extranjería',
    'TI': 'Tarjeta de Identidad',
    'PP': 'Pasaporte',
    'NIT': 'NIT'
  };
  
  // Mapeo de géneros
  genderMap = {
    'M': 'Masculino',
    'F': 'Femenino',
    'O': 'Otro',
    'N': 'Prefiero no decir'
  };
  
  // Computed para verificar si todos los datos están completos
  isDataComplete = computed(() => {
    const business = this.businessData();
    const user = this.userData();
    
    return !!(business.business_name && 
             business.business_type && 
             business.tax_id && 
             business.email && 
             business.phone && 
             business.address_line1 && 
             user.first_name && 
             user.last_name && 
             user.identification_type && 
             user.identification_number && 
             user.city_id);
  });
  
  ngOnInit() {
    this.loadLocationData();
  }
  
  private loadLocationData() {
    const cityId = this.userData().city_id;
    if (cityId) {
      // Note: getCityById method doesn't exist in LocationService
      // Using cached cities data instead
      const cities = this.locationService.getCities();
      const city = cities.find((c: any) => c.id === cityId);
      this.cityName.set(city?.name || 'Ciudad no encontrada');
      if (city?.department_id) {
        this.loadDepartmentData(city.department_id);
      }
    }
  }
  
  private loadDepartmentData(departmentId: number) {
    // Note: getDepartmentById method doesn't exist in LocationService
    // Using cached departments data instead
    const departments = this.locationService.getDepartments();
    const department = departments.find((d: any) => d.id === departmentId);
    this.departmentName.set(department?.name || 'Departamento no encontrado');
  }
  
  getIdentificationTypeLabel(type: string): string {
    return this.identificationTypeMap[type as keyof typeof this.identificationTypeMap] || type;
  }
  
  getGenderLabel(gender: string): string {
    return this.genderMap[gender as keyof typeof this.genderMap] || gender;
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  formatPhone(phone: string): string {
    if (!phone) return '';
    // Formato: (300) 123-4567
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
}