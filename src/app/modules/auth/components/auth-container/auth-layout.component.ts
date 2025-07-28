import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TabBarComponent],
  template: `
    <ion-content scroll-y="false">
      <div class="auth-container">
        <!-- Desktop Left Side -->
        <div class="desktop-left-panel">
          <div class="brand-section">
            <ion-img class="desktop-logo" src="assets/logo/logo.png"></ion-img>
            <h1 class="brand-title">Bienvenido</h1>
            <p class="brand-subtitle">Masajes terapéuticos y estéticos.</p>
          </div>
        </div>

        <!-- Mobile/Tablet Logo -->
        <div class="mobile-logo-container">
          <ion-img class="logo" src="assets/logo/logo.png"></ion-img>
        </div>

        <!-- Auth Card -->
        <div class="auth-card-wrapper">
          <div class="card">
            <div class="card-header">
              <h2 class="card-title">
                @if (currentRoute.includes('/login')) {
                  Iniciar Sesión
                } @else if (currentRoute.includes('/register')) {
                  Crear Cuenta
                } @else if (currentRoute.includes('/reset-password')) {
                  Recuperar Contraseña
                }
              </h2>
              <p class="card-subtitle">
                @if (currentRoute.includes('/login')) {
                  Ingresa tus credenciales para continuar
                } @else if (currentRoute.includes('/register')) {
                  Complete el formulario para crear su cuenta
                } @else if (currentRoute.includes('/reset-password')) {
                  Te enviaremos un enlace para restablecer tu contraseña
                }
              </p>
            </div>

            <div class="card-content">
              <router-outlet></router-outlet>
            </div>
            
            <div class="card-footer">
              @if (currentRoute.includes('/login')) {
                <p class="toggle-text">
                  ¿No tienes cuenta? <a (click)="navigateTo('/register')">Regístrate aquí</a>
                </p>
              } @else if (currentRoute.includes('/register')) {
                <p class="toggle-text">
                  ¿Ya tienes cuenta? <a (click)="navigateTo('/login')">Inicia sesión</a>
                </p>
              } @else if (currentRoute.includes('/reset-password')) {
                <p class="toggle-text">
                  ¿Recordaste tu contraseña?
                  <a (click)="navigateTo('/login')">Inicia sesión</a>
                </p>
              }
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Mobile Tab Bar -->
    <app-tab-bar
      class="mobile-tab-bar"
      [isVisible]="true"
      [user]="null"
      [background]="'var(--color-light)'"
    ></app-tab-bar>
  `,
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {
  currentRoute: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  navigateTo(path: string): void {
    this.router.navigate(['/auth' + path]);
  }
}