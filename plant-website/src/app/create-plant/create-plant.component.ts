import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlantService } from '../services/plant.service';
import { Category } from '../types';

@Component({
  selector: 'app-create-plant',
  templateUrl: './create-plant.component.html',
  styleUrls: ['./create-plant.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class CreatePlantComponent implements OnInit {
  plantForm!: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  selectedFile: File | null = null;
  imageUrl: string = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private plantService: PlantService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    this.plantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category_id: ['', Validators.required], // Теперь category_id это string
      description: [''],
      image: [''], // Для URL изображения
      care_info: [''],
      lighting: [''],
      watering: [''],
      temperature: [''],
      zona: [''],
      tolerance: [''],
      soil: [''],
      durability: [''],
      growth_info: ['']
    });
  }

  isInvalid(fieldName: string): boolean {
    const field = this.plantForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  loadCategories(): void {
    this.plantService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Загруженные категории:', categories);
      },
      error: (error) => {
        console.error('Ошибка при загрузке категорий:', error);
        this.errorMessage = 'Не удалось загрузить категории.';
      }
    });
  }

  // Обновлено для использования URL изображения
  onUrlChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.imageUrl = input.value;
      this.plantForm.patchValue({ image: this.imageUrl });
    }
  }

  // Для предпросмотра изображения
  previewImage(): string {
    return this.imageUrl || 'assets/images/placeholder-image.jpg';
  }

  // Метод для отладки формы
  debugForm(): void {
    console.group('Отладка формы создания растения');
    console.log('Статус формы:', this.plantForm.status);
    console.log('Значения формы:', this.plantForm.value);
    console.log('Валидна ли форма:', this.plantForm.valid);

    // Проверяем каждое поле формы
    const controls = this.plantForm.controls;

    for (const controlName in controls) {
      if (controls.hasOwnProperty(controlName)) {
        const control = controls[controlName];
        console.log(`Поле "${controlName}":`);
        console.log('  Значение:', control.value);
        console.log('  Валидно:', control.valid);
        console.log('  Ошибки:', control.errors);
      }
    }

    // URL изображения
    console.log('URL изображения:', this.imageUrl);

    console.groupEnd();
  }

  onSubmit(): void {
    if (this.plantForm.invalid) {
      Object.keys(this.plantForm.controls).forEach(key => {
        const control = this.plantForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.plantService.createPlant(this.plantForm.value).subscribe({
      next: (response) => {
        console.log('Растение успешно создано:', response);
        this.successMessage = 'Растение успешно добавлено!';
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Ошибка при создании растения:', error);
        this.errorMessage = 'Не удалось создать растение. Пожалуйста, попробуйте снова.';
        this.isSubmitting = false;
      }
    });
  }

  resetForm(): void {
    this.plantForm.reset();
    this.successMessage = null;
    this.errorMessage = null;
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  // Вспомогательный метод для установки touched на все поля формы
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
