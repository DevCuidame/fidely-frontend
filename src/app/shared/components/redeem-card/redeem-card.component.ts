import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { RedeemModalComponent } from './redeem-modal/redeem-modal.component';
import {  IMilestoneRewardResponse } from 'src/app/core/interfaces/milestone-rewards.interface';


@Component({
  selector: 'app-redeem-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RedeemModalComponent],
  templateUrl: './redeem-card.component.html',
  styleUrls: ['./redeem-card.component.scss']
})
export class RedeemCardComponent implements OnInit {
  @Input() reward: IMilestoneRewardResponse | null = null;
  @Input() isGoalReached: boolean = false;


  showModal = signal(false);
  
  // Font Awesome icons
  faLock = faLock;

  constructor() {}

  ngOnInit() {
   
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
    return this.reward;
  }
}