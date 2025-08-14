import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faHome, faUsers, faTags } from '@fortawesome/free-solid-svg-icons';
import { StampCardComponent } from '../../../shared/components/stamp-card/stamp-card.component';
import { HeroSectionComponent } from '../../../shared/components/hero-section/hero-section.component';
import { ButtonCodeComponent } from '../../../shared/components/button-code/button-code.component';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, HeroSectionComponent, StampCardComponent, ButtonCodeComponent],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent {
  
  constructor(private router: Router) {}
  
  // Handle stamp card action with code
  onStampCard(code?: string): void {
    if (code) {
      console.log('Sellar tarjeta de visita con código:', code);
      // Aquí puedes agregar la lógica para sellar la tarjeta con el código
      // Por ejemplo: validar el código, actualizar el progreso, etc.
    } else {
      console.log('Acción de sellar tarjeta iniciada');
    }
  }
  
  // Handle deliver reward action with code
  onDeliverReward(code?: string): void {
    if (code) {
      console.log('Entregar premio con código:', code);
      // Aquí puedes agregar la lógica para entregar el premio con el código
      // Por ejemplo: validar el código del premio, actualizar el estado, etc.
    } else {
      console.log('Acción de entregar premio iniciada');
    }
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

  // Example data for stamp cards
  stampCards = signal([
    {
      id: '1',
      nombre: 'Coffee Shop',
      progreso: 7,
      objetivo: 10,
      imagen: 'assets/images/hamb.png'
    }
  ]);
  
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