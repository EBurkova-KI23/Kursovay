// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your-secret-key'; // В production использовать env-переменную

module.exports = (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const token = req.headers.authorization.split(' ')[1];

    // Проверяем токен
    const decoded = jwt.verify(token, JWT_SECRET);

    // Добавляем данные пользователя в запрос
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Требуется аутентификация'
    });
  }
};
