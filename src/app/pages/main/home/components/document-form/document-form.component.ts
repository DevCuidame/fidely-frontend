import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InputComponent } from 'src/app/shared/components/input/input.component';
import { CustomButtonComponent } from 'src/app/shared/components/custom-button/custom-button.component';
import { identificationOptions } from 'src/app/core/constants/indentifications';

@Component({
  selector: 'app-document-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    InputComponent,
    CustomButtonComponent,
  ],
  template: `
    <div class="form-container-border">
      <div class="form-container">
        <div class="logo-section">
          <div class="logo">
            <div class="logo-header">
              <img
                src="assets/logo/fidely-logo.png"
                alt="Fidely Logo"
                class="logo-icon"
              />
            </div>
            <div
              class="logo-header"
              style="position: relative; top: -10px; flex-direction: column;"
            >
              <span class="logo-text">FIDELY</span>
              <span class="logo-subtitle">Tu lealtad tiene recompensa</span>
            </div>
          </div>
        </div>

        <form class="document-form" (ngSubmit)="onSubmit()">
          <app-input
            label="Selecciona tu tipo de documento"
            type="select"
            [control]="documentTypeControl"
            [options]="documentTypeOptions"
            textSize="1.25rem"
            textAlign="center"
            textWeight="400"
            textColor="var(--color-secondary)"
            borderBottom="1px solid var(--color-secondary)"
            inputTextColor="var(--color-secondary)"
          >
          </app-input>

          <app-input
            label="Escribe tu número de documento"
            type="text"
            [control]="documentNumberControl"
            placeholder=""
            textSize="1.25rem"
            textAlign="center"
            textWeight="400"
            textColor="var(--color-secondary)"
            borderBottom="1px solid var(--color-secondary)"
            inputTextColor="var(--color-secondary)"
          >
          </app-input>

          <app-custom-button
            label="CONTINUAR"
            type="submit"
            [disabled]="
              !documentTypeControl.valid || !documentNumberControl.valid
            "
            background="var(--color-tertiary)"
            textColor="var(--color-secondary)"
            fontSize="1rem"
            fontWeight="600"
            padding="1rem"
            borderRadius="8px"
          >
          </app-custom-button>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./document-form.component.scss'],
})
export class DocumentFormComponent {
  documentTypeControl = new FormControl('', [Validators.required]);
  documentNumberControl = new FormControl('', [Validators.required]);

  documentTypeOptions = identificationOptions;

  constructor() {}

  onSubmit() {
    if (this.documentTypeControl.valid && this.documentNumberControl.valid) {
      console.log('Form submitted:', {
        documentType: this.documentTypeControl.value,
        documentNumber: this.documentNumberControl.value,
      });
      // Aquí iría la lógica de navegación o validación
    }
  }
}
