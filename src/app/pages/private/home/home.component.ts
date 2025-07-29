import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faStamp, faGift, faBell } from '@fortawesome/free-solid-svg-icons';
import { DashboardService } from '../user-home/home.service';
import { StampsCarouselComponent } from '../../../shared/components/stamps-carousel/stamps-carousel.component';
import { Aliado, AlliesCarouselComponent } from 'src/app/shared/components/allies-carousel/allies-carousel.component';
import { Novedad, NewsCarouselComponent } from 'src/app/shared/components/news-carousel/news-carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, StampsCarouselComponent, AlliesCarouselComponent, NewsCarouselComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Font Awesome icons
  faHome = faHome;
  faBell = faBell;
  faStamp = faStamp;
  faGift = faGift;

    aliados = signal<Aliado[]>([
    {
      id: 1,
      nombre: 'McDonald\'s',
      descripcion: 'Comida rápida',
      imagen: 'assets/images/hamb.png',
      activo: true
    },
    {
      id: 2,
      nombre: 'Café Montecruz',
      descripcion: 'Cafés y Postres',
      imagen: 'assets/images/hamb.png',
      activo: true
    },
    {
      id: 3,
      nombre: 'Farmacia Cruz Verde',
      descripcion: 'Salud y Bienestar',
      imagen: 'assets/images/hamb.png',
      activo: true
    },
    {
      id: 4,
      nombre: 'Supermercado Éxito',
      descripcion: 'Mercado y Hogar',
      imagen: 'assets/images/hamb.png',
      activo: true
    },
    {
      id: 5,
      nombre: 'Cine Colombia',
      descripcion: 'Entretenimiento',
      imagen: 'assets/images/hamb.png',
      activo: true
    },
    {
      id: 6,
      nombre: 'Librería Nacional',
      descripcion: 'Libros y Cultura',
      imagen: 'assets/images/hamb.png',
      activo: true
    }
  ]);
  
  novedades = signal<Novedad[]>([
    {
      id: 1,
      titulo: 'Obtén un granizado de café clásico gratis',
      subtitulo: 'cuando completes 10 sellos',
      imagenFondo: 'assets/images/pollo_news.png',
      icono: 'assets/logo/fidely-logo.png',
      activo: true
    },
    {
      id: 2,
      titulo: 'Descuento del 20% en hamburguesas',
      subtitulo: 'válido hasta fin de mes',
      imagenFondo: 'assets/images/hamburguesa_news.jpg',
      icono: 'assets/logo/fidely-logo.png',
      activo: true
    },
    {
      id: 3,
      titulo: 'Combo especial 2x1',
      subtitulo: 'en bebidas los viernes',
      imagenFondo: 'assets/images/ice_cream_news.png',
      icono: 'assets/logo/fidely-logo.png',
      activo: true
    }
  ]);
  
  // Inject dashboard service
  private dashboardService = inject(DashboardService);
  
  // Service signals
  userData = this.dashboardService.userData;
  sellos = this.dashboardService.sellos;
  recompensas = this.dashboardService.recompensas;
  activeSellos = this.dashboardService.activeSellos;
  availableRecompensas = this.dashboardService.availableRecompensas;
  recentActivity = this.dashboardService.recentActivity;
  
  ngOnInit() {
    this.dashboardService.loadUserData();
  }
}