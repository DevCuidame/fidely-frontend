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
    
    console.log('🔍 Verificando datos completos:');
    console.log('📊 Business data:', business);
    console.log('👤 User data:', user);
    
    const businessComplete = !!(business.business_name && 
                               business.business_type && 
                               business.tax_id && 
                               business.email && 
                               business.phone && 
                               business.address_line1);
    
    const userComplete = !!(user.first_name && 
                           user.last_name && 
                           user.identification_type && 
                           user.identification_number && 
                           user.gender && 
                           user.birth_date);
    
    console.log('✅ Business complete:', businessComplete);
    console.log('✅ User complete:', userComplete);
    console.log('📋 Missing business fields:', {
      business_name: !business.business_name,
      business_type: !business.business_type,
      tax_id: !business.tax_id,
      email: !business.email,
      phone: !business.phone,
      address_line1: !business.address_line1
    });
    console.log('📋 Missing user fields:', {
      first_name: !user.first_name,
      last_name: !user.last_name,
      identification_type: !user.identification_type,
      identification_number: !user.identification_number,
      gender: !user.gender,
      birth_date: !user.birth_date
    });
    
    const isComplete = businessComplete && userComplete;
    console.log('🎯 Final result - Data complete:', isComplete);
    
    return isComplete;
  });
  
  ngOnInit() {
    this.loadLocationData();
  }
  
  private loadLocationData() {
    const userData = this.userData();
    
    // Usar nombres guardados directamente
    if (userData.city_name && userData.department_name) {
      console.log('📍 Mostrando nombres guardados:', userData.city_name, userData.department_name);
      this.cityName.set(userData.city_name);
      this.departmentName.set(userData.department_name);
    } else {
      console.log('⚠️ No hay nombres de ciudad y departamento guardados');
      this.cityName.set('Ciudad no especificada');
      this.departmentName.set('Departamento no especificado');
    }
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