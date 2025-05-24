import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlantService } from '../services/plant.service'; // Путь может отличаться

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {
  plants: any[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private plantService: PlantService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['query'] || '';
      if (this.searchQuery) {
        this.searchPlants();
      }
    });
  }

  searchPlants() {
    this.loading = true;
    this.error = '';

    this.plantService.searchPlants(this.searchQuery).subscribe({
      next: (data) => {
        this.plants = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить результаты поиска. Пожалуйста, попробуйте позже.';
        this.loading = false;
        console.error('Search error:', err);
      }
    });
  }

  navigateToPlantDetail(plantId: number) {
    this.router.navigate(['/plants', plantId]);
  }

  // Добавленный метод для обрезки текста описания
  truncateDescription(description: string, maxLength: number): string {
    if (!description) return '';
    return description.length > maxLength
      ? description.substring(0, maxLength) + '...'
      : description;
  }

  handleImageError(event: any) {
    event.target.src = 'assets/placeholder.jpg';
  }
}
