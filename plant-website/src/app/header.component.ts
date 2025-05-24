// src/app/header/header.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { SearchBarComponent } from './search-bar/search-bar.component';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SearchBarComponent],
  template: `
    <header class="header">
      <div class="header-content">
        <!-- Логотип -->
        <a routerLink="/" class="logo">
          PlantCare
        </a>

        <!-- Поисковая строка -->
        <app-search-bar></app-search-bar>

        <!-- Меню -->
        <div class="menu-container">
          <button class="menu-trigger" (click)="toggleMenu()">
            <span class="menu-icon">☰</span>
          </button>

          <div class="menu-dropdown" [class.active]="isMenuOpen">
            <!-- Общие пункты меню -->
            <a routerLink="/" (click)="closeMenu()">Главная</a>
            <a routerLink="/report-error" (click)="closeMenu()">Сообщить об ошибке</a>

            <!-- Пункты для авторизованных пользователей -->
            <ng-container *ngIf="isLoggedIn">
              <div class="menu-divider"></div>
              <a routerLink="/create-plant" (click)="closeMenu()">Создать растение</a>
              <a routerLink="/profile" (click)="closeMenu()">Профиль</a>
              <div class="menu-divider"></div>
              <a href="#" (click)="logout(); closeMenu()">Выйти</a>
            </ng-container>

            <!-- Пункты для неавторизованных пользователей -->
            <ng-container *ngIf="!isLoggedIn">
              <div class="menu-divider"></div>
              <a routerLink="/login" (click)="closeMenu()">Войти</a>
              <a routerLink="/register" (click)="closeMenu()">Регистрация</a>
            </ng-container>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .nav-links {
      display: flex;
      gap: 20px;
    }

    .nav-links a {
      color: #34495e;
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }

    .nav-links a:hover {
      background-color: #f5f6fa;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: #28a745;
      text-decoration: none;
      white-space: nowrap;
    }

    .search-bar {
      flex: 1;
      display: flex;
      max-width: 600px;
      position: relative;
    }

    .search-bar input {
      width: 100%;
      padding: 10px 40px 10px 15px;
      border: 2px solid #e9ecef;
      border-radius: 20px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .search-bar input:focus {
      outline: none;
      border-color: #28a745;
    }

    .search-button {
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 5px 10px;
    }

    .menu-container {
      position: relative;
    }

    .menu-trigger {
      background: none;
      border: none;
      padding: 8px;
      cursor: pointer;
      font-size: 1.5rem;
    }

    .menu-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background-color: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 8px;
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s;
    }

    .menu-dropdown.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .menu-dropdown a {
      display: block;
      padding: 12px 20px;
      color: #333;
      text-decoration: none;
      transition: background-color 0.3s;
    }

    .menu-dropdown a:hover {
      background-color: #f8f9fa;
    }

    .menu-divider {
      height: 1px;
      background-color: #e9ecef;
      margin: 8px 0;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0.5rem;
      }

      .search-bar {
        max-width: none;
      }

      .logo {
        font-size: 1.2rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(
      isLoggedIn => this.isLoggedIn = isLoggedIn
    );
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { q: this.searchQuery.trim() }
      });
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logoutUser();
    this.router.navigate(['/']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const menuContainer = document.querySelector('.menu-container');
    if (menuContainer && !menuContainer.contains(event.target as Node)) {
      this.closeMenu();
    }
  }
}
