import { Component, Input, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-indicator.component.html',
  styleUrls: ['./step-indicator.component.scss']
})
export class StepIndicatorComponent {
  @Input() currentStep: number = 1;
  @Input() totalSteps: number = 4;
  @Output() stepClick = new EventEmitter<number>();
  
  steps = computed(() => {
    const total = this.totalSteps;
    const current = this.currentStep;
    
    return Array.from({ length: total }, (_, index) => ({
      number: index + 1,
      isActive: index + 1 === current,
      isCompleted: index + 1 < current,
      label: this.getStepLabel(index + 1)
    }));
  });

  onStepClick(stepNumber: number) {
    this.stepClick.emit(stepNumber);
  }
  
  private getStepLabel(step: number): string {
    switch (step) {
      case 1:
        return 'Información básica';
      case 2:
        return 'Información de contacto';
      case 3:
        return 'Información del usuario';
      case 4:
        return 'Confirmar información';
      default:
        return `Paso ${step}`;
    }
  }
}