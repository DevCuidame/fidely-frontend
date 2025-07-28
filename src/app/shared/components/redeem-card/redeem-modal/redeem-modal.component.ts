import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faCopy } from '@fortawesome/free-solid-svg-icons';
import { RedeemReward } from '../redeem-card.component';

@Component({
  selector: 'app-redeem-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './redeem-modal.component.html',
  styleUrls: ['./redeem-modal.component.scss']
})
export class RedeemModalComponent {
  @Input() reward!: RedeemReward;
  @Output() close = new EventEmitter<void>();
  
  // Font Awesome icons
  faTimes = faTimes;
  faCopy = faCopy;

  closeModal() {
    this.close.emit();
  }

  async onCodeCopy() {
    try {
      await navigator.clipboard.writeText(this.reward.code);
      // Aquí podrías mostrar un toast de confirmación
      console.log('Código copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar código:', err);
    }
  }
}