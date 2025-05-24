import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ErrorLog } from '../types';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private apiUrl = 'http://localhost:3000/api/errors';

  constructor(private http: HttpClient) { }

  logError(error: ErrorLog): Observable<ErrorLog> {
    return this.http.post<ErrorLog>(this.apiUrl, error);
  }
}
