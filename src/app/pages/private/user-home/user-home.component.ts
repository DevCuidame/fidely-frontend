import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faUser, faHome, faGift, faStamp } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { UserHomeHeaderComponent } from './components/user-home-header/user-home-header.component';
import { UserHomeTabBarComponent, TabType } from './components/user-home-tab-bar/user-home-tab-bar.component';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { BusinessService } from 'src/app/core/services/business.service';
import { UserPointsService } from 'src/app/core/services/user-points.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, UserHomeHeaderComponent, UserHomeTabBarComponent, RouterOutlet],
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {
  // Font Awesome icons
  faBell = faBell;
  faUser = faUser;
  faHome = faHome;
  faGift = faGift;
  faStamp = faStamp;

  // Control signals for header customization
  showUserImage = signal(true);
  showUserName = signal(true);
  showNotifications = signal(true);
  customTitle = signal<string | null>(null);
  customMessage = signal<string>('');
  
  // Inject services
  public authService = inject(AuthService);
  private router = inject(Router);
  private businessService = inject(BusinessService);
  private userPointsService = inject(UserPointsService);
  private loadingService = inject(LoadingService);
  
  // Service signals - usando AuthService
  userData = computed(() => this.authService.currentUser());
  unreadNotifications = signal(0); // Por ahora como signal simple, se puede conectar a un servicio de notificaciones después
  
  // Navigation signals
  activeTab = signal<TabType>('inicio');
  
  // Computed properties
  displayTitle = computed(() => {
    const custom = this.customTitle();
    if (custom) return custom;
    const user = this.userData();
    const name = user?.first_name || 'Usuario';
    return `¡Hola, ${name}!`;
  });
  
  hasNotifications = computed(() => this.unreadNotifications() > 0);
  
  ngOnInit() {
    // Cargar datos del usuario explícitamente
    this.authService.refreshUserData();
    
    // Cargar datos de negocios y puntos del usuario al inicializar el componente padre
    // Esto asegura que los datos estén disponibles para todos los componentes hijos
    this.businessService.loadApprovedBusinesses();
    this.userPointsService.loadUserPoints();
    
    // Set initial active tab based on current route
    this.updateActiveTabFromRoute();
  }
  
  private updateActiveTabFromRoute() {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/my-stamps')) {
      this.activeTab.set('sellos');
    } else if (currentUrl.includes('/redeem')) {
      this.activeTab.set('redimir');
    } else {
      this.activeTab.set('inicio');
    }
  }
  
  // Tab navigation methods
  selectTab(tab: TabType) {
    this.activeTab.set(tab);
    
    // Navigate to the corresponding route
    const routeMap: Record<TabType, string> = {
      'sellos': '/user/my-stamps',
      'inicio': '/user/inicio',
      'redimir': '/user/redeem'
    };
    
    this.router.navigate([routeMap[tab]]);
  }
  
  // Header interaction methods
  onNotificationClick() {
    console.log('Notifications clicked');
    // Marcar todas las notificaciones como leídas
    this.unreadNotifications.set(0);
  }
  
  onUserImageClick() {
    console.log('User image clicked');
    // Implement user profile logic here
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
  
  // Método para redimir recompensa
  onRedeemReward(recompensaId: string) {
    console.log('Redimiendo recompensa:', recompensaId);
    // TODO: Implementar lógica de redención de recompensas
    // Esto se puede conectar a un servicio específico de recompensas más adelante
  }
  
  // Método para formatear fecha
  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hace 1 día';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString();
    }
  }
}