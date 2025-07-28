import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { User } from 'src/app/core/interfaces/auth.interface';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { environment } from 'src/environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderPrivateComponent } from '../header-private/header-private.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    IonicModule,
    TabBarComponent,
    FontAwesomeModule,
    SidebarComponent,
    HeaderPrivateComponent
  ],
  templateUrl: './private-layout.component.html',
  styleUrls: ['./private-layout.component.scss'],
})
export class PrivateLayoutComponent implements OnInit, OnDestroy {
  public user: User | any = null;
  public environment = environment.url;
  public profileImage: string = '';
  public count: number = 0;
  public activeMenuItem: string = 'dashboard';
  public sidebarOpen: boolean = false;
  public currentPageTitle: string = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // Cerrar sidebar automáticamente en desktop
    if (window.innerWidth >= 992 && this.sidebarOpen) {
      this.sidebarOpen = false;
    }
  }



  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  loadUser() {
    const userSub = this.userService.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.cdRef.detectChanges();
      }
    });

    this.subscriptions.push(userSub);
  }

  formatImageUrl(path: string): string {
    if (!path) return '/assets/images/default_user.png';
    return path;
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.authService.logout();
            this.navCtrl.navigateRoot('/auth/login');
          },
        },
      ],
    });

    await alert.present();
  }

  handleMenuItemSelected(menuItem: string) {
    this.activeMenuItem = menuItem;
  }
}