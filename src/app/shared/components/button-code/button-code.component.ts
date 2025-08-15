import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-button-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './button-code.component.html',
  styleUrls: ['./button-code.component.scss']
})
export class ButtonCodeComponent {
  @Input() label: string = 'Botón';
  @Input() placeholder: string = 'Ingrese el código';
  @Input() buttonColor: string = '#ff6620';
  @Input() textColor: string = 'white';
  @Input() inputColor: string = '#20c997';
  @Input() fontSize: string = '0.875rem';
  @Input() padding: string = '1.5rem 2rem';
  @Input() borderRadius: string = '12px';
  @Input() disabled: boolean = false;
  @Input() simpleMode: boolean = false; // Modo simple solo requiere código
  
  @Output() onCodeSubmit = new EventEmitter<{purchaseAmount: number, description: string, invoiceNumber: string}>();
  @Output() onSimpleCodeSubmit = new EventEmitter<string>();
  
  // Signal para controlar si se muestra el formulario
  showInput = signal(false);
  
  // Signals para los valores del formulario
  purchaseAmount = signal<number>(0);
  description = signal<string>('');
  invoiceNumber = signal<string>('');
  simpleCode = signal<string>(''); // Para modo simple
  
  // Método para manejar el click del botón principal
  onButtonClick(): void {
    if (!this.disabled && !this.showInput()) {
      this.showInput.set(true);
    }
  }
  
  // Método para manejar el submit del formulario
  onSubmitCode(): void {
    if (!this.disabled && this.isFormValid()) {
      if (this.simpleMode) {
        this.onSimpleCodeSubmit.emit(this.simpleCode().trim());
      } else {
        this.onCodeSubmit.emit({
          purchaseAmount: this.purchaseAmount(),
          description: this.description().trim(),
          invoiceNumber: this.invoiceNumber().trim()
        });
      }
      this.resetComponent();
    }
  }

  // Método para validar el formulario
  isFormValid(): boolean {
    if (this.simpleMode) {
      return this.simpleCode().trim().length > 0;
    }
    return this.purchaseAmount() > 0 && 
           this.description().trim().length > 0 && 
           this.invoiceNumber().trim().length > 0;
  }
  
  // Método para cancelar y volver al estado inicial
  onCancel(): void {
    this.resetComponent();
  }
  
  // Método para resetear el componente
  private resetComponent(): void {
    this.showInput.set(false);
    this.purchaseAmount.set(0);
    this.description.set('');
    this.invoiceNumber.set('');
    this.simpleCode.set('');
  }
  
  // Método para manejar el Enter en el input
  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmitCode();
    } else if (event.key === 'Escape') {
      this.onCancel();
    }
  }
}
