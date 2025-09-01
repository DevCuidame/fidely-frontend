import { Component, signal, computed, inject, OnInit, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeroSectionComponent } from '../../../shared/components/hero-section/hero-section.component';
import { BusinessService } from '../../../core/services/business.service';
import { CustomerCardComponent } from 'src/app/shared/components/user-profile/customer-card.component';
import { ToastService } from '../../../core/services/toast/toast.service';
import { RewardDeliveryModalComponent } from '../../../shared/components/reward-delivery-modal/reward-delivery-modal.component';
import { AvailableReward } from 'src/app/core/interfaces/reward-catalog.interface';

@Component({
  selector: 'app-business-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HeroSectionComponent, CustomerCardComponent, RewardDeliveryModalComponent],
  templateUrl: './business-home.component.html',
  styleUrls: ['./business-home.component.scss']
})
export class BusinessHomeComponent implements OnInit {
  private businessService = inject(BusinessService);
  private toastService = inject(ToastService);
  
  // Referencia al modal de entrega de premios
  @ViewChild('rewardModal') rewardModal!: RewardDeliveryModalComponent;
  
  // Signals para los datos del negocio
  businessName = signal<string>('');
  businessType = signal<string>('');
  bannerUrl = signal<string>('');
  logoUrl = signal<string>('');
  isLoadingBusiness = signal<boolean>(false);
  
  // Signals para búsqueda de clientes
  searchDocumentNumber = signal<string>('');
  searchedCustomer = computed(() => this.businessService.searchedCustomer());
  isLoadingCustomerSearch = computed(() => this.businessService.loadingCustomerSearch());
  customerSearchError = computed(() => this.businessService.customerSearchError());
  
  // Signal computed para mostrar si hay un cliente encontrado
  hasFoundCustomer = computed(() => !!this.searchedCustomer());
  
  // Signals para el sistema de premios
  rewardCatalog = computed(() => this.businessService.rewardCatalog());
  loadingRewardCatalog = computed(() => this.businessService.loadingRewardCatalog());
  milestoneData = computed(() => this.businessService.milestoneData());
  loadingMilestone = computed(() => this.businessService.loadingMilestone());
  rewardDeliveryState = computed(() => this.businessService.rewardDeliveryState());
  
  // Signal para el premio seleccionado
  selectedReward = signal<AvailableReward | null>(null);
  
  // Computed signal para verificar si hay premios disponibles
  isPrizeAvailable = computed(() => {
    const userBusiness = this.businessService.userBusiness();
    return !!userBusiness && !this.loadingRewardCatalog();
  });
  
  // Transform customer data for customer-card component
  customerCardData = computed(() => {
    const customer = this.searchedCustomer();
    if (!customer) return null;
    
    return {
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      phone: customer.phone || undefined,
      memberSince: 'Cliente registrado',
      totalStamps: customer.business_points?.available_points || 0,
      avatar: undefined,
      profile_image_url: customer.profile_image_url
    };
  });
  
  constructor(private router: Router) {
    // Effect para monitorear datos del negocio
    effect(() => {
      const businessData = this.businessService.userBusiness();
      const loading = this.businessService.loadingUserBusiness();
      const error = this.businessService.error();
      
      // Actualizar el estado de carga
      this.isLoadingBusiness.set(loading);
      
      if (loading) {
      } else if (error) {
        this.toastService.error('Error al cargar los datos del negocio');
      } else if (businessData) {
        
        // Actualizar los signals con los datos del negocio
        this.businessName.set(businessData.business_name || '');
        this.businessType.set(businessData.business_type || '');
        this.bannerUrl.set(businessData.banner_url || '');
        this.logoUrl.set(businessData.logo_url || '');
        
        // Cargar catálogo de premios cuando se obtiene el negocio
        this.businessService.loadRewardCatalog(businessData.id);
      }
    });

    // Effect para monitorear búsqueda de clientes
    effect(() => {
      const customer = this.searchedCustomer();
      const loading = this.isLoadingCustomerSearch();
      const error = this.customerSearchError();
      
      if (!loading && error) {
        this.toastService.error(`Error al buscar cliente: ${error}`);
      } else if (!loading && customer) {
        this.toastService.success(`Cliente encontrado: ${customer.first_name} ${customer.last_name}`);
      }
    });
    
    // Effect para manejar el estado de entrega de premios
    effect(() => {
      const deliveryState = this.rewardDeliveryState();
      
      if (deliveryState.error) {
        this.toastService.error(deliveryState.error);
      } else if (deliveryState.success) {
        this.toastService.success('¡Premio entregado exitosamente!');
        // Limpiar el estado después de mostrar el éxito
        setTimeout(() => {
          this.businessService.clearRewardDeliveryState();
          this.selectedReward.set(null);
        }, 2000);
      }
    });
  }

