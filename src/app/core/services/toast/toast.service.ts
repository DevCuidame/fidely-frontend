import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

// Tipos de toast mejorados
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom' | 'middle';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  showCloseButton?: boolean;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastQueue: ToastOptions[] = [];
  private isToastPresenting: boolean = false;

  // Configuración de iconos para cada tipo
  private readonly toastIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  constructor(private toastController: ToastController) {}

  /**
   * Presenta un toast con las opciones especificadas
   * @param options Opciones del toast
   */
  async presentToast(options: ToastOptions | string) {
    // Normalizar opciones
    const toastOptions: ToastOptions = typeof options === 'string' 
      ? { message: options }
      : options;

    const finalOptions: Required<ToastOptions> = {
      message: toastOptions.message,
      type: toastOptions.type || 'info',
      duration: toastOptions.duration || 4000,
      position: toastOptions.position || 'top',
      showCloseButton: toastOptions.showCloseButton ?? true,
      icon: toastOptions.icon || this.toastIcons[toastOptions.type || 'info']
    };

    // Añadir a la cola
    this.toastQueue.push(finalOptions);
    
    // Si no hay un toast presentándose, iniciar la presentación
    if (!this.isToastPresenting) {
      await this.presentNextToast();
    }
  }

  /**
   * Presenta un toast de éxito
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales
   */
  async success(message: string, options?: Partial<ToastOptions>) {
    await this.presentToast({ 
      ...options, 
      message, 
      type: 'success' 
    });
  }

  /**
   * Presenta un toast de error
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales
   */
  async error(message: string, options?: Partial<ToastOptions>) {
    await this.presentToast({ 
      ...options, 
      message, 
      type: 'error',
      duration: options?.duration || 5000 // Errores duran más tiempo
    });
  }

  /**
   * Presenta un toast de advertencia
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales
   */
  async warning(message: string, options?: Partial<ToastOptions>) {
    await this.presentToast({ 
      ...options, 
      message, 
      type: 'warning' 
    });
  }

  /**
   * Presenta un toast informativo
   * @param message Mensaje a mostrar
   * @param options Opciones adicionales
   */
  async info(message: string, options?: Partial<ToastOptions>) {
    await this.presentToast({ 
      ...options, 
      message, 
      type: 'info' 
    });
  }

  /**
   * Método privado para presentar el siguiente toast en la cola
   */
  private async presentNextToast() {
    if (this.toastQueue.length === 0) {
      this.isToastPresenting = false;
      return;
    }

    this.isToastPresenting = true;
    const options = this.toastQueue.shift()!;
    const { message, type, duration, position, showCloseButton, icon } = options;

    // Crear el mensaje con icono (solo texto plano)
    const messageWithIcon = `${icon} ${message}`;

    const buttons = showCloseButton ? [
      {
        text: '✕',
        role: 'cancel',
        cssClass: 'toast-close-button'
      }
    ] : undefined;

    const toast = await this.toastController.create({
      message: messageWithIcon,
      duration,
      position,
      buttons,
      cssClass: `custom-toast toast-${type}`,
      htmlAttributes: {
        'data-toast-type': type
      },
      // Habilitar HTML en el mensaje
      translucent: false,
      mode: 'ios'
    });

    // Cuando el toast se cierre, presentar el siguiente en la cola
    toast.onDidDismiss().then(() => {
      this.presentNextToast();
    });

    await toast.present();
  }

  /**
   * Limpia la cola de toasts
   */
  clearQueue() {
    this.toastQueue = [];
  }

  /**
   * Obtiene el número de toasts en cola
   */
  getQueueLength(): number {
    return this.toastQueue.length;
  }
}