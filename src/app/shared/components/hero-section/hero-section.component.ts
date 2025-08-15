import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  @Input() backgroundImage: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() logoUrl: string = '';
  @Input() isLoading: boolean = false;
  
  constructor() {}
}