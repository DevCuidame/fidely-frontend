import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-business-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-header.component.html',
  styleUrls: ['./business-header.component.scss']
})
export class BusinessHeaderComponent {

  constructor(private router: Router) {}

  // Navigation methods for header links
  navigateToHome(): void {
    this.router.navigate(['/business/home']);
  }
  
  navigateToPromos(): void {
    this.router.navigate(['/business/promos']); 
  }
  
  navigateToClients(): void {
    this.router.navigate(['/business/clients']);
  }
  
  navigateToRewards(): void {
    this.router.navigate(['/business/rewards']);
  }
}
