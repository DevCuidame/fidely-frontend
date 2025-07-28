import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  LoadingController,
  IonicModule,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ResetPasswordService } from 'src/app/core/services/reset-password.service';

@Component({
  selector: 'app-new-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CustomButtonComponent,
  ],
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NewPasswordComponent implements OnInit {
  // Propiedades públicas
  public newPasswordForm!: FormGroup;
  public isTokenInvalid: boolean = false;
  public showPassword: boolean = false;
  public showConfirmPassword: boolean = false;
  public router: Router;
  public isPasswordFocused: boolean = false;
  public isConfirmPasswordFocused: boolean = false;
  @Output() newPwdSuccess = new EventEmitter<void>();

  
  // Propiedades privadas
  private token: string = '';
  private isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private resetPasswordService: ResetPasswordService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    router: Router
  ) {
    this.router = router;
    this.initForm();
  }

  ngOnInit(): void {
    this.extractAndVerifyToken();
  }

  /**
   * Envía el formulario para cambiar la contraseña
   */
  async submitNewPassword(): Promise<void> {
    if (!this.isFormValid()) return;
    
    this.isSubmitting = true;
    const newPassword = this.newPasswordForm.get('password')?.value;
    const confirmPassword = this.newPasswordForm.get('confirmPassword')?.value;
    
    const loading = await this.createLoadingIndicator('Guardando nueva contraseña...');
    await loading.present();

    this.resetPasswordService.resetPassword(this.token, newPassword, confirmPassword)
      .pipe(
        finalize(() => {
          loading.dismiss();
          this.isSubmitting = false;
        }),
        catchError(error => {
          console.error('Error al restablecer contraseña:', error);
          let errorMessage = 'Ha ocurrido un error inesperado. Por favor, intente de nuevo más tarde.';
          
          if (error.status === 400) {
            errorMessage = 'Los datos proporcionados no son válidos.';
          } else if (error.status === 401) {
            errorMessage = 'El token ha expirado o no es válido. Solicita un nuevo enlace de restablecimiento.';
            this.isTokenInvalid = true;
          } else if (error.status === 422) {
            errorMessage = 'La contraseña no cumple con los requisitos de seguridad.';
          }
          
          this.showToast(errorMessage, 'danger');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.handleSuccessfulReset();
        }
      });
  }

  /**
   * Navega a la página de solicitud de restablecimiento
   */
  goToResetRequest(): void {
    this.router.navigate(['/auth/reset-password']);
  }
  
  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Maneja el foco en el campo de contraseña
   */
  onPasswordFocus(isFocused: boolean): void {
    this.isPasswordFocused = isFocused;
  }

  /**
   * Maneja el foco en el campo de confirmación
   */
  onConfirmPasswordFocus(isFocused: boolean): void {
    this.isConfirmPasswordFocused = isFocused;
  }

  // Métodos privados
  
  /**
   * Inicializa el formulario con validaciones básicas
   */
  private initForm(): void {
    this.newPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      confirmPassword: ['', [Validators.required, Validators.maxLength(50)]]
    }, { validators: this.checkPasswords });
  }

  /**
   * Valida que las contraseñas coincidan
   */
  private checkPasswords(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return password === confirmPassword ? null : { notMatching: true };
  }

  /**
   * Extrae el token de los parámetros de la ruta y lo verifica
   */
  private extractAndVerifyToken(): void {
     // 1. Primero intentamos obtener el token de los parámetros de consulta
     this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
        return;
      }
      
      // 2. Si no hay token en parámetros de consulta, intentamos con parámetros de ruta
      this.route.params.subscribe(routeParams => {
        if (routeParams['token']) {
          this.token = routeParams['token'];
          return;
        }
        
        // 3. Si llegamos aquí, no hay token
        console.error('No se encontró token en la URL');
        this.isTokenInvalid = true;
      });
    });
  }

  /**
   * Verifica si el formulario es válido para enviar
   */
  private isFormValid(): boolean {
    return this.newPasswordForm.valid && !this.isTokenInvalid && !this.isSubmitting;
  }

  /**
   * Maneja el flujo después de un restablecimiento exitoso
   */
  private async handleSuccessfulReset(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: '¡Éxito!',
      message: 'Tu contraseña ha sido restablecida correctamente. Serás redirigido al inicio de sesión.',
      buttons: [{
        text: 'Continuar',
        handler: () => {
          this.router.navigate(['/auth/login'], { replaceUrl: true });
        }
      }],
      backdropDismiss: false
    });
    
    await alert.present();
    
    // Fallback automático después de 3 segundos
    setTimeout(() => {
      alert.dismiss();
      this.router.navigate(['/auth/login'], { replaceUrl: true });
    }, 3000);
  }

  /**
   * Crea un indicador de carga con el mensaje especificado
   */
  private async createLoadingIndicator(message: string): Promise<HTMLIonLoadingElement> {
    return this.loadingCtrl.create({
      message: message,
    });
  }

  /**
   * Muestra un toast con el mensaje y color especificados
   */
  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
    });
    await toast.present();
  }
}