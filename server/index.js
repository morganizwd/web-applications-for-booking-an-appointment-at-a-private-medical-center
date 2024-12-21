require('dotenv').config();
const express = require('express');
const path = require('path');
const sequelize = require('./db.js');
const models = require('./models/models.js');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const router = require('./routes/index.js');

const PORT = process.env.PORT || 5000;
const app = express();

// 1) Helmet с нужной политикой
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// 2) Сжимаем ответы
app.use(compression());

// 3) Логгируем запросы
app.use(morgan('combined'));

// 4) Разрешаем CORS с вашего клиента
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// 5) Чтобы парсить JSON и form-data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6) Обслуживание статических файлов с корректным заголовком
app.use(
  '/api/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
      // Явно разрешаем cross-origin
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// 7) Основные маршруты API
app.use('/api', router);

// 8) Обработка 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

// 9) Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Запуск приложения
const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('База данных и таблицы синхронизированы');

    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
