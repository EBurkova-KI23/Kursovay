import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttpClient()
  ]
};
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  endpoints: {
    plants: '/plants',
    categories: '/categories'
  }
};
