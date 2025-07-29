import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGift, faStamp, faStar } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { MilestoneRewardsService } from 'src/app/core/services/milestone-rewards.service';
import { RedeemCardComponent } from '../../../shared/components/redeem-card/redeem-card.component';
import { IAvailableReward, IMilestoneReward, IMilestoneRewardResponse } from 'src/app/core/interfaces/milestone-rewards.interface';

@Component({
  selector: 'app-redeem',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RedeemCardComponent],
  templateUrl: './redeem.component.html',
  styleUrls: ['./redeem.component.scss']
})
export class RedeemComponent implements OnInit {
  // Font Awesome icons
  faGift = faGift;
  faStamp = faStamp;
  faStar = faStar;
  
  // Inject services
  private authService = inject(AuthService);
  public milestoneRewardsService = inject(MilestoneRewardsService);
  
  // Service signals
  userData = computed(() => this.authService.currentUser());
  milestoneRewards = computed(() => this.milestoneRewardsService.milestoneRewards());
  availableRewards = computed(() => this.milestoneRewardsService.availableRewards());
  loading = computed(() => this.milestoneRewardsService.loading());
  error = computed(() => this.milestoneRewardsService.error());
  
  // Computed signal para verificar si hay premios disponibles
  hasAvailableRewards = computed(() => this.milestoneRewardsService.hasAvailableRewards());
  
  // Check if user has reached goal (si hay premios disponibles)
  isGoalReached = computed(() => this.hasAvailableRewards());
  
  ngOnInit() {
    // Cargar los premios del usuario
    this.milestoneRewardsService.loadMilestoneRewards();
  }
  
  getRewardForCard(milestoneReward: IMilestoneRewardResponse, reward: IAvailableReward): IMilestoneRewardResponse {
    return {
      id: milestoneReward.id,
      userId: milestoneReward.userId,
      businessId: milestoneReward.businessId,
      businessName: milestoneReward.businessName || 'Negocio',
      milestoneType: milestoneReward.milestoneType,
      rewardCode: milestoneReward.rewardCode,
      isUsed: milestoneReward.isUsed,
      usedAt: milestoneReward.usedAt,
      expiresAt: milestoneReward.expiresAt,
      createdAt: milestoneReward.createdAt,
      availableRewards: [reward]
    } as IMilestoneRewardResponse;
  }
  
  getEmptyReward(): IMilestoneRewardResponse {
    return {
      id: 0,
      userId: this.userData()?.id || 0,
      businessId: 1,
      businessName: 'Negocio Actual',
      milestoneType: 'points_0',
      rewardCode: 'NO_REWARD',
      isUsed: false,
      expiresAt: new Date(),
      createdAt: new Date(),
      availableRewards: [{
        id: 0,
        name: 'No hay premios disponibles',
        description: 'Completa más actividades para desbloquear premios',
        pointsRequired: 0,
        imageUrl: 'assets/images/hamb.png',
        rewardType: 'empty',
        isActive: false
      }]
    } as IMilestoneRewardResponse;
  }
  
  onRedeemReward(milestoneRewardResponse: IMilestoneRewardResponse) {
    // Lógica para redimir recompensa
    console.log('Redimiendo recompensa:', milestoneRewardResponse);
    
    if (milestoneRewardResponse && !milestoneRewardResponse.isUsed) {
      console.log('Premio válido para redimir:', {
        id: milestoneRewardResponse.id,
        rewardCode: milestoneRewardResponse.rewardCode,
        businessName: milestoneRewardResponse.businessName,
        availableRewards: milestoneRewardResponse.availableRewards
      });
      
      // TODO: Implementar lógica de redención con endpoint específico
      // Ejemplo: this.milestoneRewardsService.redeemReward(milestoneRewardResponse.rewardCode)
    } else {
      console.warn('Premio no válido o ya usado');
    }
  }
  
  canRedeem(sellosRequeridos: number): boolean {
    const user = this.userData();
    // TODO: Conectar con el sistema real de sellos cuando esté disponible
    // return (user?.sellos || 0) >= sellosRequeridos;
    return true;
  }
}