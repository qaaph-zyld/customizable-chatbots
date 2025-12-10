const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const chatbotsRoutes = require('./routes/chatbots');
const templatesRoutes = require('./routes/templates');
const conversationsRoutes = require('./routes/conversations');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Check if Supabase is configured
const isSupabaseConfigured = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY;

if (isSupabaseConfigured) {
  // New Supabase-based routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/chatbots', require('./routes/chatbots.new'));
  app.use('/api/templates', require('./routes/templates.new'));
  app.use('/api/conversations', require('./routes/conversations.new'));
  app.use('/api/analytics-dashboard', require('./routes/analytics.new'));
  app.use('/api/documents', require('./routes/documents'));
  app.use('/api/webhooks', require('./routes/webhooks'));
  app.use('/api/integrations', require('./routes/integrations'));
  app.use('/api/channels', require('./routes/channels'));
  app.use('/api/widget', require('./routes/widget'));
  console.log('✅ Running with Supabase backend');
} else {
  // Fallback to in-memory routes (original MVP)
  app.use('/api/chatbots', chatbotsRoutes);
  app.use('/api/templates', templatesRoutes);
  app.use('/api/conversations', conversationsRoutes);
  app.use('/api/analytics-dashboard', analyticsRoutes);
  console.log('⚠️ Running with in-memory backend (Supabase not configured)');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    supabase: !!isSupabaseConfigured,
    openai: !!process.env.OPENAI_API_KEY
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Customizable Chatbots API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth - Authentication (signup, signin, profile, API keys)',
      chatbots: '/api/chatbots - Chatbot CRUD operations',
      templates: '/api/templates - Template management',
      conversations: '/api/conversations - Chat conversations',
      analytics: '/api/analytics-dashboard - Analytics data',
      documents: '/api/documents - Knowledge base documents (RAG)',
      webhooks: '/api/webhooks - Webhook management',
      integrations: '/api/integrations - Third-party integrations',
      channels: '/api/channels - Multi-channel messaging (WhatsApp, SMS, Messenger)',
      widget: '/api/widget - Embeddable chat widget'
    },
    documentation: 'https://github.com/qaaph-zyld/customizable-chatbots'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message 
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API docs at http://localhost:${PORT}/api`);
  });
}

module.exports = app;
