import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStamp, faHome, faTrophy } from '@fortawesome/free-solid-svg-icons';

export type TabType = 'sellos' | 'inicio' | 'redimir';

@Component({
  selector: 'app-user-home-tab-bar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './user-home-tab-bar.component.html',
  styleUrls: ['./user-home-tab-bar.component.scss']
})
export class UserHomeTabBarComponent implements AfterViewInit {
  // Font Awesome icons
  faStamp = faStamp;
  faHome = faHome;
  faTrophy = faTrophy;

  // Input properties
  @Input() activeTab: TabType = 'inicio';

  // Output events
  @Output() tabSelected = new EventEmitter<TabType>();

  // Background colors for body
  private bgColorsBody = ['#ffb457', '#ff96bd', '#9999fb'];
  private activeItem: HTMLElement | null = null;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  ngAfterViewInit() {
    // Initialize the border position after view init
    setTimeout(() => {
      this.offsetMenuBorder();
    }, 100);

    // Listen for window resize
    window.addEventListener('resize', () => {
      this.offsetMenuBorder();
      this.setMenuProperty('--timeOut', 'none');
    });
  }

  // Event handlers
  selectTab(tab: TabType) {
    const menuElement = this.elementRef.nativeElement.querySelector('.menu');
    if (menuElement) {
      this.renderer.removeStyle(menuElement, '--timeOut');
    }

    if (this.activeItem === this.getClickedItem(tab)) return;

    if (this.activeItem) {
      this.renderer.removeClass(this.activeItem, 'active');
    }

    const newActiveItem = this.getClickedItem(tab);
    if (newActiveItem) {
      this.renderer.addClass(newActiveItem, 'active');
      this.activeItem = newActiveItem;
    }

    this.activeTab = tab;
    this.updateBodyBackground();
    this.tabSelected.emit(tab);
    this.offsetMenuBorder();
  }

  private getClickedItem(tab: TabType): HTMLElement | null {
    const buttons = this.elementRef.nativeElement.querySelectorAll('.menu__item');
    const tabIndex = this.getTabIndex(tab);
    return buttons[tabIndex] || null;
  }

  private offsetMenuBorder() {
    const menuElement = this.elementRef.nativeElement.querySelector('.menu');
    const menuBorder = this.elementRef.nativeElement.querySelector('.menu__border');
    const activeElement = this.elementRef.nativeElement.querySelector('.menu__item.active');

    if (!menuElement || !menuBorder || !activeElement) return;

    const offsetActiveItem = activeElement.getBoundingClientRect();
    const menuRect = menuElement.getBoundingClientRect();
    
    const left = Math.floor(
      offsetActiveItem.left - 
      menuRect.left - 
      (menuBorder.offsetWidth - offsetActiveItem.width) / 2
    );
    
    this.renderer.setStyle(menuBorder, 'transform', `translate3d(${left}px, 0, 0) rotate(180deg)`);
  }

  private updateBodyBackground() {
    const tabIndex = this.getTabIndex(this.activeTab);
    if (tabIndex >= 0 && tabIndex < this.bgColorsBody.length) {
      this.renderer.setStyle(
        document.body, 
        'backgroundColor', 
        this.bgColorsBody[tabIndex]
      );
    }
  }

  private getTabIndex(tab: TabType): number {
    const tabs: TabType[] = ['sellos', 'inicio', 'redimir'];
    return tabs.indexOf(tab);
  }

  private setMenuProperty(property: string, value: string) {
    const menuElement = this.elementRef.nativeElement.querySelector('.menu');
    if (menuElement) {
      this.renderer.setStyle(menuElement, property, value);
    }
  }
}