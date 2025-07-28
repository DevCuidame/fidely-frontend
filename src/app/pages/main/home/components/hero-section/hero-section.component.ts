import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hero-container">
      <div class="hero-image">
        <!-- Imagen mockup que ocupa todo el componente -->
      </div>
    </div>
  `,
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  constructor() {}
}