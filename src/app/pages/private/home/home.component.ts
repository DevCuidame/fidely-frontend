import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faStamp, faGift, faBell } from '@fortawesome/free-solid-svg-icons';
import { StampsCarouselComponent } from '../../../shared/components/stamps-carousel/stamps-carousel.component';
import { AlliesCarouselComponent } from 'src/app/shared/components/allies-carousel/allies-carousel.component';
import { Novedad, NewsCarouselComponent } from 'src/app/shared/components/news-carousel/news-carousel.component';
import { BusinessService } from '../../../core/services/business.service';
import { UserPointsService } from '../../../core/services/user-points.service';
import { BusinessRegistryData, IBusinessResponse } from '../../../core/interfaces/business-registry.interface';

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

  // Inject services
  private businessService = inject(BusinessService);
  private userPointsService = inject(UserPointsService);

  // Computed signal que usa directamente BusinessRegistryData
  allies = computed<IBusinessResponse[]>(() => {
    const businesses = this.businessService.approvedBusinesses();
    return businesses;
  });

  // Computed signals para el estado de los servicios
  isLoadingBusinesses = computed(() => this.businessService.loading());
  businessesError = computed(() => this.businessService.error());
  
  // Computed signals para puntos/sellos del usuario
  userPoints = computed(() => this.userPointsService.userPoints());
  globalBalance = computed(() => this.userPointsService.globalBalance());
  businessBalances = computed(() => this.userPointsService.businessBalances());
  totalAvailablePoints = computed(() => this.userPointsService.totalAvailablePoints());
  isLoadingPoints = computed(() => this.userPointsService.loading());
  pointsError = computed(() => this.userPointsService.error());
  
  // Computed signal para verificar si el usuario tiene sellos/puntos
  hasStamps = computed(() => this.userPointsService.hasPoints());
  
  // Computed signal que usa directamente los business balances sin mapear
  stampsData = computed(() => {
    const data = this.businessBalances();
    return data;
  });
  
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
  
  ngOnInit() {
    this.businessService.loadApprovedBusinesses();
    this.userPointsService.loadUserPoints();
  }
}