import { Component, Output, EventEmitter, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faGift, faCalendarAlt, faUser, faStore, faSearch } from '@fortawesome/free-solid-svg-icons';
import { BusinessService } from '../../../core/services/business.service';
import { AvailableReward, ClaimRewardResponse, MilestoneData } from 'src/app/core/interfaces/reward-catalog.interface';

@Component({
  selector: 'app-reward-delivery-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  templateUrl: './reward-delivery-modal.component.html',
  styleUrls: ['./reward-delivery-modal.component.scss']
})
export class RewardDeliveryModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() searchCode = new EventEmitter<string>();
  @Output() deliverReward = new EventEmitter<{ code: string, rewardId: number }>();
  @Output() rewardDelivered = new EventEmitter<void>();

  // Inyección del servicio
  private businessService = inject(BusinessService);

  // Signals para el estado del componente
  isVisible = signal<boolean>(false);
  rewardCode = signal<string>('');
  milestoneData = signal<MilestoneData | null>(null);
  selectedReward = signal<AvailableReward | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Font Awesome icons
  faTimes = faTimes;
  faGift = faGift;
  faCalendarAlt = faCalendarAlt;
  faUser = faUser;
  faStore = faStore;
  faSearch = faSearch;

  // Computed para verificar si se puede entregar el premio
  canDeliverReward = computed(() => {
    const milestone = this.milestoneData();
    const selected = this.selectedReward();
    return milestone && selected && !milestone.isUsed && !this.isExpired();
  });

  // Computed para formatear la fecha de expiración
  formattedExpirationDate = computed(() => {
    const milestone = this.milestoneData();
    if (!milestone?.expiresAt) return 'Sin fecha de expiración';
    
    const date = new Date(milestone.expiresAt);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  // Computed para verificar si el código está expirado
  isExpired = computed(() => {
    const milestone = this.milestoneData();
    if (!milestone?.expiresAt) return false;
    return new Date(milestone.expiresAt) < new Date();
  });

  // Computed para obtener el nombre completo del usuario
  userFullName = computed(() => {
    const milestone = this.milestoneData();
    if (!milestone?.user) return '';
    return `${milestone.user.first_name} ${milestone.user.last_name}`;
  });

  // Métodos públicos para controlar el modal desde el componente padre
  show(): void {
    this.isVisible.set(true);
    this.resetForm();
  }

  hide(): void {
    this.isVisible.set(false);
    this.resetForm();
  }

  setMilestoneData(data: MilestoneData | null): void {
    this.milestoneData.set(data);
    if (data && data.availableRewards.length === 1) {
      // Si solo hay un premio disponible, seleccionarlo automáticamente
      this.selectedReward.set(data.availableRewards[0]);
    }
  }

  setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  setError(error: string | null): void {
    this.error.set(error);
  }

  // Métodos del componente
  onSearchCode(): void {
    const code = this.rewardCode().trim();
    if (code) {
      this.setLoading(true);
      this.setError(null);
      
      this.businessService.searchRewardCode(code).subscribe({
        next: (response: { success: boolean; data: MilestoneData }) => {
          if (response.success) {
            this.setMilestoneData(response.data);
          } else {
            this.setError('Código de premio no encontrado');
          }
          this.setLoading(false);
        },
        error: (error: any) => {
          let errorMessage = 'Error al buscar el código';
          if (error.status === 404) {
            errorMessage = 'Código de premio no encontrado';
          } else if (error.status === 400) {
            errorMessage = 'Código de premio inválido';
          }
          this.setError(errorMessage);
          this.setLoading(false);
        }
      });
    }
  }

  onSelectReward(reward: AvailableReward): void {
    this.selectedReward.set(reward);
  }

  onConfirmDelivery(): void {
    const selectedReward = this.selectedReward();
    const rewardCode = this.rewardCode();
    if (selectedReward && rewardCode) {
      this.setLoading(true);
      this.setError(null);
      
      this.businessService.claimReward(rewardCode, selectedReward.id).subscribe({
        next: (response: ClaimRewardResponse) => {
          if (response.success) {
            // Cerrar modal y mostrar mensaje de éxito
            this.hide();
            // Emitir evento para notificar que el premio fue entregado
            this.rewardDelivered.emit();
          } else {
            this.setError('Error al entregar el premio');
          }
          this.setLoading(false);
        },
        error: (error: any) => {
          let errorMessage = 'Error al entregar el premio';
          if (error.status === 404) {
            errorMessage = 'Premio no encontrado';
          } else if (error.status === 400) {
            errorMessage = 'Premio no disponible o ya entregado';
          }
          this.setError(errorMessage);
          this.setLoading(false);
        }
      });
    }
  }

  closeModal(): void {
    this.hide();
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  private resetForm(): void {
    this.rewardCode.set('');
    this.milestoneData.set(null);
    this.selectedReward.set(null);
    this.error.set(null);
  }
}