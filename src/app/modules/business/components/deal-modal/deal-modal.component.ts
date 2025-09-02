import { Component, Output, EventEmitter, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHandshake, faTimes } from '@fortawesome/free-solid-svg-icons';
import { DealService, CreateDealRequest } from '../../services/deal.service';
import { BusinessService } from '../../../../core/services/business.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { RewardSourceType } from '../../../../core/interfaces/deal.interface';

@Component({
  selector: 'app-deal-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './deal-modal.component.html',
  styleUrls: ['./deal-modal.component.scss']
})
export class DealModalComponent implements OnInit {
  // Font Awesome icons
  faHandshake = faHandshake;
  faTimes = faTimes;

  // Services
  private formBuilder = inject(FormBuilder);
  private dealService = inject(DealService);
  private businessService = inject(BusinessService);
  private toastService = inject(ToastService);

  // Signals
  private _isOpen = signal<boolean>(false);
  private _isLoading = signal<boolean>(false);

  // Form
  dealForm!: FormGroup;

  // Computed signals
  isOpen = computed(() => this._isOpen());
  isLoading = computed(() => this._isLoading());
  
  // Signal para controlar la visibilidad del resumen
  private _showSummary = signal<boolean>(false);
  showSummary = computed(() => this._showSummary());

  // Computed para la fecha mínima (hoy)
  minDate = computed(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Output events
  @Output() dealCreated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  ngOnInit() {
    this.initializeForm();
    this.setupFormSubscriptions();
  }

  private initializeForm() {
    this.dealForm = this.formBuilder.group({
      stamps: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      expiryDate: ['', [Validators.required, this.futureDateValidator]],
      customReward: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  private setupFormSubscriptions() {
    // Suscribirse a cambios en el formulario para actualizar el resumen
    this.dealForm.valueChanges.subscribe(() => {
      this.updateSummaryVisibility();
    });
  }

  private updateSummaryVisibility() {
    const stamps = this.dealForm?.get('stamps')?.value;
    const expiryDate = this.dealForm?.get('expiryDate')?.value;
    const isValid = stamps && expiryDate && stamps >= 1 && stamps <= 10;
    this._showSummary.set(!!isValid);
  }

  // Validador personalizado para fechas futuras
  private futureDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { pastDate: true };
  }

  // Método para manejar input de sellos (solo números)
  onStampsInput(event: any) {
    const value = event.target.value;
    // Remover cualquier carácter que no sea número
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Limitar a máximo 2 dígitos y valor máximo 10
    let finalValue = numericValue.slice(0, 2);
    if (parseInt(finalValue) > 10) {
      finalValue = '10';
    }
    
    // Actualizar el valor del formulario
    this.dealForm.get('stamps')?.setValue(finalValue);
  }

  // Calcular días entre hoy y la fecha de expiración
  calculateDays(): number {
    const expiryDate = this.dealForm?.get('expiryDate')?.value;
    if (!expiryDate) return 0;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  // Abrir modal
  show() {
    this._isOpen.set(true);
    this.dealForm.reset();
    this._showSummary.set(false);
  }

  // Cerrar modal
  onClose() {
    this._isOpen.set(false);
    this.dealForm.reset();
    this._showSummary.set(false);
    this.modalClosed.emit();
  }

  // Manejar click en backdrop
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  // Enviar formulario
  onSubmit() {
    if (this.dealForm.invalid || this._isLoading()) {
      this.markFormGroupTouched();
      return;
    }

    const userBusiness = this.businessService.userBusiness();
    const searchedCustomer = this.businessService.searchedCustomer();

    if (!userBusiness || !searchedCustomer) {
      this.toastService.error('Faltan datos del negocio o cliente');
      return;
    }

    this._isLoading.set(true);

    const formValue = this.dealForm.value;
    const dealData: CreateDealRequest = {
      business_id: userBusiness.id,
      user_id: searchedCustomer.id,
      title: 'Hagamos un trato',
      required_visits: parseInt(formValue.stamps),
      expires_at: new Date(formValue.expiryDate),
      reward_source_type: RewardSourceType.CUSTOM_REWARD,
      custom_reward_description: formValue.customReward,
      notes: `Deal creado para ${formValue.stamps} sellos con premio: ${formValue.customReward}`
    };

    console.log("🚀 ~ DealModalComponent ~ onSubmit ~ dealData:", dealData)
    this.dealService.createDeal(dealData).subscribe({
      next: (response) => {
        this._isLoading.set(false);
        if (response.success) {
          this.toastService.success('¡Deal creado exitosamente!');
          this.dealCreated.emit();
          this.onClose();
        } else {
          this.toastService.success(`Error al crear deal: ${response.message}`);
        }
      },
      error: (error) => {
        this._isLoading.set(false);
        this.toastService.success('Error al crear deal. Por favor, inténtelo de nuevo.');
      }
    });
  }

  // Marcar todos los campos como touched para mostrar errores
  private markFormGroupTouched() {
    Object.keys(this.dealForm.controls).forEach(key => {
      const control = this.dealForm.get(key);
      control?.markAsTouched();
    });
  }
}