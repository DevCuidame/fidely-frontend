import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGift, faStamp, faStar } from '@fortawesome/free-solid-svg-icons';
import { DashboardService } from '../user-home/home.service';
import { RedeemCardComponent, RedeemReward } from '../../../shared/components/redeem-card/redeem-card.component';

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
  
  // Inject dashboard service
  private dashboardService = inject(DashboardService);
  
  // Service signals
  recompensas = this.dashboardService.recompensas;
  userData = this.dashboardService.userData;
  activeSellos = this.dashboardService.activeSellos;
  availableRecompensas = this.dashboardService.availableRecompensas;
  
  // Redeem reward data
  redeemReward = signal<RedeemReward>({
    id: '1',
    title: 'Llegaste a la meta',
    description: 'Redime tu premio',
    code: 'QWERTYU12345',
    image: 'assets/images/hamb.png',
    validFor: '1 combo de hamburguesa, papas y bebida',
    expiryDate: '2025-Dic-12',
    backgroundImage: 'assets/images/hamb.png'
  });
  
  // Check if user has reached goal (example: 10 stamps)
  isGoalReached = computed(() => {
    return this.userData().sellos >= 10;
  });
  
  ngOnInit() {
    this.dashboardService.loadUserData();
  }
  
  onRedeemReward(recompensaId: string) {
    // Lógica para redimir recompensa
    console.log('Redimiendo recompensa:', recompensaId);
    // Aquí se implementaría la lógica real de redención
  }
  
  canRedeem(sellosRequeridos: number): boolean {
    return this.userData().sellos >= sellosRequeridos;
  }
}