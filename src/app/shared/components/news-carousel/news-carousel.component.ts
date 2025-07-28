import { Component, Input, OnInit, OnDestroy, AfterViewInit, computed, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface Novedad {
  id: number;
  titulo: string;
  subtitulo: string;
  imagenFondo: string;
  icono: string;
  activo: boolean;
}

@Component({
  selector: 'app-news-carousel',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './news-carousel.component.html',
  styleUrls: ['./news-carousel.component.scss']
})
export class NewsCarouselComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() novedades: Novedad[] = [];
  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  // Signals
  currentIndex = signal(0);

  // Computed properties
  totalNovedades = computed(() => {
    return this.novedades.length;
  });

  activeNovedades = computed(() => {
    return this.novedades.filter(n => n.activo);
  });

  ngOnInit() {
    // Component initialization
  }

  ngAfterViewInit() {
    if (this.carouselContainer) {
      this.carouselContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  ngOnDestroy() {
    if (this.carouselContainer) {
      this.carouselContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  onScroll() {
    if (!this.carouselContainer) return;
    
    const container = this.carouselContainer.nativeElement;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.querySelector('.news-card')?.offsetWidth || 0;
    const gap = 24; // 1.5rem gap
    
    if (cardWidth > 0) {
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      if (newIndex !== this.currentIndex() && newIndex >= 0 && newIndex < this.novedades.length) {
        this.currentIndex.set(newIndex);
      }
    }
  }

  onNovedadClick(novedad: Novedad) {
    console.log('Novedad seleccionada:', novedad);
    // Aquí se puede implementar la navegación o acción específica
  }

  goToSlide(index: number) {
    this.currentIndex.set(index);
    
    if (this.carouselContainer) {
      const container = this.carouselContainer.nativeElement;
      const cardWidth = container.querySelector('.news-card')?.offsetWidth || 0;
      const gap = 24; // 1.5rem gap
      const scrollPosition = index * (cardWidth + gap);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }

  trackByNovedadId(index: number, novedad: Novedad): number {
    return novedad.id;
  }
}