  ngOnInit(): void {
    this.loadUserBusinessData();
  }

  /**
   * Carga los datos del negocio del usuario logueado
   */
  private loadUserBusinessData(): void {
    // Cargar los datos del negocio
    this.businessService.loadUserBusiness();
  }
  
  // Handle stamp card action with form data
  onStampCard(formData: {purchaseAmount: number, description: string, invoiceNumber: string}): void {
    // La lógica de creación de transacción se maneja en customer-card.component.ts
  }
  
  // Handle transaction completed event
  onTransactionCompleted(): void {
    this.toastService.success('¡Transacción completada exitosamente!');
    // Resetear el estado completo después de sellar
    this.resetCompleteState();
  }
  
  // Reset complete state after successful stamping
  private resetCompleteState(): void {
    // Limpiar búsqueda de cliente
    this.searchDocumentNumber.set('');
    // Limpiar cliente encontrado
    this.businessService.clearCustomerSearch();
  }
  
  /**
   * Abre el modal de entrega de premios
   */
  onDeliverReward(): void {
    this.rewardModal.show();
  }

  /**
   * Se ejecuta cuando se confirma la entrega de un premio
   * Resetea la búsqueda de cliente
   */
  onRewardDelivered(): void {
    this.onClearCustomerSearch();
  }

  /**
   * Busca un cliente por número de documento
   */
  onSearchCustomer(): void {
    const documentNumber = this.searchDocumentNumber().trim();
    if (documentNumber) {
      this.businessService.searchCustomer(documentNumber);
    } else {
      this.toastService.warning('Por favor ingresa un número de documento válido');
    }
  }

  /**
   * Limpia la búsqueda de cliente
   */
  onClearCustomerSearch(): void {
    this.searchDocumentNumber.set('');
    this.businessService.clearCustomerSearch();
    this.toastService.info('Búsqueda de cliente limpiada');
  }

  /**
   * Actualiza el valor del input de búsqueda
   */
  onSearchInputChange(value: string): void {
    this.searchDocumentNumber.set(value);
  }
  
  // Navigation methods for header links
  navigateToHome(): void {
    this.router.navigate(['/admin-home']);
  }
  
  navigateToPromos(): void {
    this.router.navigate(['/admin/promos']);
  }
  
  navigateToClients(): void {
    this.router.navigate(['/admin/clients']);
  }
  
  navigateToRewards(): void {
    this.router.navigate(['/admin/rewards']);
  }
  
  // Track which card is expanded
  expandedCardId = signal<string | null>(null);
  
  // Check if a specific card is expanded
  isCardExpanded(cardId: string): boolean {
    return this.expandedCardId() === cardId;
  }
  
  // Handle card expansion toggle
  onCardExpansionToggle(cardId: string): void {
    if (this.expandedCardId() === cardId) {
      this.expandedCardId.set(null);
    } else {
      this.expandedCardId.set(cardId);
    }
  }
  
  // TrackBy function for ngFor optimization
  trackByCardId(index: number, card: any): string {
    return card.id;
  }
}