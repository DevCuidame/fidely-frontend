import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, computed, signal, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { IUserBusinessPointsBalance } from 'src/app/core/interfaces/user-business-points.interface';
import { StampNavigationService } from 'src/app/core/services/stamp-navigation.service';
@Component({
  selector: 'app-stamps-carousel',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './stamps-carousel.component.html',
  styleUrls: ['./stamps-carousel.component.scss']
})
export class StampsCarouselComponent implements OnInit, OnDestroy, OnChanges {
  @Input() stamps: IUserBusinessPointsBalance[] = [];
  @Input() autoPlayInterval = 5000;
  @Input() itemsPerView = 1; // Solo mostrar una tarjeta

  // Convert stamps to signal for reactive computed properties
  private stampsSignal = signal<IUserBusinessPointsBalance[]>([]);

  // Inject services
  private router = inject(Router);
  private stampNavigationService = inject(StampNavigationService);
  
  constructor(private elementRef: ElementRef) {}
  currentIndex = signal(0);
  private autoPlayTimer: any = null;
  private touchStartX = 0;
  private touchEndX = 0;
  private translateX = signal(0);

  // Computed properties
  currentStamp = computed(() => {
    const index = this.currentIndex();
    const stamps = this.stampsSignal();
    const stamp = stamps[index];
    return stamp;
  });

  totalStamps = computed(() => {
    const length = this.stampsSignal().length;
    return length;
  });

  dotsArray = computed(() => {
    return new Array(this.totalStamps());
  });

  // Method to get progress message based on points
  getProgressMessage(): string {
    const stamp = this.currentStamp();
    if (!stamp) return 'Sin sellos';
    
    const progress = stamp.availablePoints / 10;
    
    if (progress >= 1) {
      return '¡Has completado la meta!';
    }    else if (progress >= 0.8) {
      return '¡Casi lo logras!';
    } else if (progress >= 0.5) {
      return 'Estás cerca de la meta';
    } else {
      return 'Sigue coleccionando';
    }
  }

  // Getter for translateX to use in template
  getTranslateX() {
    return this.translateX();
  }

  // Method to restart animations when stamp changes
  private restartAnimations() {
    const stampCard = this.elementRef.nativeElement.querySelector('.stamp-card');
    if (stampCard) {
      // Add fade-out class
      stampCard.classList.remove('fade-in');
      stampCard.classList.add('fade-out');
      
      // After transition completes, switch to fade-in
      setTimeout(() => {
        stampCard.classList.remove('fade-out');
        stampCard.classList.add('fade-in');
      }, 150); // Half of the transition duration
    }
  }

  /**
   * Maneja el click en un stamp del carousel
   * Navega a my-stamps y establece el stamp seleccionado
   */
  onStampClick(): void {
    const currentStamp = this.currentStamp();
    if (currentStamp) {
      // Establecer el stamp seleccionado en el servicio
      this.stampNavigationService.setSelectedStamp(currentStamp);
      
      // Navegar a my-stamps
      this.router.navigate(['/user/my-stamps']);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stamps']) {
      // Sync stampsSignal with new input data
      this.stampsSignal.set(this.stamps);
      
      // Reset current index when stamps change
      this.currentIndex.set(0);
      
      // Restart autoplay if there's more than one stamp
      if (this.stampsSignal().length > 1) {
        this.startAutoPlay();
      }
    }
  }

  ngOnInit() {
    // Initialize stampsSignal with input data
    this.stampsSignal.set(this.stamps);
    
    if (this.stampsSignal().length > 1) {
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
    if (this.stampsSignal().length > 1) {
      this.startAutoPlay();
    }
  }

  // Navigation methods
  nextStamp() {
    if (this.currentIndex() < this.stampsSignal().length - 1) {
      this.currentIndex.update(current => current + 1);
    } else {
      // Loop back to beginning
      this.currentIndex.set(0);
    }
    this.restartAnimations();
  }

  previousStamp() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(current => current - 1);
    } else {
      // Loop to end
      this.currentIndex.set(this.stampsSignal().length - 1);
    }
    this.restartAnimations();
  }

  goToStamp(index: number) {
    this.currentIndex.set(index);
    this.restartAnimations();
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
}