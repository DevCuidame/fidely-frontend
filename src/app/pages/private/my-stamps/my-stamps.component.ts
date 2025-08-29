import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStamp } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { UserPointsService } from '../../../core/services/user-points.service';
import { StampCardComponent } from '../../../shared/components/stamp-card/stamp-card.component';
import { StampNavigationService } from '../../../core/services/stamp-navigation.service';

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
  private stampNavigationService = inject(StampNavigationService);
  
  // Service signals
  userData = computed(() => this.authService.currentUser());
  businessBalances = computed(() => this.userPointsService.businessBalances());
  loading = computed(() => this.userPointsService.loading());
  error = computed(() => this.userPointsService.error());
  
  // Accordion state - track which card is expanded
  expandedCardId = signal<string | null>(null);
  
  // Signal para el stamp seleccionado desde el carousel
  selectedStampFromCarousel = computed(() => this.stampNavigationService.selectedStamp());
  
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
  
  constructor() {
    // Effect para manejar la expansión automática cuando se selecciona un stamp desde el carousel
    effect(() => {
      const selectedStamp = this.selectedStampFromCarousel();
      if (selectedStamp) {
        // Expandir automáticamente la tarjeta correspondiente
         this.expandedCardId.set(selectedStamp.businessId.toString());
        
        // Limpiar el stamp seleccionado después de procesarlo
        setTimeout(() => {
          this.stampNavigationService.clearSelectedStamp();
        }, 100);
      }
    });
  }
  
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