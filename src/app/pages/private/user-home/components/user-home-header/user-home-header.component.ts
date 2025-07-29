import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-home-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './user-home-header.component.html',
  styleUrls: ['./user-home-header.component.scss']
})
export class UserHomeHeaderComponent {
  // Font Awesome icons
  faBell = faBell;

  // Input properties
  @Input() showUserImage = true;
  @Input() showUserName = true;
  @Input() showNotifications = true;
  @Input() customTitle: string | null = null;
  @Input() customMessage = '';
  @Input() userData: any = {};
  @Input() unreadNotifications = 0;

  // Output events
  @Output() userImageClick = new EventEmitter<void>();
  @Output() notificationClick = new EventEmitter<void>();

  // Computed properties
  displayTitle = computed(() => {
    if (this.customTitle) return this.customTitle;
    const name = this.userData?.name || 'Usuario';
    return `¡Hola, ${name}!`;
  });

  hasNotifications = computed(() => this.unreadNotifications > 0);

  // Event handlers
  onUserImageClick() {
    this.userImageClick.emit();
  }

  onNotificationClick() {
    this.notificationClick.emit();
  }
}