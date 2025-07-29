import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faUser, faHome, faGift, faStamp } from '@fortawesome/free-solid-svg-icons';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { DashboardService } from './home.service';
import { UserHomeHeaderComponent } from './components/user-home-header/user-home-header.component';
import { UserHomeTabBarComponent, TabType } from './components/user-home-tab-bar/user-home-tab-bar.component';

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
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // Service signals
  userData = this.dashboardService.userData;
  notifications = this.dashboardService.notifications;
  sellos = this.dashboardService.sellos;
  recompensas = this.dashboardService.recompensas;
  unreadNotifications = this.dashboardService.unreadNotifications;
  activeSellos = this.dashboardService.activeSellos;
  availableRecompensas = this.dashboardService.availableRecompensas;
  recentActivity = this.dashboardService.recentActivity;
  
  // Navigation signals
  activeTab = signal<TabType>('inicio');
  
  // Computed properties
  displayTitle = computed(() => {
    const custom = this.customTitle();
    if (custom) return custom;
    const name = this.userData().name;
    return `¡Hola, ${name}!`;
  });
  
  hasNotifications = computed(() => this.unreadNotifications() > 0);
  
  ngOnInit() {
    this.dashboardService.loadUserData();
    
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
    this.dashboardService.markAllNotificationsAsRead();
  }
  
  onUserImageClick() {
    console.log('User image clicked');
    // Implement user profile logic here
  }
  
  // Método para redimir recompensa
  onRedeemReward(recompensaId: string) {
    const success = this.dashboardService.redeemRecompensa(recompensaId);
    if (success) {
      console.log('Recompensa redimida exitosamente');
      // Aquí podrías mostrar un toast o modal de éxito
    } else {
      console.log('No se pudo redimir la recompensa');
      // Aquí podrías mostrar un mensaje de error
    }
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