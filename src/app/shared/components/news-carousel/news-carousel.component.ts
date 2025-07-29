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
  @Input() autoPlayInterval: number = 5000; // 5 segundos por defecto
  @Input() autoPlay: boolean = true; // Activado por defecto
  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  // Signals
  currentIndex = signal(0);
  private autoPlayTimer: any = null;

  // Computed properties
  totalNovedades = computed(() => {
    return this.novedades.length;
  });

  activeNovedades = computed(() => {
    return this.novedades.filter(n => n.activo);
  });

  ngOnInit() {
    // Component initialization
    if (this.autoPlay && this.novedades.length > 1) {
      this.startAutoPlay();
    }
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
    this.stopAutoPlay();
  }

  onScroll() {
    if (!this.carouselContainer) return;
    
    // Pausar autoplay durante scroll manual
    this.pauseAutoPlay();
    
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
    
    // Reanudar autoplay después de un breve delay
    setTimeout(() => {
      this.resumeAutoPlay();
    }, 3000);
  }

  onNovedadClick(novedad: Novedad) {
    console.log('Novedad seleccionada:', novedad);
    // Pausar autoplay cuando el usuario hace click
    this.pauseAutoPlay();
    
    // Reanudar autoplay después de un delay
    setTimeout(() => {
      this.resumeAutoPlay();
    }, 5000);
    
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

  private startAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
    
    this.autoPlayTimer = setInterval(() => {
      const activeNovedades = this.activeNovedades();
      if (activeNovedades.length > 1) {
        const nextIndex = (this.currentIndex() + 1) % activeNovedades.length;
        this.goToSlide(nextIndex);
      }
    }, this.autoPlayInterval);
  }

  private stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private pauseAutoPlay() {
    this.stopAutoPlay();
  }

  private resumeAutoPlay() {
    if (this.autoPlay && this.novedades.length > 1) {
      this.startAutoPlay();
    }
  }
}