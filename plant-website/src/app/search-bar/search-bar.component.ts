import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container">
      <input
        type="text"
        [(ngModel)]="searchQuery"
        (keyup.enter)="onSearch()"
        placeholder="Поиск растений..."
        class="search-input"
      />
      <button (click)="onSearch()" class="search-button">
        <span>🔍</span>
      </button>
    </div>
  `,
  styles: [`
    .search-container {
      display: flex;
      gap: 10px;
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .search-input {
      flex: 1;
      padding: 12px;
      font-size: 16px;
      border: 2px solid #ddd;
      border-radius: 25px;
      outline: none;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      border-color: #3498db;
    }

    .search-button {
      padding: 12px 24px;
      font-size: 16px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .search-button:hover {
      background: #2980b9;
    }
  `]
})
export class SearchBarComponent {
  searchQuery: string = '';

  constructor(private router: Router) { }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { query: this.searchQuery.trim() }
      });
    }
  }
}
