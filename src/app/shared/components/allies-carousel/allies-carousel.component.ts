import { Component, Input, OnInit, OnDestroy, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BusinessRegistryData, BusinessStatus, IBusinessResponse } from 'src/app/core/interfaces/business-registry.interface';

@Component({
  selector: 'app-allies-carousel',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './allies-carousel.component.html',
  styleUrls: ['./allies-carousel.component.scss']
})
export class AlliesCarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() allies: IBusinessResponse[] = [];
  
  // Signal para manejar los allies reactivamente
  private alliesSignal = signal<IBusinessResponse[]>([]);

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
      console.log('Allies updated in carousel:', changes['allies'].currentValue);
    }
  }

  ngOnDestroy() {
    // Component cleanup
  }

  onAliadoClick(allies: IBusinessResponse) {
    console.log('Aliado seleccionado:', allies);
    // Aquí se puede implementar la navegación o acción específica
  }

  trackByAliadoId(index: number, allies: IBusinessResponse): number {
    return allies.id;
  }
}