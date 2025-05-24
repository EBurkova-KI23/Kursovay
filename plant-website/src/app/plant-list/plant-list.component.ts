import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlantService } from '../services/plant.service';
import { Plant, Category } from '../types';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-plant-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './plant-list.component.html',
  styleUrls: ['./plant-list.component.css'],
})
export class PlantListComponent implements OnInit {
  plants: Plant[] = [];
  loading = true;
  error: string | null = null;
  categoryId: string | null = null;
  currentCategory: Category | null = null;

  constructor(
    private plantService: PlantService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log('Получены параметры маршрута:', params);
      const categoryId = params['id'];

      if (categoryId) {
        this.categoryId = categoryId;
        this.loadData(categoryId);
      } else {
        this.error = 'Категория не найдена';
        this.loading = false;
      }
    });
  }

  retryLoading(): void {
    if (this.categoryId) {
      this.loadData(this.categoryId);
    }
  }

  private loadData(categoryId: string): void {
    this.loading = true;
    this.error = null;

    Promise.all([
      this.loadCategoryDetails(categoryId),
      this.loadPlantsByCategory(categoryId)
    ]).then(() => {
      this.loading = false;
    }).catch(error => {
      console.error('Ошибка при загрузке данных:', error);
      this.error = 'Ошибка при загрузке данных';
      this.loading = false;
    });
  }

  private loadCategoryDetails(categoryId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.plantService.getCategory(categoryId).subscribe({
        next: (category) => {
          console.log('Получены детали категории:', category);
          this.currentCategory = category;
          resolve();
        },
        error: (error) => {
          console.error('Ошибка при загрузке категории:', error);
          reject(error);
        }
      });
    });
  }

  private loadPlantsByCategory(categoryId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.plantService.getPlants().subscribe({
        next: (plants) => {
          console.log('Получены все растения:', plants);
          this.plants = plants.filter(plant => plant.category_id === categoryId);
          console.log('Отфильтрованные растения:', this.plants);
          resolve();
        },
        error: (error) => {
          console.error('Ошибка при загрузке растений:', error);
          reject(error);
        }
      });
    });
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/placeholder.jpg';
    }
  }

  navigateToPlantDetail(plantId: string | number): void {
    console.log('Переход к растению:', plantId); // добавим для отладки
    this.router.navigate(['/plants', plantId]);
  }

  goBack(): void {
    this.location.back();
  }
}
