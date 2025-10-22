import { Component, computed, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSignOutAlt, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { CommonUtils } from 'src/app/shared/utils/common.utils';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent {
  // Font Awesome icons
  faSignOutAlt = faSignOutAlt;
  faTimes = faTimes;
  faTrash = faTrash;

  // Input properties
  @Input() isVisible: boolean = false;
  @Input() userData: any;

  // Output events
  @Output() close = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  constructor(private router: Router) {}

  // Computed property for user's profile image
  userProfileImage = computed(() => {
    return CommonUtils.formatProfileImageUrl(
      this.userData?.profile_image_url,
      '/assets/images/avatar.jpeg'
    );
  });

  onClose() {
    this.close.emit();
  }

  onLogout() {
    this.logout.emit();
  }

  goToDeleteAccount() {
    const role = this.userData?.role?.toLowerCase?.();
    const target = role === 'business' ? '/business/delete-account' : '/home/delete-account';
    this.router.navigate([target]);
    this.close.emit(); // Close the settings modal after navigation
  }
}