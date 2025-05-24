import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Plant, Category, CreatePlantDto } from '../types';
import { AuthService } from './auth.service';
import { HttpParams } from '@angular/common/http';
import {  tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  searchPlants(query: string): Observable<Plant[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Plant[]>(`${this.apiUrl}/search`, { params });
  }
  // Получение всех категорий
  getPlants(): Observable<Plant[]> {
    console.log('Запрос растений:', `${this.apiUrl}/plants`);
    return this.http.get<Plant[]>(`${this.apiUrl}/plants`).pipe(
      catchError(this.handleError)
    );
  }

  // Получение растения по ID
  getPlantById(id: string): Observable<Plant> {
    console.log('Making API request for plant:', id);
    return this.http.get<Plant>(`${this.apiUrl}/plants/${id}`).pipe(
      tap((response: Plant) => console.log('API response:', response)),
      catchError(this.handleError)
    );
  }

  // Получение категории по ID
  getCategory(id: string): Observable<Category> {
    console.log('Запрос категории:', `${this.apiUrl}/categories/${id}`);
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Получение всех категорий
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      catchError(this.handleError)
    );
  }

  // Получение растений по категории
  getPlantsByCategory(categoryId: string): Observable<Plant[]> {
    return this.http.get<Plant[]>(`${this.apiUrl}/categories/${categoryId}/plants`).pipe(
      catchError(this.handleError)
    );
  }

  createPlant(plantData: CreatePlantDto): Observable<Plant> {
    console.log('Отправка данных растения на сервер:', plantData);
    console.log('Content-Type заголовка:', this.getHeaders().get('Content-Type'));

    const headers = this.getHeaders();

    return this.http.post<Plant>(
      `${this.apiUrl}/plants`,
      plantData,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Детали ошибки:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        return this.handleError(error);
      })
    );
  }

  createPlantWithImage(plantData: CreatePlantDto, image: File): Observable<Plant> {
    console.log('Отправка данных растения с изображением:', plantData);

    // Создаем FormData для отправки файлов
    const formData = new FormData();

    // Добавляем все поля растения
    formData.append('name', plantData.name);
    formData.append('category_id', plantData.category_id);

    if (plantData.description) {
      formData.append('description', plantData.description);
    }

    if (plantData.care_info) {
      formData.append('care_info', plantData.care_info);
    }

    if (plantData.lighting) {
      formData.append('lighting', plantData.lighting);
    }

    if (plantData.watering) {
      formData.append('watering', plantData.watering);
    }

    if (plantData.temperature) {
      formData.append('temperature', plantData.temperature);
    }

    if (plantData.zona) {
      formData.append('zona', plantData.zona);
    }

    if (plantData.tolerance) {
      formData.append('tolerance', plantData.tolerance);
    }

    if (plantData.soil) {
      formData.append('soil', plantData.soil);
    }

    if (plantData.durability) {
      formData.append('durability', plantData.durability);
    }

    if (plantData.growth_info) {
      formData.append('growth_info', plantData.growth_info);
    }

    // Добавляем файл изображения
    formData.append('image', image);

    // Используем только заголовок авторизации, без Content-Type
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.post<Plant>(
      `${this.apiUrl}/plants`,
      formData,
      { headers }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  updatePlant(id: string, plantData: Partial<Plant>): Observable<Plant> {
    const headers = this.getHeaders();
    return this.http.put<Plant>(
      `${this.apiUrl}/plants/${id}`,
      plantData,
      { headers }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  updatePlantWithImage(id: string, plantData: Partial<Plant>, image: File): Observable<Plant> {
    // Создаем FormData для отправки файлов
    const formData = new FormData();

    // Добавляем все поля растения
    if (plantData.name) formData.append('name', plantData.name);
    if (plantData.category_id) formData.append('category_id', plantData.category_id);
    if (plantData.description) formData.append('description', plantData.description);
    if (plantData.care_info) formData.append('care_info', plantData.care_info);
    if (plantData.lighting) formData.append('lighting', plantData.lighting);
    if (plantData.watering) formData.append('watering', plantData.watering);
    if (plantData.temperature) formData.append('temperature', plantData.temperature);
    if (plantData.zona) formData.append('zona', plantData.zona);
    if (plantData.tolerance) formData.append('tolerance', plantData.tolerance);
    if (plantData.soil) formData.append('soil', plantData.soil);
    if (plantData.durability) formData.append('durability', plantData.durability);
    if (plantData.growth_info) formData.append('growth_info', plantData.growth_info);

    // Добавляем файл изображения
    formData.append('image', image);

    // Заголовок авторизации
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    return this.http.put<Plant>(
      `${this.apiUrl}/plants/${id}`,
      formData,
      { headers }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  deletePlant(id: string): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(
      `${this.apiUrl}/plants/${id}`,
      { headers }
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // Метод для обработки ошибок
  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'Произошла ошибка при загрузке данных';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Ошибка: ${error.error.message}`;
    } else {
      errorMessage = `Код ошибки: ${error.status}\nСообщение: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  // Временное решение для тестирования интерфейса без сервера
  mockCreatePlant(plantData: CreatePlantDto, image?: File): Observable<Plant> {
    console.log('Имитация создания растения:', plantData);

    // Имитация ID
    const randomId = Math.floor(Math.random() * 10000);

    // Имитация URL изображения
    let imageUrl = '';
    if (image) {
      // Для локального тестирования можно использовать URL.createObjectURL
      imageUrl = URL.createObjectURL(image);
      console.log('Создан временный URL для изображения:', imageUrl);
    } else {
      // Пример URL заглушки
      imageUrl = 'https://via.placeholder.com/300';
    }

    // Создаем имитацию объекта растения
    const mockPlant: Plant = {
      id: randomId,
      name: plantData.name,
      category_id: plantData.category_id,
      description: plantData.description,
      image: imageUrl,
      care_info: plantData.care_info,
      lighting: plantData.lighting,
      watering: plantData.watering,
      temperature: plantData.temperature,
      zona: plantData.zona,
      tolerance: plantData.tolerance,
      soil: plantData.soil,
      durability: plantData.durability,
      growth_info: plantData.growth_info
    };

    // Возвращаем "успешный" ответ после небольшой задержки
    return new Observable<Plant>(observer => {
      setTimeout(() => {
        observer.next(mockPlant);
        observer.complete();
      }, 800); // Имитация задержки сети
    });
  }
}
