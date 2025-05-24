import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorService, ErrorLog } from './services/error.service';

@Component({
  selector: 'app-error-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-list-container">
      <h2>Журнал ошибок</h2>

      <div class="error-filters">
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          (input)="filterErrors()"
          placeholder="Поиск по сообщениям..."
        >
        
        <select [(ngModel)]="selectedDate" (change)="filterErrors()">
          <option value="all">Все даты</option>
          <option value="today">Сегодня</option>
          <option value="week">За неделю</option>
          <option value="month">За месяц</option>
        </select>
      </div>

      <div class="error-table-container">
        <table class="error-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Сообщение</th>
              <th>Пользователь</th>
              <th>URL</th>
              <th>Браузер</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let error of filteredErrors">
              <td>{{ error.createdAt | date:'medium' }}</td>
              <td>
                <div class="error-message-cell">
                  {{ error.message }}
                  <button 
                    *ngIf="error.stackTrace"
                    (click)="showStackTrace(error)"
                    class="stack-trace-button"
                  >
                    Подробнее
                  </button>
                </div>
              </td>
              <td>{{ error.userId ? error.userName : 'Гость' }}</td>
              <td>
                <a [href]="error.url" target="_blank">{{ error.url }}</a>
              </td>
              <td>{{ error.browserInfo }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Модальное окно для стек-трейса -->
      <div *ngIf="selectedError" class="modal">
        <div class="modal-content">
          <h3>Подробности ошибки</h3>
          <pre>{{ selectedError.stackTrace }}</pre>
          <button (click)="selectedError = null">Закрыть</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-list-container {
      padding: 20px;
    }

    h2 {
      margin-bottom: 20px;
    }

    .error-filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }

    input, select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .error-table-container {
      overflow-x: auto;
    }

    .error-table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }

    .error-message-cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stack-trace-button {
      padding: 4px 8px;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal-content {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 800px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      overflow-x: auto;
    }
  `]
})
export class ErrorListComponent implements OnInit {
  errors: ErrorLog[] = [];
  filteredErrors: ErrorLog[] = [];
  selectedError: ErrorLog | null = null;
  searchTerm: string = '';
  selectedDate: string = 'all';

  constructor(private errorService: ErrorService) { }

  ngOnInit() {
    this.loadErrors();
  }

  loadErrors() {
    this.errorService.getErrors().subscribe({
      next: (errors) => {
        this.errors = errors;
        this.filterErrors();
      },
      error: (error) => {
        console.error('Ошибка при загрузке ошибок:', error);
      }
    });
  }

  filterErrors() {
    let filtered = [...this.errors];

    // Фильтрация по поисковому запросу
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(error =>
        error.message.toLowerCase().includes(term) ||
        error.browserInfo?.toLowerCase().includes(term) ||
        error.url?.toLowerCase().includes(term)
      );
    }

    // Фильтрация по дате
    const now = new Date();
    switch (this.selectedDate) {
      case 'today':
        filtered = filtered.filter(error => {
          const errorDate = new Date(error.createdAt!);
          return errorDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(error => {
          const errorDate = new Date(error.createdAt!);
          return errorDate >= weekAgo;
        });
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(error => {
          const errorDate = new Date(error.createdAt!);
          return errorDate >= monthAgo;
        });
        break;
    }

    this.filteredErrors = filtered;
  }

  showStackTrace(error: ErrorLog) {
    this.selectedError = error;
  }
}
