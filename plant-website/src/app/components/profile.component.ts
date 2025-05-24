import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h1>Профиль пользователя</h1>
      
      <div class="profile-card" *ngIf="user">
        <div class="profile-header">
          <div class="profile-avatar">
            {{ getUserInitials() }}
          </div>
          <div class="profile-info">
            <h2>{{ user.username }}</h2>
            <p>{{ user.email }}</p>
          </div>
        </div>
        
        <div class="profile-content">
          <div class="profile-section">
            <h3>Информация об аккаунте</h3>
            <div class="info-group">
              <span class="label">ID пользователя:</span>
              <span class="value">{{ user.id }}</span>
            </div>
            <!-- Дополнительная информация может быть добавлена здесь -->
          </div>
        </div>
      </div>

      <div *ngIf="!user" class="loading-state">
        Загрузка информации о пользователе...
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 30px;
      text-align: center;
    }

    .profile-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .profile-header {
      display: flex;
      align-items: center;
      padding: 30px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      background-color: #28a745;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2em;
      color: white;
      font-weight: bold;
      margin-right: 20px;
    }

    .profile-info h2 {
      margin: 0 0 10px 0;
      color: #2c3e50;
    }

    .profile-info p {
      margin: 0;
      color: #6c757d;
    }

    .profile-content {
      padding: 30px;
    }

    .profile-section {
      margin-bottom: 30px;
    }

    .profile-section h3 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #2c3e50;
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 10px;
    }

    .info-group {
      display: flex;
      margin-bottom: 15px;
    }

    .label {
      flex: 1;
      font-weight: bold;
      color: #495057;
    }

    .value {
      flex: 2;
      color: #6c757d;
    }

    .loading-state {
      text-align: center;
      padding: 40px;
      color: #6c757d;
    }

    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }

      .profile-avatar {
        margin-right: 0;
        margin-bottom: 20px;
      }

      .info-group {
        flex-direction: column;
      }

      .label, .value {
        flex: none;
      }

      .label {
        margin-bottom: 5px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: any = null;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  getUserInitials(): string {
    if (!this.user || !this.user.username) return '?';

    const username = this.user.username;
    return username.charAt(0).toUpperCase();
  }
}
