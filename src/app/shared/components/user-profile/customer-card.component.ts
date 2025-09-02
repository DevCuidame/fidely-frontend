import { Component, Input, Output, EventEmitter, signal, computed, OnInit, OnChanges, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';
import { ButtonCodeComponent } from '../button-code/button-code.component';
import { TransactionService, CreateTransactionRequest } from '../../../core/services/transaction.service';
import { BusinessService } from '../../../core/services/business.service';
import { DealModalComponent } from '../../../modules/business/components/deal-modal/deal-modal.component';

interface UserStamp {
  id: number;
  collected: boolean;
}

interface UserInfo {
  name: string;
  email: string;
  phone?: string;
  memberSince?: string;
  totalStamps?: number;
  avatar?: string;
  profile_image_url?: string;
  business_points?: {
    business_id: number;
    total_points: number;
    available_points: number;
    lifetime_points: number;
    required_points: number;
    has_active_deal: boolean;
    last_transaction_date?: Date;
  };
}

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule, ButtonCodeComponent, FontAwesomeModule, DealModalComponent],
  templateUrl: './customer-card.component.html',
  styleUrls: ['./customer-card.component.scss']
})
export class CustomerCardComponent implements OnInit, OnChanges {
  @Input() userInfo: UserInfo = {
    name: 'Leonardo Robles',
    email: 'leonardo@example.com',
    phone: '+57 300 123 4567',
    memberSince: 'Enero 2024',
    totalStamps: 7
  };
  
  @Output() stampCard = new EventEmitter<{purchaseAmount: number, description: string, invoiceNumber: string}>();
  @Output() deliverReward = new EventEmitter<void>();
  @Output() transactionCompleted = new EventEmitter<void>();
  @Output() dealCreated = new EventEmitter<void>();
  
  @ViewChild('dealModal') dealModal!: DealModalComponent;

  // Font Awesome icons
  faHandshake = faHandshake;
  
  // Signals para las stamps - se generan basadas en totalStamps
  stamps = signal<UserStamp[]>([]);
  
  // Computed property para verificar si el premio está disponible
  isPrizeAvailable = computed(() => {
    const businessPoints = this.userInfo.business_points;
    if (!businessPoints || !businessPoints.has_active_deal) return false;
    return businessPoints.available_points >= businessPoints.required_points;
  });
  
  // Computed property para verificar si el botón de sellar debe estar desactivado
  isStampButtonDisabled = computed(() => {
    const businessPoints = this.userInfo.business_points;
    if (!businessPoints || !businessPoints.has_active_deal) return true; // Desactivar si no hay deal activo
    return businessPoints.available_points >= businessPoints.required_points;
  });

  isDealButtonDisabled = computed(() => {
    return this.userInfo.business_points?.has_active_deal || false;
  });
  
  ngOnInit() {
    this.updateStamps();
  }
  
  ngOnChanges() {
    this.updateStamps();
  }
  
  private updateStamps() {
    const businessPoints = this.userInfo.business_points;
    const currentVisits = businessPoints?.available_points || 0;
    const requiredVisits = businessPoints?.required_points || 10;
    const stampsArray: UserStamp[] = [];
    
    for (let i = 1; i <= requiredVisits; i++) {
      stampsArray.push({
        id: i,
        collected: i <= currentVisits
      });
    }
    
    this.stamps.set(stampsArray);
  }
  
  private transactionService = inject(TransactionService);
  private businessService = inject(BusinessService);

  onStampCard(formData: {purchaseAmount: number, description: string, invoiceNumber: string}) {
    const userBusiness = this.businessService.userBusiness();
    const searchedCustomer = this.businessService.searchedCustomer();
    
    if (!userBusiness || !searchedCustomer) {
      console.error('Faltan datos del negocio o cliente');
      return;
    }

    const transactionData: CreateTransactionRequest = {
      userId: searchedCustomer.id,
      businessId: userBusiness.id,
      type: 'earn',
      points: 1,
      purchaseAmount: formData.purchaseAmount,
      currency: 'COP',
      description: formData.description,
      invoiceNumber: formData.invoiceNumber
    };

    this.transactionService.createTransaction(transactionData).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Transacción creada exitosamente:', response.data);
          this.transactionCompleted.emit();
        } else {
          console.error('Error en la transacción:', response.message);
        }
      },
      error: (error) => {
        console.error('Error al crear transacción:', error);
      }
    });
    
    this.stampCard.emit(formData);
  }
  
  onDeliverReward() {
    this.deliverReward.emit();
  }

  onMakeDeal() {
    console.log('Opening deal modal for customer:', this.userInfo);
    this.dealModal.show();
  }

  onDealCreated() {
    console.log('Deal created successfully');
    // Emitir evento para notificar al componente padre
    this.dealCreated.emit();
  }

  onDealModalClosed() {
    console.log('Deal modal closed');
    // Aquí se puede agregar lógica adicional cuando se cierre el modal
  }
  
  constructor() {}
}