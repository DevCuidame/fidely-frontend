import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-header-private',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './header-private.component.html',
  styleUrls: ['./header-private.component.scss']
})
export class HeaderPrivateComponent implements OnInit {
  @Input() userName: string = '';
  @Input() background: string = '';
  @Input() border: string = '';
  @Input() boxshadow: string = '';
  @Input() icon: boolean = false;
  @Input() showMenuButton: boolean = false;
  @Input() pageTitle: string = ''; // Nueva propiedad para el título de la página
  @Output() menuButtonClick = new EventEmitter<void>();
  greeting: string = '';
  

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
    this.setGreetingBasedOnTime();
  }

  private setGreetingBasedOnTime() {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 5 && currentHour < 12) {
      this.greeting = 'Buenos días';
    } else if (currentHour >= 12 && currentHour < 19) {
      this.greeting = 'Buenas tardes';
    } else {
      this.greeting = 'Buenas noches';
    }
  }

  navigateToPage() {
    this.navCtrl.navigateForward('appointment/viewer');
  }

  onMenuButtonClick() {
    this.menuButtonClick.emit();
  }

}