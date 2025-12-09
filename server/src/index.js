const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chatbotsRoutes = require('./routes/chatbots');
const templatesRoutes = require('./routes/templates');
const conversationsRoutes = require('./routes/conversations');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/chatbots', chatbotsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/analytics-dashboard', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
