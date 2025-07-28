import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast/toast.service';

@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-demo-container">
      <h2>Toast Service Demo</h2>
      <p>Prueba los diferentes tipos de toast con el diseño mejorado:</p>
      
      <div class="demo-buttons">
        <button class="demo-btn success" (click)="showSuccess()">✓ Éxito</button>
        <button class="demo-btn error" (click)="showError()">✕ Error</button>
        <button class="demo-btn warning" (click)="showWarning()">⚠ Advertencia</button>
        <button class="demo-btn info" (click)="showInfo()">ℹ Información</button>
      </div>
      
      <div class="demo-advanced">
        <h3>Opciones Avanzadas</h3>
        <button class="demo-btn advanced" (click)="showCustomToast()">Toast Personalizado</button>
        <button class="demo-btn advanced" (click)="showLongMessage()">Mensaje Largo</button>
        <button class="demo-btn advanced" (click)="showMultipleToasts()">Múltiples Toasts</button>
      </div>
      
      <div class="demo-info">
        <p><strong>Toasts en cola:</strong> {{ getQueueLength() }}</p>
        <button class="demo-btn clear" (click)="clearQueue()">Limpiar Cola</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-demo-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
      font-family: 'Lato', sans-serif;
    }
    
    h2 {
      color: var(--color-secondary);
      margin-bottom: 8px;
    }
    
    h3 {
      color: var(--color-secondary);
      margin: 24px 0 16px 0;
      font-size: 18px;
    }
    
    p {
      color: var(--text-secondary);
      margin-bottom: 24px;
      line-height: 1.6;
    }
    
    .demo-buttons, .demo-advanced, .demo-info {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    
    .demo-btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-family: 'Lato', sans-serif;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 120px;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      &.success {
        background: var(--success-color);
        color: white;
      }
      
      &.error {
        background: var(--danger-color);
        color: white;
      }
      
      &.warning {
        background: var(--warning-color);
        color: white;
      }
      
      &.info {
        background: var(--color-primary);
        color: var(--color-secondary);
      }
      
      &.advanced {
        background: var(--color-secondary);
        color: white;
      }
      
      &.clear {
        background: var(--text-secondary);
        color: white;
      }
    }
    
    .demo-info {
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--border-color);
      
      p {
        margin: 0;
        margin-right: auto;
      }
    }
  `]
})
export class ToastDemoComponent {
  constructor(private toastService: ToastService) {}
  
  showSuccess() {
    this.toastService.success('¡Operación completada exitosamente!');
  }
  
  showError() {
    this.toastService.error('Ha ocurrido un error inesperado');
  }
  
  showWarning() {
    this.toastService.warning('Advertencia: Revisa los datos ingresados');
  }
  
  showInfo() {
    this.toastService.info('Información importante para el usuario');
  }
  
  showCustomToast() {
    this.toastService.presentToast({
      message: 'Toast personalizado con configuración especial',
      type: 'success',
      duration: 6000,
      position: 'bottom',
      icon: '🎉'
    });
  }
  
  showLongMessage() {
    this.toastService.info(
      'Este es un mensaje muy largo que demuestra cómo el toast maneja contenido extenso de manera elegante y responsive',
      { duration: 7000 }
    );
  }
  
  showMultipleToasts() {
    this.toastService.success('Primer toast');
    setTimeout(() => this.toastService.warning('Segundo toast'), 500);
    setTimeout(() => this.toastService.info('Tercer toast'), 1000);
  }
  
  getQueueLength(): number {
    return this.toastService.getQueueLength();
  }
  
  clearQueue() {
    this.toastService.clearQueue();
  }
}