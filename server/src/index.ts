import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { join } from 'path';
import todoRoutes from './routes/todos';
import { closeDatabase } from './db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/todos', todoRoutes);

// Serve static files in production
if (NODE_ENV === 'production') {
  const staticPath = join(__dirname, '../public');
  app.use(express.static(staticPath));

  // Serve React app for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(join(staticPath, 'index.html'));
  });
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  if (NODE_ENV === 'development') {
    console.log(`API available at: http://localhost:${PORT}/api/todos`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    closeDatabase();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    closeDatabase();
    process.exit(0);
  });
});
