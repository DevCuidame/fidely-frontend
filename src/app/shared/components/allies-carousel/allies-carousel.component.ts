import { Component, Input, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface Aliado {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
}

@Component({
  selector: 'app-allies-carousel',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './allies-carousel.component.html',
  styleUrls: ['./allies-carousel.component.scss']
})
export class AlliesCarouselComponent implements OnInit, OnDestroy {
  @Input() aliados: Aliado[] = [];

  // Computed properties
  totalAliados = computed(() => {
    return this.aliados.length;
  });

  activeAliados = computed(() => {
    return this.aliados.filter(a => a.activo);
  });

  ngOnInit() {
    // Component initialization
  }

  ngOnDestroy() {
    // Component cleanup
  }

  onAliadoClick(aliado: Aliado) {
    console.log('Aliado seleccionado:', aliado);
    // Aquí se puede implementar la navegación o acción específica
  }

  trackByAliadoId(index: number, aliado: Aliado): number {
    return aliado.id;
  }
}