import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config/config';
import { testConnection } from './config/database';
import { initRedis } from './config/redis';
import { logger } from './utils/logger';
import authRoutes from './routes/auth';

/**
 * Initialize Express application
 */
const app = express();

/**
 * Security middleware
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

/**
 * CORS configuration
 */
app.use(cors({
  origin: config.urls.frontend,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Rate limiting
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/**
 * Body parsing middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging middleware
 */
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API routes
 */
app.use('/api/auth', authRoutes);

/**
 * 404 handler
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

/**
 * Global error handler
 */
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'production' ? 'Internal server error' : error.message,
  });
});

/**
 * Start server
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate configuration
    validateConfig();
    logger.info('✅ Configuration validated');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }
    
    // Initialize Redis
    await initRedis();
    
    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Frontend URL: ${config.urls.frontend}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;