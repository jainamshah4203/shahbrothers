import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import productRoutes from './routes/products';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';
import variantRoutes from './routes/variants';
import categoryRoutes from './routes/categories';
import customersRoutes from './routes/customers';
import reviewsRoutes from './routes/reviews';
import couponsRoutes from './routes/coupons';
import paymentsRoutes from './routes/payments';
import mediaRoutes from './routes/media';

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB().catch((e) => {
  console.error('❌ Database connection failed:', e);
  process.exit(1);
});

// Security
app.use(helmet());

// CORS
const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowedOrigins = corsOriginEnv.split(',').map(o => o.trim()).filter(Boolean);
const allowAll = allowedOrigins.length === 1 && allowedOrigins[0] === '*';
// Support simple wildcard suffixes like '*.vercel.app'
const wildcardSuffixes = allowedOrigins
  .filter((o) => o.startsWith('*.'))
  .map((o) => o.slice(1)); // '.vercel.app'

console.log('CORS allowed origins:', allowAll ? ['<ALL>'] : allowedOrigins);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or tools without an Origin header
    if (!origin) return callback(null, true);
    if (allowAll) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (wildcardSuffixes.some((suffix) => origin.endsWith(suffix))) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limit
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200', 10),
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'NIRAYA API', time: new Date().toISOString() });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/media', mediaRoutes);

// 404
app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
});

// nodemon restart trigger
