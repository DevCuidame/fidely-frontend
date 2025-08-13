import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent {

  constructor(private router: Router) {}

  // Navigation methods for header links
  navigateToHome(): void {
    this.router.navigate(['/admin/home']);
  }
  
  navigateToPromos(): void {
    this.router.navigate(['/admin/promos']);
  }
  
  navigateToClients(): void {
    this.router.navigate(['/admin/clients']);
  }
  
  navigateToRewards(): void {
    this.router.navigate(['/admin/rewards']);
  }
}
