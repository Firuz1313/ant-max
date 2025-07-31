import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Загрузка переменных окружения
dotenv.config();

// ES Modules helper для __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Импорт главного роутера API
import apiRoutes from './routes/index.js';

// Импорт middleware
import errorHandler from './middleware/errorHandler.js';
import requestLogger from './middleware/requestLogger.js';
import validateRequest from './middleware/validateRequest.js';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Настройка CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:8080'
    ];

    // В облачной среде разрешаем все origins или те что содержат fly.dev
    if (NODE_ENV === 'development' || !origin ||
        origin.includes('fly.dev') ||
        origin.includes('localhost') ||
        allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));

// Безопасность
if (process.env.HELMET_ENABLED !== 'false') {
  app.use(helmet({
    contentSecurityPolicy: false, // Отключаем для разработки
    crossOriginEmbedderPolicy: false
  }));
}

// Сжатие
if (process.env.COMPRESSION_ENABLED !== 'false') {
  app.use(compression());
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 минут
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // максимум 100 запросов на IP
  message: {
    error: 'Слишком много запросов с этого IP, попробуйте позже.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Логирование
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Парсинг JSON и URL-encoded данных
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы
app.use('/media', express.static(path.join(__dirname, '../uploads')));

// Кастомный middleware для логирования запросов
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler для API роутов
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint не найден',
    message: `Маршрут ${req.method} ${req.path} не существует`,
    availableEndpoints: '/api/v1'
  });
});

// Обработка ошибок
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📄 Получен сигнал SIGTERM. Изящное завершение работы...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📄 Получен сигнал SIGINT. Изящное завершение работы...');
  process.exit(0);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('🚀 ANT Support API Server started successfully!');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}/api/v1`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Environment: ${NODE_ENV}`);
  
  if (NODE_ENV === 'development') {
    console.log('🔧 Development mode - CORS enabled for localhost');
    console.log('📁 Static files served from: /media');
  }
});

export default app;
