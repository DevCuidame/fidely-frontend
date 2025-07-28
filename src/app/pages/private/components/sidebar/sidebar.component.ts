import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { User } from 'src/app/core/interfaces/auth.interface';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import {
  MenuService,
  MenuOption,
} from 'src/app/core/services/menu/menu.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="sidebar">
      <div class="profile-section">
        <div class="avatar-container">
          <img
            [src]="
              user?.path
                ? formatImageUrl(user.path)
                : user?.imagebs64 || '/assets/images/default_user.png'
            "
            [alt]="user?.first_name"
          />
        </div>
        <div class="user-info">
          <h3>
            {{ user?.first_name?.split(' ')[0] }}
            {{ user?.last_name?.split(' ')[0] }}
          </h3>
        </div>
      </div>

      <div class="menu-section">
        <!-- Menú Principal Desplegable -->
        <div
          class="menu-group"
          *ngIf="(menuSections?.['main']?.length || 0) > 0"
        >
          <div class="menu-group-header" (click)="toggleMenuGroup('main')">
            <ion-icon name="home-outline"></ion-icon>
            <span>Menú Principal</span>
            <ion-icon
              [name]="
                expandedGroups['main']
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
              class="expand-icon"
            >
            </ion-icon>
          </div>
          <div
            class="menu-group-content"
            [class.expanded]="expandedGroups['main']"
          >
            <ng-container *ngFor="let option of menuSections['main']">
              <div
                class="menu-item"
                [class.active]="
                  option.route && isExactActiveRoute([option.route])
                "
                (click)="executeMenuAction(option)"
              >
                <ion-icon [name]="option.icon" class="menu-icon"></ion-icon>
                <span class="menu-text">{{ option.label }}</span>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Menú de Perfil Desplegable -->
        <div
          class="menu-group"
          *ngIf="(menuSections?.['profile']?.length || 0) > 0"
        >
          <div class="menu-group-header" (click)="toggleMenuGroup('profile')">
            <ion-icon name="person-outline"></ion-icon>
            <span>Mi Perfil</span>
            <ion-icon
              [name]="
                expandedGroups['profile']
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
              class="expand-icon"
            >
            </ion-icon>
          </div>
          <div
            class="menu-group-content"
            [class.expanded]="expandedGroups['profile']"
          >
            <ng-container *ngFor="let option of menuSections['profile']">
              <div
                class="menu-item"
                [class.active]="isExactActiveRoute([option.route || ''])"
                (click)="executeMenuAction(option)"
              >
                <ion-icon [name]="option.icon" class="menu-icon"></ion-icon>
                <span class="menu-text">{{ option.label }}</span>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Menú de Configuración Peligrosa -->
        <div
          class="menu-group"
          *ngIf="(menuSections?.['danger']?.length || 0) > 0"
        >
          <div
            class="menu-group-header danger"
            (click)="toggleMenuGroup('danger')"
          >
            <ion-icon name="warning-outline"></ion-icon>
            <span>Configuración</span>
            <ion-icon
              [name]="
                expandedGroups['danger']
                  ? 'chevron-up-outline'
                  : 'chevron-down-outline'
              "
              class="expand-icon"
            >
            </ion-icon>
          </div>
          <div
            class="menu-group-content"
            [class.expanded]="expandedGroups['danger']"
          >
            <ng-container *ngFor="let option of menuSections['danger']">
              <div
                class="menu-item danger"
                [class.active]="
                  option.route && isExactActiveRoute([option.route])
                "
                (click)="executeMenuAction(option)"
              >
                <ion-icon [name]="option.icon" class="menu-icon"></ion-icon>
                <span class="menu-text">{{ option.label }}</span>
              </div>
            </ng-container>
          </div>
        </div>
      </div>

      <div class="logout-section">
        <div class="menu-item" (click)="confirmLogout()">
          <ion-icon name="log-out-outline"></ion-icon>
          <span>Cerrar sesión</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() user: User | any = null;
  @Output() menuItemSelected = new EventEmitter<string>();
  @Output() logoutRequested = new EventEmitter<void>();

  private routerSubscription: Subscription = new Subscription();
  public currentUrl: string = '';
  public menuSections: { [key: string]: MenuOption[] } = {};
  public expandedGroups: { [key: string]: boolean } = {
    main: true, // El menú principal se muestra expandido por defecto
    profile: false,
    danger: false,
  };

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    @Inject(MenuService) private menuService: MenuService
  ) {}

  ngOnInit() {
    // Obtener la URL actual al inicializar
    this.currentUrl = this.router.url;

    // Cargar opciones de menú iniciales
    this.loadMenuOptions();

    // Suscribirse a los cambios de ruta
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects || event.url;
      }
    });
  }

  ngOnChanges() {
    // Recargar opciones cuando cambie el usuario
    if (this.user) {
      this.loadMenuOptions();
    }
  }

  private loadMenuOptions() {
    this.menuSections = this.menuService.getSidebarOptionsBySection(this.user);
  }

  ngOnDestroy() {
    // Limpiar suscripción para evitar memory leaks
    this.routerSubscription.unsubscribe();
  }

  /**
   * Verifica si alguna de las rutas proporcionadas coincide con la URL actual
   * @param routes Array de strings que pueden estar en la URL actual
   * @returns boolean indicando si la ruta está activa
   */
  isActiveRoute(routes: string[]): boolean {
    if (!this.currentUrl || !routes.length) return false;

    // Normalizar la URL (remover parámetros de query y fragmentos)
    const normalizedUrl = this.currentUrl
      .split('?')[0]
      .split('#')[0]
      .toLowerCase();

    // Verificar si alguna de las rutas está contenida en la URL actual
    return routes.some((route) => {
      const normalizedRoute = route.toLowerCase();
      return normalizedUrl.includes(normalizedRoute);
    });
  }

  /**
   * Método alternativo más específico para verificar rutas exactas
   * @param routes Array de rutas exactas
   * @returns boolean
   */
  isExactActiveRoute(routes: string[]): boolean {
    if (!this.currentUrl || !routes.length) return false;

    const normalizedUrl = this.currentUrl
      .split('?')[0]
      .split('#')[0]
      .toLowerCase();

    return routes.some((route) => {
      const normalizedRoute = route.toLowerCase();
      return (
        normalizedUrl === `/${normalizedRoute}` ||
        normalizedUrl === normalizedRoute
      );
    });
  }

  formatImageUrl(path: string): string {
    if (!path) return '/assets/images/default_user.png';
    return environment.url + path;
  }

  navigateTo(route: string): void {
    this.menuItemSelected.emit(route);

    if (route) {
      this.router.navigate([route]);
    }
  }

  executeMenuAction(option: MenuOption): void {
    if (option.action) {
      option.action();
    } else if (option.route) {
      this.navigateTo(option.route);
    }
  }

  /**
   * Alterna la expansión de un grupo de menú
   * @param groupName Nombre del grupo a alternar
   */
  toggleMenuGroup(groupName: string): void {
    this.expandedGroups[groupName] = !this.expandedGroups[groupName];
  }

  // Método para abrir WhatsApp (copiado del tab-bar)
  async openWhatsapp() {
    const loading = await this.showLoading();
    try {
      const whatsappUrl =
        'whatsapp://send?phone=573007306645&text=Hola, me gustaría hablar con un asesor de Cuídame.';
      window.location.href = whatsappUrl;

      setTimeout(() => {
        window.open(
          'https://web.whatsapp.com/send?phone=573007306645&text=Hola, me gustaría hablar con un asesor de Cuídame.',
          '_blank'
        );
      }, 500);
    } catch (error) {
      console.error('Error al abrir WhatsApp:', error);
    } finally {
      if (loading) {
        loading.dismiss();
      }
    }
  }

  // Método para abrir email (copiado del tab-bar)
  openEmail() {
    const email = 'cuidame@esmart-tek.com';
    const subject = 'Consulta desde la App';
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    window.location.href = emailUrl;
  }

  // Método para confirmar eliminación de cuenta
  async confirmDeleteAccount() {
    this.navCtrl.navigateForward('/home/delete-account');
  }

  async confirmLogout() {
    const confirmed = await this.alertService.showConfirmAlert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      'Confirmar',
      'Cancelar'
    );

    if (confirmed) {
      this.logout();
    }
  }

  // Método de logout mejorado usando LoadingService
  async logout() {
    await this.loadingService.showLoading('Cerrando sesión...');

    this.authService
      .logout()
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
          window.location.href = '/auth/login';
        },
        (error) => {
          console.error('Error al cerrar sesión:', error);

          try {
            // Limpiar localStorage como fallback
            localStorage.removeItem('token');
            localStorage.removeItem('refresh-token');
            localStorage.removeItem('user');
            localStorage.removeItem('beneficiaries');
            localStorage.removeItem('activeBeneficiary');

            this.router.navigate(['/auth/login'], { replaceUrl: true });
            window.location.href = '/auth/login';
          } catch (e) {
            console.error('Error limpiando almacenamiento:', e);
            window.location.href = '/auth/login';
          }
        }
      );
  }

  // Método para mostrar loading usando LoadingService
  async showLoading() {
    await this.loadingService.showLoading('Espera un momento, por favor...');
    return {
      dismiss: () => this.loadingService.hideLoading(),
    };
  }
}
