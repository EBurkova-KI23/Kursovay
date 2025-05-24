// server/routes/errors.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Endpoint для логирования ошибок
router.post('/errors', async (req, res) => {
  try {
    const { message, timestamp, url, status } = req.body;

    const query = `
      INSERT INTO error_logs (message, timestamp, url, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [message, timestamp, url, status];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при сохранении лога ошибки:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
