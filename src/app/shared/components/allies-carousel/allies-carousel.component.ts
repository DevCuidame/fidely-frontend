import { Component, Input, OnInit, OnDestroy, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BusinessRegistryData, BusinessStatus, IBusinessResponse } from 'src/app/core/interfaces/business-registry.interface';
import { BusinessModalComponent } from '../business-modal/business-modal.component';

@Component({
  selector: 'app-allies-carousel',
  standalone: true,
  imports: [CommonModule, IonicModule, BusinessModalComponent],
  templateUrl: './allies-carousel.component.html',
  styleUrls: ['./allies-carousel.component.scss']
})
export class AlliesCarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() allies: IBusinessResponse[] = [];
  
  // Signal para manejar los allies reactivamente
  private alliesSignal = signal<IBusinessResponse[]>([]);
  
  // Modal state
  selectedBusiness = signal<IBusinessResponse | null>(null);
  isModalOpen = signal(false);

  // Computed properties
  totalAliados = computed(() => {
    return this.alliesSignal().length;
  });

  activeAliados = computed(() => {
    return this.alliesSignal().filter(a => a.status === BusinessStatus.APPROVED);
  });

  ngOnInit() {
    // Component initialization
    this.alliesSignal.set(this.allies);
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['allies'] && changes['allies'].currentValue) {
      this.alliesSignal.set(changes['allies'].currentValue);
    }
  }

  ngOnDestroy() {
    // Component cleanup
  }

  onAliadoClick(allies: IBusinessResponse) {
    this.selectedBusiness.set(allies);
    this.isModalOpen.set(true);
  }

  onCloseModal() {
    this.isModalOpen.set(false);
    this.selectedBusiness.set(null);
  }

  trackByAliadoId(index: number, allies: IBusinessResponse): number {
    return allies.id;
  }
}