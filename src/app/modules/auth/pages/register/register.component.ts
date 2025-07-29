// src/app/modules/auth/pages/register/register.page.ts
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  AlertController,
  LoadingController,
  NavController,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/core/services/loading.service';
import { debounceTime, distinctUntilChanged, first } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { LocationService } from '../../services/location.service';
import { PrivacyPolicyModalComponent } from 'src/app/shared/components/privacy-policy-modal/privacy-policy-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CustomButtonComponent,
    PrivacyPolicyModalComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  @Output() registerSuccess = new EventEmitter<void>();
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  showPrivacyModal: boolean = false;
  registerForm: FormGroup;
  public buttonBackground: string = 'var(--color-tertiary)';
  public selectedImage: string | ArrayBuffer | null = null;
  public pubname: any;
  public departments: any[] = [];
  public cities: any[] = [];

  errorMessages: any = {
    first_name: 'El nombre solo puede contener letras y máximo 50 caracteres.',
    last_name: 'El apellido solo puede contener letras y máximo 50 caracteres.',
    identification_number: 'Formato inválido. Máximo 20 caracteres.',
    address: 'La dirección es obligatoria. Máximo 200 caracteres.',
    phone: 'Debe ser un número de teléfono válido de exactamente 10 dígitos.',
    email: 'Ingrese un correo electrónico válido. Máximo 100 caracteres.',
    gender: 'El género es obligatorio.',
    birth_date: 'La fecha de cumpleaños es obligatoria.',
    password:
      'La contraseña debe contener entre 8 y 50 caracteres, una mayúscula y un número.',
    confirmPassword: 'Las contraseñas no coinciden.',
    imagebs64: 'Debe subir una imagen de perfil.',
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private locationService: LocationService,
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        first_name: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$'), Validators.maxLength(50)],
        ],
        last_name: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$'), Validators.maxLength(50)],
        ],
        identification_type: ['', Validators.required],
        identification_number: ['', [Validators.required, Validators.maxLength(20)]],
        address: ['', [Validators.required, Validators.maxLength(200)]],
        city_id: [null, Validators.required],
        department: [null, Validators.required], // Solo para UI, no se envia
        gender: ['', Validators.required],
        birth_date: ['', Validators.required],
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern('^[0-9-]+$'),
            Validators.minLength(10),
            Validators.maxLength(10),
          ],
        ],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(50),
            Validators.pattern(
              '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$'
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        pubname: [''],
        imagebs64: ['', Validators.required],
        privacy_policy: [false, Validators.requiredTrue],
      },
      { validator: this.passwordMatchValidator }
    );

    this.setupRealTimeValidation();
  }

  ngOnInit() {
    this.loadDepartments();

    this.registerForm
      .get('password')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.registerForm
          .get('confirmPassword')
          ?.updateValueAndValidity({ onlySelf: true });
      });

    this.registerForm
      .get('confirmPassword')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.registerForm
          .get('confirmPassword')
          ?.updateValueAndValidity({ onlySelf: true });
      });

    this.registerForm
      .get('department')
      ?.valueChanges.subscribe((departmentId) => {
        this.loadCities(departmentId);
      });

    // Validación dinámica para identification_number según el tipo
    this.registerForm
      .get('identification_type')
      ?.valueChanges.subscribe((identificationType) => {
        const identificationNumberControl = this.registerForm.get('identification_number');
        if (identificationNumberControl) {
          // Limpiar validadores existentes
          identificationNumberControl.clearValidators();
          
          // Agregar validadores según el tipo
          if (identificationType === 'PASSPORT') {
            identificationNumberControl.setValidators([
              Validators.required,
              Validators.pattern('^[A-Za-z0-9]+$') // Permite letras y números para pasaporte
            ]);
          } else {
            identificationNumberControl.setValidators([
              Validators.required,
              Validators.pattern('^[0-9]+$') // Solo números para otros tipos
            ]);
          }
          
          // Actualizar validación
          identificationNumberControl.updateValueAndValidity();
        }
      });
  }

  loadDepartments() {
    this.locationService.fetchDepartments();
    this.locationService.departments$.subscribe((departments) => {
      this.departments = departments;
    });
  }

  loadCities(departmentId: number) {
    this.locationService.fetchCitiesByDepartment(departmentId);
    this.locationService.cities$.subscribe((cities) => {
      this.cities = cities;
    });
  }
  setupRealTimeValidation() {
    this.registerForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.registerForm.updateValueAndValidity({
        onlySelf: true,
        emitEvent: false,
      });
    });
  }
  passwordMatchValidator(formGroup: FormGroup): null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword');

    if (!confirmPassword) return null;

    if (confirmPassword.value && confirmPassword.value !== password) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
      confirmPassword.setErrors(null);
    }

    return null;
  }

  goToLogin() {
    this.navCtrl.navigateForward('/auth/login');
  }

  goToPrivacyPolicy() {
    // Show privacy policy modal while preserving the current form state
    this.showPrivacyModal = true;
  }

  closePrivacyModal() {
    this.showPrivacyModal = false;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  getErrorMessage(field: string): string | null {
    if (
      this.registerForm.get(field)?.invalid &&
      this.registerForm.get(field)?.touched
    ) {
      // Mensaje específico para identification_number según el tipo
      if (field === 'identification_number') {
        const identificationType = this.registerForm.get('identification_type')?.value;
        if (identificationType === 'PASSPORT') {
          return 'El pasaporte debe contener solo letras y números.';
        } else {
          return 'Debe ser un número válido.';
        }
      }
      return this.errorMessages[field];
    }
    return null;
  }

  async register() {
    if (!this.selectedImage) {
      const alert = await this.alertCtrl.create({
        header: 'Falta imagen',
        message: 'Por favor, carga una imagen antes de continuar.',
        cssClass: 'custom-alert error-alert',
        backdropDismiss: false,
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    if (this.registerForm.valid) {
      this.loadingService.showLoading('Registrando...');
      const { confirmPassword, department, privacy_policy, ...formData } =
        this.registerForm.value;

      // Mapear los nombres de campos del formulario a los esperados por la API
      const registerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        identification_type: formData.identification_type,
        identification_number: formData.identification_number,
        address: formData.address,
        city_id: Number(formData.city_id) || null,
        gender: formData.gender,
        birth_date: formData.birth_date,
        phone: String(formData.phone),
        email: formData.email,
        password: formData.password,
        imagebs64: formData.imagebs64,
        pubname: formData.pubname
      };

      this.authService.register(registerData as any).subscribe(
        async () => {
          this.loadingService.hideLoading();
          const alert = await this.alertCtrl.create({
            header: 'Registro exitoso',
            message:
              'Tu cuenta ha sido creada con éxito. Por favor, revisa tu correo.',
            cssClass: 'custom-alert success-alert',
            backdropDismiss: false,
            buttons: ['OK'],
          });
          this.navCtrl.navigateRoot('/auth/login');
          await alert.present();
          this.registerSuccess.emit();
        },
        async (error) => {
          this.loadingService.hideLoading();

          // Usar el mensaje que viene del servicio
          let errorMessage =
            error.message ||
            'Hubo un problema al crear la cuenta. Inténtalo de nuevo.';

          if (
            errorMessage.includes('No logramos registrar tu correo electrónico')
          ) {
            errorMessage =
              'El correo electrónico ya está registrado. Por favor utilice otro.';
          }

          const alert = await this.alertCtrl.create({
            header: 'Error en el registro',
            message: errorMessage,
            cssClass: 'custom-alert error-alert',
            backdropDismiss: false,
            buttons: ['OK'],
          });

          await alert.present();
          console.error('Error en el registro:', error);
        }
      );
    }
  }

  // Image Controller

  selectImage() {
    document.getElementById('imageInput')?.click();
  }

  async optimizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas to resize the image
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions (max 800px width/height)
          const MAX_SIZE = 800;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw resized image to canvas
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to JPEG with reduced quality
          const quality = 0.7; // 70% quality
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(optimizedDataUrl);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = event.target.result;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  async onImageSelected(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    // Validar tipo de archivo
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/heic',
      'image/heif',
    ];
    if (!validTypes.includes(file.type)) {
      const alert = await this.alertCtrl.create({
        header: 'Formato no válido',
        message: 'Solo se permiten imágenes en formato JPG, PNG, GIF o HEIC.',
        cssClass: 'custom-alert error-alert',
        backdropDismiss: false,
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const alert = await this.alertCtrl.create({
        header: 'Archivo demasiado grande',
        message: 'El tamaño máximo permitido es 5MB.',
        cssClass: 'custom-alert error-alert',
        backdropDismiss: false,
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    try {
      // Optimizar la imagen antes de convertirla a base64
      const optimizedImage = await this.optimizeImage(file);

      this.selectedImage = optimizedImage;
      this.registerForm.patchValue({
        imagebs64: optimizedImage,
        pubname: file.name,
      });
    } catch (error) {
      console.error('Error optimizing image:', error);

      // Fallback to standard FileReader if optimization fails
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
        this.registerForm.patchValue({
          imagebs64: e.target.result,
          pubname: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
