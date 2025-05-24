import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlantListComponent } from './plant-list/plant-list.component';
import { PlantDetailComponent } from './plant-detail/plant-detail.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CreatePlantComponent } from './create-plant/create-plant.component';
import { ErrorComponent } from './error/error.component';
import { AuthGuard } from './guards/auth.guard';
import { SearchResultsComponent } from './search-results/search-results.component';


// Конфигурация маршрутов
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Защищенные маршруты
  {
    path: 'profile',
    loadComponent: () => import('./components/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'create-plant',
    loadComponent: () => import('./create-plant/create-plant.component').then(m => m.CreatePlantComponent),
    canActivate: [AuthGuard]
  },
  { path: 'category/:id', component: PlantListComponent }, // Страница категорий растений
  {
    path: 'plants/:id',  // Убедитесь, что этот маршрут определен
    loadComponent: () => import('./plant-detail/plant-detail.component')
      .then(m => m.PlantDetailComponent)
  },
  { path: 'create-plant', component: CreatePlantComponent }, // Страница создания нового растения
  { path: 'report-error', component: ErrorComponent },  // Страница для всех неопределенных маршрутов (ошибка 404)
  {
    path: 'plants/category/:categoryId', // убедитесь, что здесь именно categoryId
    loadComponent: () => import('./plant-list/plant-list.component')
      .then(m => m.PlantListComponent)
  },
  { path: 'search', component: SearchResultsComponent }
];
