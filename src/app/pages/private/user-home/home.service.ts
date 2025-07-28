import { Injectable, signal, computed } from '@angular/core';

export interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
  sellos: number;
  recompensasDisponibles: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

export interface Sello {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  activo: boolean;
  progreso: number;
  objetivo: number;
  fecha: Date;
}

export interface Recompensa {
  id: string;
  titulo: string;
  descripcion: string;
  costoSellos: number;
  disponible: boolean;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Signals para el estado del dashboard
  private _userData = signal<UserData>({
    id: '1',
    name: 'Usuario Demo',
    email: 'usuario@demo.com',
    image: '/assets/images/avatar.jpeg',
    sellos: 12,
    recompensasDisponibles: 3
  });

  private _notifications = signal<Notification[]>([
    {
      id: '1',
      title: 'Nuevo sello disponible',
      message: 'Visita nuestra tienda principal para obtener tu sello',
      date: new Date(),
      read: false
    },
    {
      id: '2',
      title: 'Recompensa desbloqueada',
      message: 'Has desbloqueado una nueva recompensa',
      date: new Date(Date.now() - 86400000), // 1 día atrás
      read: false
    },
    {
      id: '3',
      title: 'Promoción especial',
      message: 'Doble sellos este fin de semana',
      date: new Date(Date.now() - 172800000), // 2 días atrás
      read: true
    }
  ]);

  private _sellos = signal<Sello[]>([
    { 
      id: 1, 
      nombre: 'Sello Café Premium', 
      descripcion: 'Sello obtenido por compra de café premium',
      imagen: '/assets/images/hamb.png',
      activo: true,
      progreso: 8,
      objetivo: 10,
      fecha: new Date()
    },
    { 
      id: 2, 
      nombre: 'Sello Panadería', 
      descripcion: 'Sello por compra en panadería artesanal',
      imagen: '/assets/images/hamb.png',
      activo: true,
      progreso: 5,
      objetivo: 8,
      fecha: new Date(Date.now() - 86400000)
    },
    { 
      id: 3, 
      nombre: 'Sello Restaurante', 
      descripcion: 'Sello por cena en restaurante asociado',
      imagen: '/assets/images/hamb.png',
      activo: true,
      progreso: 3,
      objetivo: 5,
      fecha: new Date(Date.now() - 172800000)
    },
    { 
      id: 4, 
      nombre: 'Sello Librería', 
      descripcion: 'Sello por compra de libros',
      imagen: '/assets/images/hamb.png',
      activo: true,
      progreso: 10,
      objetivo: 10,
      fecha: new Date(Date.now() - 259200000)
    },
    { 
      id: 5, 
      nombre: 'Sello Farmacia', 
      descripcion: 'Sello por compras en farmacia',
      imagen: '/assets/images/hamb.png',
      activo: false,
      progreso: 7,
      objetivo: 12,
      fecha: new Date(Date.now() - 345600000)
    },
    { 
      id: 6, 
      nombre: 'Sello Supermercado', 
      descripcion: 'Sello por compras en supermercado',
      imagen: '/assets/images/hamb.png',
      activo: true,
      progreso: 15,
      objetivo: 20,
      fecha: new Date(Date.now() - 432000000)
    }
  ]);

  private _recompensas = signal<Recompensa[]>([
    {
      id: '1',
      titulo: 'Descuento 10%',
      descripcion: 'Descuento del 10% en tu próxima compra',
      costoSellos: 5,
      disponible: true
    },
    {
      id: '2',
      titulo: 'Producto Gratis',
      descripcion: 'Producto gratis de la línea básica',
      costoSellos: 10,
      disponible: true
    },
    {
      id: '3',
      titulo: 'Descuento 20%',
      descripcion: 'Descuento del 20% en compras mayores a $50',
      costoSellos: 15,
      disponible: true
    },
    {
      id: '4',
      titulo: 'Envío Gratis',
      descripcion: 'Envío gratuito en tu próximo pedido',
      costoSellos: 8,
      disponible: false
    }
  ]);

  // Computed signals
  userData = this._userData.asReadonly();
  notifications = this._notifications.asReadonly();
  sellos = this._sellos.asReadonly();
  recompensas = this._recompensas.asReadonly();

  unreadNotifications = computed(() => 
    this._notifications().filter(n => !n.read).length
  );

  activeSellos = computed(() => 
    this._sellos().filter(s => s.activo)
  );

  availableRecompensas = computed(() => 
    this._recompensas().filter(r => r.disponible && r.costoSellos <= this._userData().sellos)
  );

  recentActivity = computed(() => 
    this._sellos()
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 3)
  );

  // Métodos para actualizar el estado
  updateUserData(userData: Partial<UserData>) {
    this._userData.update(current => ({ ...current, ...userData }));
  }

  markNotificationAsRead(notificationId: string) {
    this._notifications.update(notifications => 
      notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }

  markAllNotificationsAsRead() {
    this._notifications.update(notifications => 
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  addSello(sello: Omit<Sello, 'id'>) {
    const newSello: Sello = {
      ...sello,
      id: Date.now()
    };
    this._sellos.update(sellos => [...sellos, newSello]);
    this._userData.update(user => ({ ...user, sellos: user.sellos + 1 }));
  }

  redeemRecompensa(recompensaId: string) {
    const recompensa = this._recompensas().find(r => r.id === recompensaId);
    if (recompensa && recompensa.disponible && recompensa.costoSellos <= this._userData().sellos) {
      this._userData.update(user => ({ 
        ...user, 
        sellos: user.sellos - recompensa.costoSellos 
      }));
      return true;
    }
    return false;
  }

  // Método para simular carga de datos
  loadUserData(userId?: string) {
    // Simular llamada a API
    setTimeout(() => {
      this.updateUserData({
        id: userId || 'current-user',
        name: 'Usuario Cargado',
        email: 'usuario@ejemplo.com'
      });
    }, 1000);
  }
}