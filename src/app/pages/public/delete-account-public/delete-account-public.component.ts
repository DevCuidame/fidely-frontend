import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faExclamationTriangle,
  faInfoCircle,
  faLock,
  faCheckCircle,
  faArrowLeft,
  faTrash,
  faEnvelope,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-delete-account-public',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './delete-account-public.component.html',
  styleUrls: ['./delete-account-public.component.scss'],
})
export class DeleteAccountPublicComponent implements OnInit {
  // FontAwesome icons
  faExclamationTriangle = faExclamationTriangle;
  faInfoCircle = faInfoCircle;
  faLock = faLock;
  faCheckCircle = faCheckCircle;
  faArrowLeft = faArrowLeft;
  faTrash = faTrash;

  faEnvelope = faEnvelope;
  faEye = faEye;
  faEyeSlash = faEyeSlash;

  deleteForm: FormGroup;
  isDeleting: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Error messages
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  confirmationError: string = '';
  generalError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.deleteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      confirmation: ['', [Validators.required, this.confirmationValidator]],
      reason: [''],
      otherReason: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.setupFormValidation();
  }

  private setupFormValidation() {
    // Email validation
    this.deleteForm.get('email')?.valueChanges.subscribe(() => {
      this.emailError = '';
    });

    // Password validation
    this.deleteForm.get('password')?.valueChanges.subscribe(() => {
      this.passwordError = '';
    });

    // Confirm password validation
    this.deleteForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.confirmPasswordError = '';
    });

    // Confirmation validation
    this.deleteForm.get('confirmation')?.valueChanges.subscribe(() => {
      this.confirmationError = '';
    });
  }

  private confirmationValidator(control: any) {
    return control.value === 'ELIMINAR' ? null : { invalidConfirmation: true };
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async confirmDeletion() {
    if (this.deleteForm.invalid || this.isDeleting) {
      this.updateFormErrors();
      return;
    }

    this.isDeleting = true;
    this.generalError = '';

    try {
      const formData = {
        email: this.deleteForm.get('email')?.value,
        password: this.deleteForm.get('password')?.value,
        reason: this.deleteForm.get('reason')?.value,
        otherReason: this.deleteForm.get('otherReason')?.value
      };

      await this.executeAccountDeletion(formData);
    } catch (error) {
      console.error('Error during account deletion:', error);
      this.generalError = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
    } finally {
      this.isDeleting = false;
    }
  }

  private async executeAccountDeletion(data: any) {
    try {
      // First authenticate the user with email and password only
      const loginData = {
        email: data.email,
        password: data.password
      };
      
      const authResult = await this.authService.login(loginData).toPromise();
      
      if (authResult && authResult.success) {
        // If authentication successful, proceed with account deletion
        await this.deleteAccount(data);
      } else {
        this.generalError = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      if (error.status === 401 || error.status === 400) {
        this.generalError = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      } else {
        this.generalError = 'Error de conexión. Por favor, inténtalo de nuevo.';
      }
    }
  }

  private async deleteAccount(data: any) {
    try {
      // Call the delete account service with proper parameters
      const deleteData = {
        password: data.password,
        reason: data.reason,
        otherReason: data.otherReason,
        confirmation: 'ELIMINAR',
        timestamp: new Date().toISOString()
      };
      
      const result = await this.authService.deleteAccount(deleteData).toPromise();
      
      if (result && result.success) {
        // Show success message and redirect
        alert('Tu cuenta ha sido eliminada exitosamente.');
        this.router.navigate(['/auth/login']);
      } else {
        this.generalError = 'No se pudo eliminar la cuenta. Por favor, contacta al soporte.';
      }
    } catch (error) {
      console.error('Delete account error:', error);
      this.generalError = 'Error al eliminar la cuenta. Por favor, contacta al soporte.';
    }
  }

  private updateFormErrors() {
    const emailControl = this.deleteForm.get('email');
    const passwordControl = this.deleteForm.get('password');
    const confirmPasswordControl = this.deleteForm.get('confirmPassword');
    const confirmationControl = this.deleteForm.get('confirmation');

    if (emailControl?.invalid && emailControl?.touched) {
      if (emailControl.errors?.['required']) {
        this.emailError = 'El email es requerido';
      } else if (emailControl.errors?.['email']) {
        this.emailError = 'Ingresa un email válido';
      }
    }

    if (passwordControl?.invalid && passwordControl?.touched) {
      if (passwordControl.errors?.['required']) {
        this.passwordError = 'La contraseña es requerida';
      } else if (passwordControl.errors?.['minlength']) {
        this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    if (confirmPasswordControl?.invalid && confirmPasswordControl?.touched) {
      if (confirmPasswordControl.errors?.['required']) {
        this.confirmPasswordError = 'Confirma tu contraseña';
      }
    }

    if (this.deleteForm.errors?.['passwordMismatch']) {
      this.confirmPasswordError = 'Las contraseñas no coinciden';
    }

    if (confirmationControl?.invalid && confirmationControl?.touched) {
      if (confirmationControl.errors?.['required']) {
        this.confirmationError = 'Debes escribir "ELIMINAR" para confirmar';
      } else if (confirmationControl.errors?.['invalidConfirmation']) {
        this.confirmationError = 'Debes escribir exactamente "ELIMINAR"';
      }
    }
  }

  goBack() {
    this.router.navigate(['/auth/login']);
  }

  selectReason(value: string) {
    this.deleteForm.patchValue({ reason: value });
  }

  contactWhatsapp() {
    const phoneNumber = '+573001234567'; // Replace with actual support number
    const message = encodeURIComponent('Hola, necesito ayuda con mi cuenta de Fidely.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  contactEmail() {
    const email = 'soporte@fidely.com'; // Replace with actual support email
    const subject = encodeURIComponent('Ayuda con cuenta - Fidely');
    const body = encodeURIComponent('Hola, necesito ayuda con mi cuenta de Fidely.');
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  }
}