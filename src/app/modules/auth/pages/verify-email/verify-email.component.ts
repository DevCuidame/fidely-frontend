import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  verificationStatus: 'loading' | 'success' | 'error' = 'loading';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.verifyEmail();
  }

  verifyEmail() {
    this.verificationStatus = 'loading';

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.verificationStatus = 'error';
      this.errorMessage = 'Token de verificación no encontrado en la URL.';
      return;
    }

    this.http.get(`${environment.url}api/auth/verify-email/${token}`)
      .pipe(
        catchError(error => {
          this.verificationStatus = 'error';
          this.errorMessage = error.error?.error || 'No pudimos verificar tu correo electrónico. Por favor intenta nuevamente.';
          return throwError(() => error);
        })
      )
      .subscribe(() => {
        this.verificationStatus = 'success';
      });
  }

  showError() {
    alert(`Error de verificación: ${this.errorMessage}`);
  }

  goToLogin() {
    this.router.navigate(['/home']);
  }
}