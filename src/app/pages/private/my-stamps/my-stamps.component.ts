import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStamp } from '@fortawesome/free-solid-svg-icons';
import { DashboardService } from '../user-home/home.service';
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
  
  // Inject dashboard service
  private dashboardService = inject(DashboardService);
  
  // Service signals
  sellos = this.dashboardService.sellos;
  activeSellos = this.dashboardService.activeSellos;
  userData = this.dashboardService.userData;
  
  // Accordion state - track which card is expanded
  expandedCardId = signal<string | null>(null);
  
  // Computed properties for stamp data
  collectedStampsCount = computed(() => {
    // Use progress from first active sello instead of total user sellos
    const activeSellos = this.activeSellos();
    if (activeSellos.length > 0) {
      return activeSellos[0].progreso || 0;
    }
    return this.userData().sellos || 0;
  });
  
  totalStampsCount = computed(() => {
    // Calculate total stamps needed from active sellos
    const activeSellos = this.activeSellos();
    if (activeSellos.length > 0) {
      // Use the first active sello's objective as total, or default to 10
      return activeSellos[0].objetivo || 10;
    }
    return 10; // Default total
  });
  
  backgroundImageUrl = computed(() => {
    const activeSellos = this.activeSellos();
    if (activeSellos.length > 0) {
      return activeSellos[0].imagen || 'assets/images/hamb.png';
    }
    return 'assets/images/hamb.png'; // Default image
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
    this.dashboardService.loadUserData();
  }
}