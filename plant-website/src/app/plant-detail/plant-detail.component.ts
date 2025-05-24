import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlantService } from '../services/plant.service';
import { Plant, Category } from '../types';
import { Location } from '@angular/common';

@Component({
  selector: 'app-plant-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plant-detail.component.html',
  styleUrls: ['./plant-detail.component.css'],
})
export class PlantDetailComponent implements OnInit {
  plant: Plant | null = null;
  loading = true;
  error: string | null = null;
  activeTab: string = 'description';
  currentId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private plantService: PlantService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    console.log('PlantDetailComponent initialized');
    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      const id = params['id'];
      this.currentId = id;
      if (id) {
        this.loadPlantDetails(id);
      } else {
        this.error = 'ID растения не указан';
        this.loading = false;
      }
    });
  }

  private loadPlantDetails(id: string): void {
    console.log('Loading plant details for ID:', id);
    this.loading = true;
    this.error = null;

    this.plantService.getPlantById(id).subscribe({
      next: (plant) => {
        console.log('Received plant data:', plant);
        this.plant = plant;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plant:', error);
        this.error = 'Не удалось загрузить информацию о растении';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  retryLoad(): void {
    // Повторная загрузка текущего растения
    if (this.route.snapshot.params['id']) {
      this.loadPlantDetails(this.route.snapshot.params['id']);
    }
  }

  navigateToPlantDetail(plantId: string | number): void {
    console.log('Переход к растению:', plantId);
    this.router.navigate(['/plants', plantId]);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/placeholder.jpg';
    }
  }
}
