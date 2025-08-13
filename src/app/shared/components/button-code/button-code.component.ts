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
  
  @Output() onCodeSubmit = new EventEmitter<string>();
  
  // Signal para controlar si se muestra el input
  showInput = signal(false);
  
  // Signal para el valor del input
  codeValue = signal('');
  
  // Método para manejar el click del botón principal
  onButtonClick(): void {
    if (!this.showInput()) {
      this.showInput.set(true);
    }
  }
  
  // Método para manejar el submit del código
  onSubmitCode(): void {
    if (this.codeValue().trim()) {
      this.onCodeSubmit.emit(this.codeValue());
      this.resetComponent();
    }
  }
  
  // Método para cancelar y volver al estado inicial
  onCancel(): void {
    this.resetComponent();
  }
  
  // Método para resetear el componente
  private resetComponent(): void {
    this.showInput.set(false);
    this.codeValue.set('');
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
