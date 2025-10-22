import { Injectable } from '@angular/core';
import { User } from '../../interfaces/auth.interface';

export interface MenuOption {
  id: string;
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  visible: boolean;
  order: number;
  section?: 'main' | 'profile' | 'support' | 'danger';
}

export interface TabBarOption {
  icon: string;
  route: string;
  visible: boolean;
  label?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor() { }

  /**
   * Obtiene las opciones del sidebar basadas en el rol del usuario
   * @param user Usuario actual
   * @returns Array de opciones de menú
   */
  getSidebarOptions(user: User | null): MenuOption[] {
    if (!user) return [];

    const baseOptions: MenuOption[] = [
      // Opciones principales
      {
        id: 'dashboard',
        label: 'Home',
        icon: 'home-outline',
        route: '/home',
        visible: false,
        order: 1,
        section: 'main'
      },
      {
        id: 'appointments',
        label: 'Citas',
        icon: 'calendar-outline',
        route: '/home/appointments',
        visible: this.isUserOrProfessional(user),
        order: 2,
        section: 'main'
      },
      {
        id: 'packages-catalog',
        label: 'Catálogo de Paquetes',
        icon: 'cube-outline',
        route: '/home/packages/catalog',
        visible: this.isUser(user),
        order: 3,
        section: 'main'
      },
      {
        id: 'my-packages',
        label: 'Mis Paquetes',
        icon: 'bag-outline',
        route: '/home/packages/my-packages',
        visible: this.isUser(user),
        order: 4,
        section: 'main'
      },
      {
        id: 'services-catalog',
        label: 'Catálogo de Servicios',
        icon: 'medical-outline',
        route: '/home/services/catalog',
        visible: this.isUser(user),
        order: 5,
        section: 'main'
      },
      {
        id: 'my-services',
        label: 'Mis Servicios',
        icon: 'checkmark-circle-outline',
        route: '/home/services/my-services',
        visible: this.isUser(user),
        order: 6,
        section: 'main'
      },
      // Opciones específicas para admin
      {
        id: 'professionals',
        label: 'Profesionales',
        icon: 'people-outline',
        route: '/home/professionals',
        visible: this.isProfessional(user),
        order: 7,
        section: 'main'
      },
      {
        id: 'admin-dashboard',
        label: 'Panel Admin',
        icon: 'shield-checkmark-outline',
        route: '/home/admin',
        visible: this.isAdmin(user),
        order: 8,
        section: 'main'
      },
      {
        id: 'users-management',
        label: 'Gestión de Usuarios',
        icon: 'person-add-outline',
        route: '/home/admin/users',
        visible: this.isAdmin(user),
        order: 9,
        section: 'main'
      },
      {
        id: 'professional-management',
        label: 'Gestión Profesionales',
        icon: 'medical-outline',
        route: '/home/admin/professionals',
        visible: this.isAdmin(user),
        order: 10,
        section: 'main'
      },
      {
        id: 'package-management',
        label: 'Gestión Paquetes',
        icon: 'cube-outline',
        route: '/home/admin/packages',
        visible: this.isAdmin(user),
        order: 11,
        section: 'main'
      },
      {
        id: 'service-management',
        label: 'Gestión Servicios',
        icon: 'construct-outline',
        route: '/home/admin/services',
        visible: this.isAdmin(user),
        order: 12,
        section: 'main'
      },
      {
        id: 'payment-overview',
        label: 'Ver Pagos',
        icon: 'card-outline',
        route: '/home/admin/payments',
        visible: this.isAdmin(user),
        order: 13,
        section: 'main'
      },
      {
        id: 'service-purchase',
        label: 'Registrar Compra',
        icon: 'bag-add-outline',
        route: '/home/admin/purchases/service',
        visible: this.isAdmin(user),
        order: 14,
        section: 'main'
      },
      {
        id: 'temp-customer-sessions',
        label: 'Sesiones Clientes Temporales',
        icon: 'people-circle-outline',
        route: '/home/admin/temp-customer-sessions',
        visible: this.isAdmin(user),
        order: 15,
        section: 'main'
      },
      // Opciones específicas para moderador
      {
        id: 'content-moderation',
        label: 'Moderación de Contenido',
        icon: 'shield-checkmark-outline',
        route: '/moderator/content',
        visible: this.isModerator(user),
        order: 16,
        section: 'main'
      },
      // Opciones específicas para profesional
      {
        id: 'my-schedule',
        label: 'Mi Horario',
        icon: 'time-outline',
        route: '/home/schedule',
        visible: this.isProfessional(user),
        order: 17,
        section: 'main'
      },
      {
        id: 'my-patients',
        label: 'Mis Clientes',
        icon: 'medical-outline',
        route: '/home/clients',
        // visible: this.isProfessional(user),
        visible: false,
        order: 18,
        section: 'main'
      },
      // Opciones de perfil
      {
        id: 'profile',
        label: 'Modificar Perfil',
        icon: 'person-outline',
        route: '/home/profile',
        visible: true,
        order: 20,
        section: 'profile'
      },
      {
        id: 'change-password',
        label: 'Cambiar Contraseña',
        icon: 'key-outline',
        route: '/home/change-password',
        visible: true,
        order: 21,
        section: 'profile'
      },
      // Opciones de soporte
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: 'logo-whatsapp',
        visible: true,
        order: 25,
        section: 'support'
      },
      {
        id: 'email',
        label: 'Correo Electrónico',
        icon: 'mail-outline',
        visible: true,
        order: 26,
        section: 'support'
      },
      // Opciones peligrosas
      {
        id: 'delete-account',
        label: 'Eliminar Cuenta',
        icon: 'trash-outline',
        route: (user && (user.role === 'Business' || user.role === 'business')) ? '/business/delete-account' : '/home/delete-account',
        visible: !this.isAdmin(user as User),
        order: 30,
        section: 'danger'
      },
      {
        id: 'logout',
        label: 'Cerrar sesión',
        icon: 'log-out-outline',
        visible: true,
        order: 31,
        section: 'danger'
      }
    ];

