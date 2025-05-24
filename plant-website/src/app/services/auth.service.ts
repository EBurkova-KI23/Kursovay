import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface User {
  id: number;
  username: string;
  email?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  public currentUser: Observable<User | null>;

  private isLoggedInSubject: BehaviorSubject<boolean>;
  public isLoggedIn$: Observable<boolean>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );

    this.currentUser$ = this.currentUserSubject.asObservable();
    this.currentUser = this.currentUserSubject.asObservable();

    this.isLoggedInSubject = new BehaviorSubject<boolean>(!!this.currentUserSubject.value);
    this.isLoggedIn$ = this.isLoggedInSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    const user = this.currentUserValue;
    return user?.token || null;
  }

  getUserId(): string | null {
    const user = this.currentUserValue;
    return user ? String(user.id) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, {
      username,
      email,
      password
    }).pipe(
      catchError(this.handleError)
    );
  }

  login(email: string, password: string): Observable<any> {
    console.log('Отправка данных для входа:', { email, password: '***' });

    return this.http.post<any>(`${this.apiUrl}/auth/login`, {
      email,    
      password
    }).pipe(
      map(response => {
        console.log('Ответ сервера:', response);

        const userData = {
          ...(response.user || {}),
          email: email,
          id: response.user?.id || response.userId || response.id || 1,
          token: response.token
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        this.currentUserSubject.next(userData);
        this.isLoggedInSubject.next(true);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  logoutUser(): void {
    this.logout();
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  getCurrentUser(): User | null {
    return this.currentUserValue;
  }

  validateToken(): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.apiUrl}/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse) {
    console.error('HTTP Error:', error);

    let errorMessage = 'Произошла неизвестная ошибка';

    if (error.error instanceof ErrorEvent) {
      
      errorMessage = `Ошибка: ${error.error.message}`;
      console.error('Клиентская ошибка:', error.error.message);
    } else {
      // Ошибка сервера
      console.error(`Код статуса: ${error.status}, Тело ответа:`, error.error);

      // Обработка разных типов ответов сервера
      if (error.status === 0) {
        errorMessage = 'Нет соединения с сервером. Проверьте интернет-соединение.';
      } else if (error.status === 400) {
        if (error.error && typeof error.error === 'object') {
          if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors) {
          
            const errorsArray = Array.isArray(error.error.errors)
              ? error.error.errors
              : Object.values(error.error.errors);

            errorMessage = errorsArray.join(', ');
          }
        } else {
          errorMessage = 'Неверный запрос. Проверьте правильность данных.';
        }
      } else if (error.status === 401) {
        errorMessage = 'Неверные учетные данные. Проверьте email и пароль.';
      } else if (error.status === 403) {
        errorMessage = 'Доступ запрещен. У вас нет прав для выполнения этого действия.';
      } else if (error.status === 404) {
        errorMessage = 'Запрошенный ресурс не найден.';
      } else if (error.status === 500) {
        errorMessage = 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
      } else {
        errorMessage = `Ошибка сервера: ${error.status}`;

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
      }
    }

    return throwError(() => errorMessage);
  }
}
