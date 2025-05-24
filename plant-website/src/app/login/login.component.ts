import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onLogin() {
    console.log('Попытка входа с данными:', { email: this.email, password: this.password ? '***' : null });

    if (this.email && this.password) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          console.log('Успешный вход:', response);
          this.isLoading = false;
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Ошибка входа:', error);
          this.errorMessage = error;
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Пожалуйста, заполните все поля';
    }
  }
}
