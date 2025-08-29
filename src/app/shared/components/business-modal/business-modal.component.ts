import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faTimes, 
  faMapMarkerAlt, 
  faPhone, 
  faEnvelope, 
  faBuilding,
  faChartLine,
  faImages
} from '@fortawesome/free-solid-svg-icons';
import { IBusinessResponse } from '../../../core/interfaces/business-registry.interface';

@Component({
  selector: 'app-business-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './business-modal.component.html',
  styleUrls: ['./business-modal.component.scss']
})
export class BusinessModalComponent {
  @Input() business: IBusinessResponse | null = null;
  @Input() isOpen = signal(false);
  @Output() closeModal = new EventEmitter<void>();

  // FontAwesome icons
  faTimes = faTimes;
  faMapMarkerAlt = faMapMarkerAlt;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faBuilding = faBuilding;
  faChartLine = faChartLine;
  faImages = faImages;

  // Computed properties
  hasContactInfo = computed(() => {
    const biz = this.business;
    return biz && (biz.phone || biz.email);
  });

  hasLocationInfo = computed(() => {
    const biz = this.business;
    return biz && (biz.address_line1 || biz.city_name || biz.department_name);
  });

  hasGallery = computed(() => {
    const biz = this.business;
    return biz && biz.gallery_images && biz.gallery_images.length > 0;
  });

  hasStats = computed(() => {
    const biz = this.business;
    return biz && biz.stats;
  });

  onClose() {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  formatPhone(phone: string): string {
    // Formato para números telefónicos colombianos (10 dígitos)
    const cleaned = phone.replace(/\D/g, '');
    
    // Si tiene 10 dígitos (formato colombiano estándar)
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    
    // Si tiene código de país (+57) y 10 dígitos adicionales
    if (cleaned.length === 12 && cleaned.startsWith('57')) {
      const localNumber = cleaned.substring(2);
      return localNumber.replace(/(\d{3})(\d{3})(\d{4})/, '+57 ($1) $2-$3');
    }
    
    // Para otros formatos, devolver el número limpio
    return cleaned;
  }

  getBusinessImage(): string {
    if (this.business?.banner_url) {
      return this.business.banner_url;
    }
    if (this.business?.logo_url) {
      return this.business.logo_url;
    }
    return 'assets/images/default-business.svg';
  }
}