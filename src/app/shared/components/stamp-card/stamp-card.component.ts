import { Component, Input, Output, EventEmitter, signal, effect, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

export interface StampData {
  id: number;
  collected: boolean;
  date?: Date;
}

@Component({
  selector: 'app-stamp-card',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './stamp-card.component.html',
  styleUrls: ['./stamp-card.component.scss']
})
export class StampCardComponent implements OnChanges {
  @Input() backgroundImage: string = 'assets/images/hamb.png';
  @Input() totalStamps: number = 10;
  @Input() collectedStamps: number = 5;
  @Input() title: string = 'Mis Sellos';
  @Input() cardId: string = '';
  @Input() isExpanded: boolean = false;
  
  @Output() expansionToggle = new EventEmitter<string>();
  
  // Font Awesome icons
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  
  // Internal expansion state signal
  private _isExpanded = signal(false);
  
  constructor() {
    // Update internal signal when input changes
    effect(() => {
      this._isExpanded.set(this.isExpanded);
    });
  }
  
  ngOnChanges() {
    // Ensure the internal signal is updated when input changes
    this._isExpanded.set(this.isExpanded);
  }
  
  // Getter for template usage
  get expandedState() {
    return this._isExpanded();
  }
  
  // Generate stamps array
  get stamps(): StampData[] {
    const stampsArray: StampData[] = [];
    for (let i = 1; i <= this.totalStamps; i++) {
      stampsArray.push({
        id: i,
        collected: i <= this.collectedStamps,
        date: i <= this.collectedStamps ? new Date() : undefined
      });
    }
    return stampsArray;
  }
  
  // Get stamps for top row (first 5)
  get topRowStamps(): StampData[] {
    return this.stamps.slice(0, 5);
  }
  
  // Get stamps for bottom row (last 5)
  get bottomRowStamps(): StampData[] {
    return this.stamps.slice(5, 10);
  }
  
  toggleExpansion() {
    this.expansionToggle.emit(this.cardId);
  }
}