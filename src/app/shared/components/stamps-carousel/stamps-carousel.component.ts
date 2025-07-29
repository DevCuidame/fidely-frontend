import { Component, Input, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export interface Sello {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
  progreso: number;
  objetivo: number;
  fecha: Date;
}

@Component({
  selector: 'app-stamps-carousel',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './stamps-carousel.component.html',
  styleUrls: ['./stamps-carousel.component.scss']
})
export class StampsCarouselComponent implements OnInit, OnDestroy {
  @Input() sellos: Sello[] = [];
  @Input() autoPlayInterval = 5000;
  @Input() itemsPerView = 1; // Solo mostrar una tarjeta

  currentIndex = signal(0);
  private autoPlayTimer: any = null;
  private touchStartX = 0;
  private touchEndX = 0;
  private translateX = signal(0);

  // Computed properties
  currentStamp = computed(() => {
    return this.sellos[this.currentIndex()] || null;
  });

  totalSellos = computed(() => {
    return this.sellos.length;
  });

  dotsArray = computed(() => {
    return new Array(this.totalSellos());
  });

  activeSellosCount = computed(() => {
    return this.sellos.filter(s => s.activo).length;
  });

  // Getter for translateX to use in template
  getTranslateX() {
    return this.translateX();
  }

  ngOnInit() {
    if (this.sellos.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  private startAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
    
    this.autoPlayTimer = setInterval(() => {
      this.nextStamp();
    }, this.autoPlayInterval);
  }

  private stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  pauseAutoPlay() {
    this.stopAutoPlay();
  }

  resumeAutoPlay() {
    if (this.sellos.length > 1) {
      this.startAutoPlay();
    }
  }

  // Navigation methods
  nextStamp() {
    if (this.currentIndex() < this.sellos.length - 1) {
      this.currentIndex.update(current => current + 1);
    } else {
      // Loop back to beginning
      this.currentIndex.set(0);
    }
  }

  previousStamp() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(current => current - 1);
    } else {
      // Loop to end
      this.currentIndex.set(this.sellos.length - 1);
    }
  }

  goToStamp(index: number) {
    this.currentIndex.set(index);
  }

  // Touch events for swipe functionality
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.pauseAutoPlay();
  }

  onTouchMove(event: TouchEvent) {
    // Optional: Add visual feedback during swipe
    const currentX = event.touches[0].clientX;
    const diff = this.touchStartX - currentX;
    this.translateX.set(-diff * 0.5); // Reduced sensitivity
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.translateX.set(0); // Reset translation
    
    const swipeThreshold = 50;
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Swipe left - next stamp
        this.nextStamp();
      } else {
        // Swipe right - previous stamp
        this.previousStamp();
      }
    }
    
    this.resumeAutoPlay();
  }

  trackBySello(index: number, sello: Sello): number {
    return sello.id;
  }
}