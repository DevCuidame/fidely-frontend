import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStamp } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { UserPointsService } from '../../../core/services/user-points.service';
import { StampCardComponent } from '../../../shared/components/stamp-card/stamp-card.component';

@Component({
  selector: 'app-my-stamps',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, StampCardComponent],
  templateUrl: './my-stamps.component.html',
  styleUrls: ['./my-stamps.component.scss']
})
export class MyStampsComponent implements OnInit {
  // Font Awesome icons
  faStamp = faStamp;
  
  // Inject services
  private authService = inject(AuthService);
  private userPointsService = inject(UserPointsService);
  
  // Service signals
  userData = computed(() => this.authService.currentUser());
  businessBalances = computed(() => this.userPointsService.businessBalances());
  loading = computed(() => this.userPointsService.loading());
  error = computed(() => this.userPointsService.error());
  
  // Accordion state - track which card is expanded
  expandedCardId = signal<string | null>(null);
  
  // Computed properties for stamp data using real user points
  totalAvailablePoints = computed(() => this.userPointsService.totalAvailablePoints());
  hasPoints = computed(() => this.userPointsService.hasPoints());
  
  // Transform business balances to stamp card format
  stampCards = computed(() => {
    const balances = this.businessBalances();
    return balances.map(balance => ({
      id: balance.businessId,
      nombre: balance.businessName || 'Negocio',
      progreso: balance.availablePoints,
      objetivo: 10, // Default objective if not set
      imagen: balance.promotionalImage || 'assets/images/default-business.png'
    }));
  });
  
  // Handle card expansion toggle
  onCardExpansionToggle(cardId: string) {
    // If the same card is clicked, close it; otherwise, open the new one
    if (this.expandedCardId() === cardId) {
      this.expandedCardId.set(null);
    } else {
      this.expandedCardId.set(cardId);
    }
  }
  
  // Check if a specific card is expanded
  isCardExpanded(cardId: string): boolean {
    return this.expandedCardId() === cardId;
  }
  
  // TrackBy function for ngFor optimization
  trackBySelloId(index: number, sello: any): number {
    return sello.id;
  }
  
  ngOnInit() {
    // Cargar los puntos del usuario al inicializar el componente
    this.userPointsService.loadUserPoints();
  }
}