    return baseOptions
      .filter(option => option.visible)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Obtiene las opciones del tab-bar basadas en el rol del usuario
   * @param user Usuario actual
   * @returns Array de opciones del tab-bar
   */
  getTabBarOptions(user: User | null): TabBarOption[] {
    if (!user) return [];

    const baseOptions: TabBarOption[] = [
      {
        icon: 'home-outline',
        route: '/home',
        visible: true,
        label: 'Inicio'
      },
      {
        icon: 'ellipsis-horizontal',
        route: '', // Este es el botón del menú desplegable
        visible: true,
        label: 'Menú'
      },
      {
        icon: 'calendar-outline',
        route: '/home/appointments',
        visible: true,
        label: 'Citas'
      }
    ];

    // Opciones adicionales basadas en rol
    if (this.isAdminOrModerator(user)) {
      baseOptions.splice(2, 0, {
        icon: 'settings-outline',
        route: '/admin/dashboard',
        visible: true,
        label: 'Admin'
      });
    }

    if (this.isProfessional(user)) {
      baseOptions.splice(2, 0, {
        icon: 'medical-outline',
        route: '/professional/dashboard',
        visible: true,
        label: 'Profesional'
      });
    }

    return baseOptions.filter(option => option.visible);
  }

  /**
   * Obtiene las opciones del menú desplegable del tab-bar
   * @param user Usuario actual
   * @returns Array de opciones del menú desplegable
   */
  getTabBarMenuOptions(user: User | null): MenuOption[] {
    if (!user) return [];

    const baseMenuOptions: MenuOption[] = [
      {
        id: 'packages-catalog',
        label: 'Catálogo de Paquetes',
        icon: 'cube-outline',
        route: '/home/packages/catalog',
        visible: this.isUserOrProfessional(user),
        order: 1,
        section: 'main'
      },
      {
        id: 'my-packages',
        label: 'Mis Paquetes',
        icon: 'bag-outline',
        route: '/home/packages/my-packages',
        visible: this.isUserOrProfessional(user),
        order: 2,
        section: 'main'
      },
      {
        id: 'services-catalog',
        label: 'Catálogo de Servicios',
        icon: 'medical-outline',
        route: '/home/services/catalog',
        visible: this.isUserOrProfessional(user),
        order: 3,
        section: 'main'
      },
      {
        id: 'my-services',
        label: 'Mis Servicios',
        icon: 'checkmark-circle-outline',
        route: '/home/services/my-services',
        visible: this.isUserOrProfessional(user),
        order: 4,
        section: 'main'
      },
      // Opciones específicas para admin
      {
        id: 'professionals',
        label: 'Profesionales',
        icon: 'people-outline',
        route: '/home/professionals',
        visible: this.isAdminOrModerator(user),
        order: 5,
        section: 'main'
      },
      {
        id: 'users',
        label: 'Usuarios',
        icon: 'person-outline',
        route: '/home/users',
        visible: this.isAdminOrModerator(user),
        order: 6,
        section: 'main'
      },
      {
        id: 'my-patients',
        label: 'Mis Pacientes',
        icon: 'medical-outline',
        route: '/professional/patients',
        visible: this.isProfessional(user),
        order: 7,
        section: 'main'
      },
      // Opciones de perfil
      {
        id: 'profile',
        label: 'Modificar Perfil',
        icon: 'person-outline',
        route: '/home/profile',
        visible: true,
        order: 20,
        section: 'profile'
      },
      {
        id: 'change-password',
        label: 'Cambiar Contraseña',
        icon: 'key-outline',
        route: '/home/change-password',
        visible: true,
        order: 21,
        section: 'profile'
      },
      // Opciones de soporte
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: 'logo-whatsapp',
        visible: true,
        order: 25,
        section: 'support'
      },
      {
        id: 'email',
        label: 'Correo Electrónico',
        icon: 'mail-outline',
        visible: true,
        order: 26,
        section: 'support'
      },
      // Opciones peligrosas
      {
        id: 'delete-account',
        label: 'Eliminar Cuenta',
        icon: 'trash-outline',
        route: '/home/delete-account',
        visible: !this.isAdmin(user),
        order: 30,
        section: 'danger'
      },
      {
        id: 'logout',
        label: 'Cerrar sesión',
        icon: 'log-out-outline',
        visible: true,
        order: 31,
        section: 'danger'
      }
    ];

