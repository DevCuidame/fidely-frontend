import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, Renderer2, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStamp, faHome, faTrophy } from '@fortawesome/free-solid-svg-icons';

export type TabType = 'sellos' | 'inicio' | 'redimir';

@Component({
  selector: 'app-user-home-tab-bar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './user-home-tab-bar.component.html',
  styleUrls: ['./user-home-tab-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserHomeTabBarComponent implements OnInit, OnDestroy {
  // Font Awesome icons
  faStamp = faStamp;
  faHome = faHome;
  faTrophy = faTrophy;

  // Input properties
  @Input() activeTab: TabType = 'inicio';

  // Output events
  @Output() tabSelected = new EventEmitter<TabType>();

  // Private properties
  private touchStartTime = 0;
  private isLongPress = false;
  private longPressTimer: any;
  private hapticFeedbackSupported = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    // Check for haptic feedback support
    this.hapticFeedbackSupported = 'vibrate' in navigator;
  }

  ngOnInit() {
    // Initialize active tab styling
    this.updateActiveTab();
    
    // Add passive event listeners for better performance
    this.addPassiveListeners();
  }

  ngOnDestroy() {
    // Clean up timers
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  // Main tab selection method
  selectTab(tab: TabType) {
    if (this.activeTab === tab) {
      // Add subtle feedback for same tab selection
      this.addFeedbackAnimation(tab);
      return;
    }

    // Haptic feedback for supported devices
    this.triggerHapticFeedback();

    // Update active tab
    this.activeTab = tab;
    this.updateActiveTab();
    
    // Emit selection event
    this.tabSelected.emit(tab);
  }

  // Touch event handlers
  onTouchStart(event: TouchEvent, tab: TabType) {
    event.preventDefault();
    
    this.touchStartTime = Date.now();
    this.isLongPress = false;
    
    // Add press effect immediately
    this.addPressEffect(tab, true);
    
    // Set up long press detection
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.triggerHapticFeedback('heavy');
    }, 500);
  }

  onTouchEnd(event: TouchEvent, tab: TabType) {
    event.preventDefault();
    
    // Clear long press timer
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    
    // Remove press effect
    this.addPressEffect(tab, false);
    
    // Only trigger selection if it wasn't a long press
    const touchDuration = Date.now() - this.touchStartTime;
    if (!this.isLongPress && touchDuration < 500) {
      // Add small delay to show press effect
      setTimeout(() => {
        this.selectTab(tab);
      }, 50);
    }
  }

  // Private methods
  private updateActiveTab() {
    const tabElements = this.elementRef.nativeElement.querySelectorAll('.tab-item');
    const tabs: TabType[] = ['sellos', 'inicio', 'redimir'];
    
    tabElements.forEach((element: HTMLElement, index: number) => {
      const isActive = tabs[index] === this.activeTab;
      
      if (isActive) {
        this.renderer.addClass(element, 'active');
        // Add activation animation
        this.addActivationAnimation(element);
      } else {
        this.renderer.removeClass(element, 'active');
      }
    });
  }

  private addPressEffect(tab: TabType, pressed: boolean) {
    const element = this.getTabElement(tab);
    if (!element) return;

    if (pressed) {
      this.renderer.addClass(element, 'pressed');
      // Create ripple effect
      this.createRippleEffect(element);
    } else {
      // Remove press effect with slight delay
      setTimeout(() => {
        this.renderer.removeClass(element, 'pressed');
      }, 100);
    }
  }

  private addFeedbackAnimation(tab: TabType) {
    const element = this.getTabElement(tab);
    if (!element) return;

    // Add bounce animation class
    this.renderer.addClass(element, 'feedback-bounce');
    
    // Remove class after animation
    setTimeout(() => {
      this.renderer.removeClass(element, 'feedback-bounce');
    }, 400);
  }

  private addActivationAnimation(element: HTMLElement) {
    // Reset animation
    this.renderer.setStyle(element, 'animation', 'none');
    
    // Trigger reflow
    element.offsetHeight;
    
    // Add activation animation
    this.renderer.setStyle(element, 'animation', 'tab-activate 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)');
  }

  private createRippleEffect(element: HTMLElement) {
    // Remove existing ripples
    const existingRipples = element.querySelectorAll('.ripple');
    existingRipples.forEach(ripple => ripple.remove());

    // Create new ripple
    const ripple = this.renderer.createElement('div');
    this.renderer.addClass(ripple, 'ripple');
    
    // Set ripple styles
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'border-radius', '50%');
    this.renderer.setStyle(ripple, 'background', 'rgba(255, 255, 255, 0.4)');
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.setStyle(ripple, 'animation', 'ripple-out 0.6s ease-out');
    this.renderer.setStyle(ripple, 'width', '100%');
    this.renderer.setStyle(ripple, 'height', '100%');
    this.renderer.setStyle(ripple, 'top', '0');
    this.renderer.setStyle(ripple, 'left', '0');
    this.renderer.setStyle(ripple, 'pointer-events', 'none');
    
    this.renderer.appendChild(element, ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        this.renderer.removeChild(element, ripple);
      }
    }, 600);
  }

  private getTabElement(tab: TabType): HTMLElement | null {
    const tabs: TabType[] = ['sellos', 'inicio', 'redimir'];
    const index = tabs.indexOf(tab);
    const tabElements = this.elementRef.nativeElement.querySelectorAll('.tab-item');
    return tabElements[index] || null;
  }

  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy' = 'light') {
    if (!this.hapticFeedbackSupported) return;

    try {
      // Use different vibration patterns based on intensity
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      
      navigator.vibrate(patterns[intensity]);
    } catch (error) {
      // Silently fail if vibration is not supported
    }
  }

  private addPassiveListeners() {
    // Add passive listeners for better scroll performance
    const tabBar = this.elementRef.nativeElement.querySelector('.tab-bar');
    if (tabBar) {
      // Prevent default touch behaviors that might interfere
      tabBar.addEventListener('touchmove', (e: TouchEvent) => {
        e.preventDefault();
      }, { passive: false });
      
      tabBar.addEventListener('touchcancel', () => {
        // Clean up any active press states
        const pressedElements = this.elementRef.nativeElement.querySelectorAll('.pressed');
        pressedElements.forEach((element: HTMLElement) => {
          this.renderer.removeClass(element, 'pressed');
        });
      }, { passive: true });
    }
  }
}