import { Component, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ResetPasswordService } from 'src/app/core/services/reset-password.service';
import { AlertService } from 'src/app/core/services/alert.service';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CustomButtonComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ResetPasswordComponent {
  public buttonBackground: string = 'var(--color-secondary)';
  resetPasswordForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private alertService: AlertService,
    private loadingService: LoadingService
  ) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    });
  }

  async resetPassword() {
    if (this.resetPasswordForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const email = this.resetPasswordForm.get('email')?.value;
      
      await this.loadingService.showLoading('Procesando solicitud...');

      this.resetPasswordService.requestPasswordReset(email)
        .pipe(
          finalize(() => {
            this.loadingService.hideLoading();
            this.isSubmitting = false;
          }),
          catchError(error => {
            console.error('Error al solicitar restablecimiento de contraseña:', error);
            this.alertService.showErrorAlert(
              'Ha ocurrido un error. Por favor, intente de nuevo más tarde.',
              'Error al procesar solicitud'
            );
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            this.resetPasswordForm.reset();
            this.alertService.showSuccessAlert(
              'Se ha enviado un correo con instrucciones para restablecer tu contraseña.',
              'Solicitud enviada'
            );
          }
        });
    }
  }


}