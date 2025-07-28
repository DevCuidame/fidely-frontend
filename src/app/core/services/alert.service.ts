import { Injectable } from '@angular/core';
import { AlertController, AlertOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertCtrl: AlertController) {}

  async showAlert(options: AlertOptions) {
    const alert = await this.alertCtrl.create({
      ...options,
      cssClass: 'custom-alert',
      backdropDismiss: false
    });
    
    await alert.present();
    return alert;
  }

  async showConfirmAlert(
    header: string, 
    message: string, 
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header,
        message,
        cssClass: 'custom-alert',
        backdropDismiss: false,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: confirmText,
            handler: () => resolve(true)
          }
        ]
      });
      
      await alert.present();
    });
  }

  async showInfoAlert(header: string, message: string, buttonText: string = 'Entendido') {
    const alert = await this.alertCtrl.create({
      header,
      message,
      cssClass: 'custom-alert',
      backdropDismiss: false,
      buttons: [{
        text: buttonText,
        role: 'confirm'
      }]
    });
    
    await alert.present();
    return alert;
  }

  async showErrorAlert(message: string, header: string = 'Error') {
    const alert = await this.alertCtrl.create({
      header,
      message,
      cssClass: 'custom-alert error-alert',
      backdropDismiss: false,
      buttons: [{
        text: 'Cerrar',
        role: 'confirm'
      }]
    });
    
    await alert.present();
    return alert;
  }

  async showSuccessAlert(message: string, header: string = 'Éxito') {
    const alert = await this.alertCtrl.create({
      header,
      message,
      cssClass: 'custom-alert success-alert',
      backdropDismiss: false,
      buttons: [{
        text: 'Continuar',
        role: 'confirm'
      }]
    });
    
    await alert.present();
    return alert;
  }

  async showInputAlert(
    header: string,
    message: string,
    inputs: any[],
    confirmText: string = 'Aceptar',
    cancelText: string = 'Cancelar'
  ): Promise<any> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header,
        message,
        inputs,
        cssClass: 'custom-alert input-alert',
        backdropDismiss: false,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: confirmText,
            handler: (data) => resolve(data)
          }
        ]
      });
      
      await alert.present();
    });
  }
}