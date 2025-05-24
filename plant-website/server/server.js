// server/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Настройка приложения
app.use(cors());
app.use(express.json());

// Настройка подключения к PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'kurcach',
  password: '123456',
  port: 5432,
});

// Проверка подключения к БД
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Ошибка подключения к БД:', err);
  }
  console.log('Подключение к БД успешно установлено');
  release();
});

// Константы
const JWT_SECRET = 'your-secret-key';

// Вспомогательные функции
const handleError = (res, error, message) => {
  console.error(`${message}:`, error);
  res.status(500).json({
    message,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

// Middleware для аутентификации
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Нет токена авторизации' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
};

// ======= МАРШРУТЫ АУТЕНТИФИКАЦИИ =======

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' });
    }

    // Проверим, существует ли пользователь с таким email
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Сохраняем пользователя в базе данных
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    // Создаем JWT токен
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    handleError(res, error, 'Ошибка при регистрации пользователя');
  }
});

// Вход пользователя
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    // Поиск пользователя в базе данных по email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    // Создание JWT токена
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Успешный вход',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    handleError(res, error, 'Ошибка при входе');
  }
});

// ======= МАРШРУТЫ ДЛЯ КАТЕГОРИЙ =======

// Получение всех категорий
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Ошибка при получении категорий');
  }
});

// Получение категории по ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    handleError(res, error, 'Ошибка при получении категории');
  }
});

// Получение растений по категории (в алфавитном порядке)
app.get('/api/categories/:id/plants', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM plants WHERE category_id = $1 ORDER BY name ASC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Ошибка при получении растений по категории');
  }
});

// ======= МАРШРУТЫ ДЛЯ РАСТЕНИЙ =======

// Получение всех растений (в алфавитном порядке)
app.get('/api/plants', async (req, res) => {
  try {
    const query = `
      SELECT p.*, c.name as category_name 
      FROM plants p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.name ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Ошибка при получении всех растений');
  }
});

// Получение растения по ID
app.get('/api/plants/:id', async (req, res) => {
  try {
    const plantId = req.params.id;
    const query = `
      SELECT p.*, c.name as category_name 
      FROM plants p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = $1
    `;

    const result = await pool.query(query, [plantId]);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Растение не найдено' });
    }
  } catch (error) {
    handleError(res, error, 'Ошибка при получении растения');
  }
});

// Создание нового растения
app.post('/api/plants', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      category_id,
      description,
      image,
      care_info,
      lighting,
      watering,
      temperature,
      zona,
      tolerance,
      soil,
      durability,
      growth_info
    } = req.body;

    // Проверяем, существует ли категория
    const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Указанная категория не существует' });
    }

    // Добавляем новое растение
    const result = await pool.query(
      `INSERT INTO plants (
        name, category_id, description, image, care_info,
        lighting, watering, temperature, zona, tolerance,
        soil, durability, growth_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        name, category_id, description, image, care_info,
        lighting, watering, temperature, zona, tolerance,
        soil, durability, growth_info
      ]
    );

    res.status(201).json({
      id: result.rows[0].id,
      message: 'Растение успешно создано'
    });
  } catch (error) {
    handleError(res, error, 'Ошибка при создании растения');
  }
});

// Обновление растения
app.put('/api/plants/:id', authMiddleware, async (req, res) => {
  try {
    const plantId = req.params.id;
    const {
      name,
      category_id,
      description,
      image,
      care_info,
      lighting,
      watering,
      temperature,
      zona,
      tolerance,
      soil,
      durability,
      growth_info
    } = req.body;

    // Проверяем, существует ли растение
    const plantCheck = await pool.query('SELECT * FROM plants WHERE id = $1', [plantId]);
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Растение не найдено' });
    }

    // Проверяем, существует ли категория
    if (category_id) {
      const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Указанная категория не существует' });
      }
    }

    // Обновляем растение
    const result = await pool.query(
      `UPDATE plants SET 
        name = COALESCE($1, name),
        category_id = COALESCE($2, category_id),
        description = COALESCE($3, description),
        image = COALESCE($4, image),
        care_info = COALESCE($5, care_info),
        lighting = COALESCE($6, lighting),
        watering = COALESCE($7, watering),
        temperature = COALESCE($8, temperature),
        zona = COALESCE($9, zona),
        tolerance = COALESCE($10, tolerance),
        soil = COALESCE($11, soil),
        durability = COALESCE($12, durability),
        growth_info = COALESCE($13, growth_info),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *`,
      [
        name, category_id, description, image, care_info,
        lighting, watering, temperature, zona, tolerance,
        soil, durability, growth_info, plantId
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    handleError(res, error, 'Ошибка при обновлении растения');
  }
});

// Удаление растения
app.delete('/api/plants/:id', authMiddleware, async (req, res) => {
  try {
    const plantId = req.params.id;

    // Проверяем, существует ли растение
    const plantCheck = await pool.query('SELECT * FROM plants WHERE id = $1', [plantId]);
    if (plantCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Растение не найдено' });
    }

    // Удаляем растение
    await pool.query('DELETE FROM plants WHERE id = $1', [plantId]);

    res.json({ message: 'Растение успешно удалено' });
  } catch (error) {
    handleError(res, error, 'Ошибка при удалении растения');
  }
});

// ======= МАРШРУТ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ =======

// Получение статистики для главной страницы
app.get('/api/home', async (req, res) => {
  try {
    // Общее количество растений
    const plantsCountQuery = 'SELECT COUNT(*) FROM plants';
    const plantsCountResult = await pool.query(plantsCountQuery);

    // Количество растений по категориям
    const categoriesStatsQuery = `
      SELECT c.id, c.name, COUNT(p.id) as plant_count
      FROM categories c
      LEFT JOIN plants p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY plant_count DESC
    `;
    const categoriesStatsResult = await pool.query(categoriesStatsQuery);

    // Последние добавленные растения
    const latestPlantsQuery = `
      SELECT p.*, c.name as category_name
      FROM plants p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `;
    const latestPlantsResult = await pool.query(latestPlantsQuery);

    res.json({
      totalPlants: parseInt(plantsCountResult.rows[0].count),
      categoriesStats: categoriesStatsResult.rows,
      latestPlants: latestPlantsResult.rows
    });
  } catch (error) {
    handleError(res, error, 'Ошибка при получении данных для главной страницы');
  }
});

// ======= МАРШРУТЫ ДЛЯ ПОИСКА =======

// Поиск растений
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const searchQuery = `
      SELECT p.id, p.name, p.description, p.image, p.category_id, c.name as category_name
      FROM plants p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 
        LOWER(p.name) LIKE LOWER($1) OR
        LOWER(p.description) LIKE LOWER($1)
      ORDER BY p.name ASC
      LIMIT 50
    `;

    const values = [`%${query}%`];
    const result = await pool.query(searchQuery, values);

    res.json(result.rows);
  } catch (error) {
    handleError(res, error, 'Ошибка при поиске растений');
  }
});

// ======= ОБРАБОТКА ОШИБОК =======

// Подключение маршрутов ошибок из внешнего файла
const errorRoutes = require('./routes/errors');
app.use('/api', errorRoutes);

// Обработка ошибок для несуществующих маршрутов
app.use((req, res, next) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// Обработка ошибок сервера
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Внутренняя ошибка сервера', error: err.message });
});

// ======= ЗАПУСК СЕРВЕРА =======

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
