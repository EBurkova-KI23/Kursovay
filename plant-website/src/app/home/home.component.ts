import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PlantService } from '../services/plant.service';
import { Category } from '../types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  loading: boolean = true;
  error: string | null = null;

  // Массив с интересными фактами о растениях Сибири
  facts: string[] = [
    "В Сибири произрастает более 4500 видов сосудистых растений, многие из которых являются эндемиками.",
    "Сибирский женьшень (элеутерококк) известен своими адаптогенными свойствами и способностью повышать иммунитет.",
    "Сибирская лиственница может достигать возраста 900 лет и является одним из самых морозостойких деревьев в мире.",
    "Алтайский маралий корень (левзея сафлоровидная) использовался коренными народами Сибири как средство от усталости и для восстановления сил.",
    "Курильский чай (лапчатка кустарниковая) может выдерживать морозы до -50°C и используется как лекарственное растение.",
    "Черемша (дикий чеснок) в Сибири считается ценным источником витаминов весной и традиционно собирается местными жителями.",
    "Сибирская кедровая сосна может жить до 800 лет и начинает плодоносить только в возрасте 40-50 лет.",
    "Багульник болотный, распространенный в сибирской тайге, содержит эфирные масла, которые могут вызывать головокружение при длительном вдыхании.",
    "Чага (березовый гриб) традиционно использовалась сибирскими народами как лекарственное средство, а современные исследования подтверждают его противоопухолевые свойства.",
    "Золотой корень (родиола розовая) растет на высокогорьях Алтая и Саян и считается мощным адаптогеном, способным повышать физическую и умственную работоспособность.",
    "Саранка (лилия кудреватая) с давних времен использовалась коренными народами Сибири в пищу - её луковицы богаты крахмалом и напоминают по вкусу картофель.",
    "Сибирский кедр является не настоящим кедром, а представителем рода сосна (Pinus sibirica)."
  ];

  currentFact: string = ''; // Текущий отображаемый факт

  constructor(
    private router: Router,
    private plantService: PlantService
  ) { }

  ngOnInit() {
    this.loadCategories();
    // Показываем случайный факт при загрузке компонента
    this.showRandomFact();
  }

  loadCategories() {
    this.loading = true;
    this.error = null;

    this.plantService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Ошибка при загрузке категорий:', err);
        this.error = 'Не удалось загрузить категории. Пожалуйста, попробуйте позже.';
        this.loading = false;
      }
    });
  }

  navigateToPlantsList(categoryId: string) {
    this.router.navigate(['/category', categoryId]);
  }

  // Показать случайный факт из массива
  showRandomFact() {
    const randomIndex = Math.floor(Math.random() * this.facts.length);
    this.currentFact = this.facts[randomIndex];
  }

  // Показать следующий факт при нажатии кнопки
  showNextFact() {
    // Находим индекс текущего факта
    const currentIndex = this.facts.indexOf(this.currentFact);
    // Определяем индекс следующего факта
    const nextIndex = (currentIndex + 1) % this.facts.length;
    // Устанавливаем следующий факт
    this.currentFact = this.facts[nextIndex];
  }
}
