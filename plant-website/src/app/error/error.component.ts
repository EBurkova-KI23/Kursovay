import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ErrorService } from '../services/error.service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
})
export class ErrorComponent {
  errorMessage = '';
  showError = false;
  isSubmitting = false;
  successMessage: string | null = null;

  constructor(
    private router: Router,
    private errorService: ErrorService
  ) { }

  onInputChange(): void {
    if (this.showError && this.errorMessage.trim().length > 0) {
      this.showError = false;
    }
  }

  submitError(): void {
    if (!this.errorMessage.trim()) {
      this.showError = true;
      return;
    }

    this.isSubmitting = true;

    const errorLog = {
      message: this.errorMessage,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    this.errorService.logError(errorLog).subscribe({
      next: () => {
        this.successMessage = 'Спасибо! Ваше сообщение об ошибке успешно отправлено.';
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Ошибка при отправке сообщения:', error);
        this.isSubmitting = false;
      }
    });
  }

  resetForm(): void {
    this.errorMessage = '';
    this.successMessage = null;
    this.showError = false;
  }

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
