import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes, faCopy } from '@fortawesome/free-solid-svg-icons';
import { IMilestoneReward, IMilestoneRewardResponse } from 'src/app/core/interfaces/milestone-rewards.interface';

@Component({
  selector: 'app-redeem-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './redeem-modal.component.html',
  styleUrls: ['./redeem-modal.component.scss']
})
export class RedeemModalComponent {
  @Input() reward!: IMilestoneRewardResponse;
  @Output() close = new EventEmitter<void>();
  
  // Font Awesome icons
  faTimes = faTimes;
  faCopy = faCopy;

  closeModal() {
    this.close.emit();
  }

  async onCodeCopy() {
    try {
      await navigator.clipboard.writeText(this.reward.rewardCode);
      // Aquí podrías mostrar un toast de confirmación
      console.log('Código copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar código:', err);
    }
  }
}