import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { RedeemModalComponent } from './redeem-modal/redeem-modal.component';

export interface RedeemReward {
  id: string;
  title: string;
  description: string;
  code: string;
  image: string;
  validFor: string;
  expiryDate: string;
  backgroundImage?: string;
}

@Component({
  selector: 'app-redeem-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RedeemModalComponent],
  templateUrl: './redeem-card.component.html',
  styleUrls: ['./redeem-card.component.scss']
})
export class RedeemCardComponent implements OnInit {
  @Input() reward: RedeemReward | null = null;
  @Input() isGoalReached: boolean = false;

  // Default reward data
  defaultReward: RedeemReward = {
    id: '1',
    title: 'Llegaste a la meta',
    description: 'Redime tu premio',
    code: 'QWERTYU12345',
    image: 'assets/images/hamb.jpg',
    validFor: '1 combo de hamburguesa, papas y bebida',
    expiryDate: '2025-Dic-12',
    backgroundImage: 'assets/images/hamb.jpg'
  };

  showModal = signal(false);
  
  // Font Awesome icons
  faLock = faLock;

  constructor() {}

  ngOnInit() {
    if (!this.reward) {
      this.reward = this.defaultReward;
    }
  }

  onCardClick() {
    if (this.isGoalReached) {
      this.showModal.set(true);
    }
  }

  onModalClose() {
    this.showModal.set(false);
  }

  get currentReward() {
    return this.reward || this.defaultReward;
  }
}