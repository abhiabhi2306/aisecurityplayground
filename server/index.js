const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const challengeRoutes = require('./routes/challenges');
const aiRoutes = require('./routes/ai');
const progressRoutes = require('./routes/progress');
const { initDatabase } = require('./database/init');
const { validateAzureConfig } = require('./utils/azureConfig');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGeneration: (req) => `${req.ip}_${req.user?.id || 'anonymous'}`,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    azureOpenAI: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION,
      configured: !!process.env.AZURE_OPENAI_API_KEY
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Validate Azure OpenAI configuration
if (!validateAzureConfig()) {
  console.error('Server startup aborted due to configuration errors.');
  process.exit(1);
}

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AI Security Playground Server running on port ${PORT}`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV}`);
    console.log(`🤖 Azure OpenAI Configured: ${process.env.AZURE_OPENAI_ENDPOINT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
