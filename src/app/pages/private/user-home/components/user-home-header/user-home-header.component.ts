import { Component, Input, Output, EventEmitter, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { CommonUtils } from 'src/app/shared/utils/common.utils';
import { UserSettingsComponent } from '../user-settings/user-settings.component';

@Component({
  selector: 'app-user-home-header',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, UserSettingsComponent],
  templateUrl: './user-home-header.component.html',
  styleUrls: ['./user-home-header.component.scss']
})
export class UserHomeHeaderComponent implements OnInit{
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
  @Output() logout = new EventEmitter<void>();

  // Settings state
  showSettings = false;
  statusBarHeight = 30;

  // Computed properties
  displayTitle = computed(() => {
    if (this.customTitle) return this.customTitle;
    const firstName = this.userData?.first_name || 'Usuario';
    return `¡Hola, ${firstName}!`;
  });

  // Computed property for user's full name
  userFullName = computed(() => {
    const firstName = this.userData?.first_name || '';
    const lastName = this.userData?.last_name || '';
    return firstName && lastName ? `${firstName} ${lastName}` : firstName || 'Usuario';
  });

  // Computed property for user's profile image
  userProfileImage = computed(() => {
    return CommonUtils.formatProfileImageUrl(
      this.userData?.profile_image_url,
      '/assets/images/avatar.jpeg'
    );
  });

  hasNotifications = computed(() => this.unreadNotifications > 0);

  ngOnInit(): void {
  // if (window.visualViewport) {
  //     const fullHeight = screen.height;
  //     const visualHeight = window.visualViewport.height;
  //     this.statusBarHeight = fullHeight - visualHeight;
  //   }
  }


  // Event handlers
  onUserImageClick() {
    this.showSettings = true;
    this.userImageClick.emit();
  }

  onNotificationClick() {
    this.notificationClick.emit();
  }

  onSettingsClose() {
    this.showSettings = false;
  }

  onLogout() {
    this.showSettings = false;
    this.logout.emit();
  }
}