import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { MenuService, MenuOption, TabBarOption } from 'src/app/core/services/menu/menu.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { User } from 'src/app/core/interfaces/auth.interface';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-tab-bar',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './tab-bar.component.html',
  styleUrls: ['./tab-bar.component.scss']
})
export class TabBarComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = true; // Controla si la barra se muestra
  @Input() user: User | null = null; // Usuario actual
  @Input() background: string = '';
  
  showMenu: boolean = false;
  buttons: TabBarOption[] = [];
  menuItems: MenuOption[] = [];
  menuSections: { [key: string]: MenuOption[] } = {};

  constructor(
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private loadingService: LoadingService,
    private menuService: MenuService
  ) {}

  ngOnInit() {
    this.loadMenuOptions();
  }

  ngOnChanges() {
    if (this.user) {
      this.loadMenuOptions();
    }
  }

  private loadMenuOptions() {
    this.buttons = this.menuService.getTabBarOptions(this.user);
    this.menuItems = this.menuService.getTabBarMenuOptions(this.user);
    
    // Organizar opciones por secciones
    this.menuSections = {
      main: this.menuItems.filter(item => item.section === 'main'),
      profile: this.menuItems.filter(item => item.section === 'profile'),
      support: this.menuItems.filter(item => item.section === 'support'),
      danger: this.menuItems.filter(item => item.section === 'danger')
    };
    
    // Configurar acciones para los elementos del menú
    this.menuItems.forEach(item => {
      if (!item.action) {
        switch (item.id) {
          case 'whatsapp':
            item.action = () => this.openWhatsapp();
            break;
          case 'email':
            item.action = () => this.openEmail();
            break;
          case 'logout':
            item.action = () => this.confirmLogout();
            break;
          default:
            if (item.route) {
              item.action = () => this.navigate(item.route!);
            }
            break;
        }
      }
    });
  }

  navigate(route: string) {
    if (route) {
      this.router.navigate([route]);
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  hideMenu() {
    setTimeout(() => {
      this.showMenu = false;
    }, 100);
  }

  openWhatsapp = async () => {
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
  };

  openEmail = () => {
    const email = 'cuidame@esmart-tek.com';
    const subject = 'Consulta desde la App';
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    // Uso directo de window.location
    window.location.href = emailUrl;
  };

  async confirmLogout() {
    this.showMenu = false;
    
    const confirmed = await this.alertService.showConfirmAlert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?'
    );
    
    if (confirmed) {
      this.logout();
    }
  }

  async logout() {
    // Mostrar un indicador de carga 
    this.loadingService.showLoading('Cerrando sesión...');

    // Suscribirse al Observable que devuelve el método logout
    this.authService.logout()
      .pipe(
        finalize(() => {
          // Asegurarse de que el loading se cierre independientemente del resultado
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
          
          try {
            // Limpiar localStorage como fallback por si el storage service falló
            localStorage.removeItem('token');
            localStorage.removeItem('refresh-token');
            localStorage.removeItem('user');
            localStorage.removeItem('beneficiaries');
            localStorage.removeItem('activeBeneficiary');
            
            // Todavía redirigir al login
            this.router.navigate(['/auth/login'], { replaceUrl: true });
          } catch (e) {
            console.error('Error limpiando almacenamiento:', e);
            // En caso de error total, recargar la página
            window.location.href = '/auth/login';
          }
        }
      );
  }

  async showLoading() {
    this.loadingService.showLoading('Espera un momento, por favor...');
    return {
      dismiss: () => this.loadingService.hideLoading()
    };
  }

}