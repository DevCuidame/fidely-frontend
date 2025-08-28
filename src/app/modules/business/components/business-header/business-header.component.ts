import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CommonUtils } from 'src/app/shared/utils/common.utils';
import { UserSettingsComponent } from 'src/app/pages/private/user-home/components/user-settings/user-settings.component';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { finalize } from 'rxjs';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-business-header',
  standalone: true,
  imports: [CommonModule, UserSettingsComponent],
  templateUrl: './business-header.component.html',
  styleUrls: ['./business-header.component.scss']
})
export class BusinessHeaderComponent implements OnInit {

  // Settings state
  showSettings = signal(false);
  
  // User data from AuthService
  userData = computed(() => this.authService.currentUser());

  // Computed properties
  userFullName = computed(() => {
    const firstName = this.userData()?.first_name || '';
    const lastName = this.userData()?.last_name || '';
    return firstName && lastName ? `${firstName} ${lastName}` : firstName || 'Admin';
  });

  userProfileImage = computed(() => {
    return CommonUtils.formatProfileImageUrl(
      this.userData()?.profile_image_url,
      '/assets/images/avatar.jpeg'
    );
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    // Cargar datos del usuario explícitamente
    this.authService.refreshUserData();
  }

  // Navigation methods for header links
  navigateToHome(): void {
    this.router.navigate(['/business/home']);
  }
  
  navigateToPromos(): void {
    this.router.navigate(['/business/promos']); 
  }
  
  navigateToClients(): void {
    this.router.navigate(['/business/clients']);
  }
  
  navigateToRewards(): void {
    this.router.navigate(['/business/rewards']);
  }

  // User avatar and settings methods
  onUserImageClick(): void {
    this.showSettings.set(true);
  }

  onSettingsClose(): void {
    this.showSettings.set(false);
  }

   onLogout() {
    this.loadingService.showLoading('Cerrando sesión...');

    this.authService.logout()
      .pipe(
        finalize(() => {
          this.loadingService.hideLoading();
        })
      )
      .subscribe(
        () => {
          setTimeout(() => {
            this.router.navigate(['/auth/login'], { replaceUrl: true });
          }, 100);
        },
        (error) => {
          console.error('Error al cerrar sesión:', error);
          this.router.navigate(['/auth/login'], { replaceUrl: true });
        }
      );
  }
}