    return baseMenuOptions
      .filter(option => option.visible)
      .sort((a, b) => a.order - b.order);
  }

  // Métodos auxiliares para verificar roles
  private isAdmin(user: User): boolean {
    return user.role === 'Admin' || user.role === 'admin';
  }

  private isModerator(user: User): boolean {
    return user.role === 'Moderator' || user.role === 'moderator';
  }

  private isProfessional(user: User): boolean {
    return user.role === 'Professional' || user.role === 'professional';
  }

  private isUser(user: User): boolean {
    return user.role === 'Usuario' || user.role === 'usuario' || !user.role;
  }

  private isAdminOrModerator(user: User): boolean {
    return this.isAdmin(user) || this.isModerator(user);
  }

  private isUserOrProfessional(user: User): boolean {
    return this.isUser(user) || this.isProfessional(user);
  }

  /**
   * Obtiene las opciones agrupadas por sección para el sidebar
   * @param user Usuario actual
   * @returns Objeto con opciones agrupadas por sección
   */
  getSidebarOptionsBySection(user: User | null): { [key: string]: MenuOption[] } {
    const options = this.getSidebarOptions(user);
    
    return {
      main: options.filter(opt => opt.section === 'main'),
      profile: options.filter(opt => opt.section === 'profile'),
      support: options.filter(opt => opt.section === 'support'),
      danger: options.filter(opt => opt.section === 'danger')
    };
  }
}