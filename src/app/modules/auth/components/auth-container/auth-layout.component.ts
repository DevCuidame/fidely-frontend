import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TabBarComponent } from 'src/app/shared/components/tab-bar/tab-bar.component';
import { Keyboard } from '@capacitor/keyboard';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, TabBarComponent],
  template: `
    <ion-content [scrollY]="true" class="auth-content">
      <div class="auth-container" [class.business-register-page]="currentRoute.includes('/business-register')" [class.register-page]="currentRoute.includes('/register') && !currentRoute.includes('/business-register')">
        <!-- Desktop Left Side -->
        @if (!currentRoute.includes('/business-register')) {
          <div class="desktop-left-panel">
          </div>
        }

        <!-- Auth Card -->
        <div class="auth-card-wrapper">
          <div class="card">
        @if (!currentRoute.includes('/business-register')) {
            
            <div class="card-header">

              <div class="brand-section">
                <ion-img class="desktop-logo" src="assets/logo/logo_fidely.png"></ion-img>  
              </div>
              
              <!-- Mobile/Tablet Logo -->
              <div class="mobile-logo-container">
                <ion-img class="logo" src="assets/logo/fidely-logo.png"></ion-img>
              </div>

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

              }

            <div class="card-content">
              <router-outlet></router-outlet>
            </div>
            
            <div class="card-footer">
              @if (currentRoute.includes('/login')) {
                <p class="toggle-text">
                  ¿No tienes cuenta? <a (click)="navigateTo('/auth/register')">Regístrate aquí</a>
                </p>
              } @else if (currentRoute.includes('/auth/register')) {
                <p class="toggle-text">
                  ¿Ya tienes cuenta? <a (click)="navigateTo('/auth/login')">Inicia sesión</a>
                </p>
              } @else if (currentRoute.includes('/auth/reset-password')) {
                <p class="toggle-text">
                  ¿Recordaste tu contraseña?
                  <a (click)="navigateTo('/auth/login')">Inicia sesión</a>
                </p>
              }
            </div>
            
            <!-- Botón Registra tu negocio solo en login -->
            @if (currentRoute.includes('/login')) {
              <div class="business-register-section">
                <button 
                  type="button" 
                  class="business-register-btn"
                  (click)="navigateToBusinessRegister()">
                  Registra tu negocio
                </button>
              </div>
            }
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
export class AuthLayoutComponent implements OnInit, OnDestroy {
  currentRoute: string = '';
  @ViewChild('authContent', { static: false }) authContent!: ElementRef;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private platform: Platform
  ) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  ngOnInit() {
    if (this.platform.is('capacitor')) {
      this.setupKeyboardHandlers();
    }
  }

  ngOnDestroy() {
    if (this.platform.is('capacitor')) {
      Keyboard.removeAllListeners();
    }
  }

  private async setupKeyboardHandlers() {
    try {
      // Listener para cuando el teclado se muestra
      Keyboard.addListener('keyboardWillShow', (info) => {
        this.adjustForKeyboard(info.keyboardHeight, true);
      });

      // Listener para cuando el teclado se oculta
      Keyboard.addListener('keyboardWillHide', () => {
        this.adjustForKeyboard(0, false);
      });

      // Configurar el comportamiento del teclado
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
      await Keyboard.setScroll({ isDisabled: false });
    } catch (error) {
      console.log('Keyboard plugin not available:', error);
    }
  }

  private adjustForKeyboard(keyboardHeight: number, isShowing: boolean) {
    const authContainer = document.querySelector('.auth-container') as HTMLElement;
    const cardContent = document.querySelector('.card-content') as HTMLElement;
    
    if (authContainer && cardContent) {
      if (isShowing) {
        // Agregar espacio para el teclado
        authContainer.style.paddingBottom = `${keyboardHeight}px`;
        cardContent.style.paddingBottom = `calc(20px + ${keyboardHeight}px)`;
        
        // Scroll al input activo si es necesario
        setTimeout(() => {
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      } else {
        // Remover el espacio del teclado
        authContainer.style.paddingBottom = 'env(safe-area-inset-bottom)';
        cardContent.style.paddingBottom = '20px';
      }
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  navigateToBusinessRegister(): void {
    this.router.navigate(['/auth/business-register']);
  }
}